const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const https = require('https');
const jwt = require('jsonwebtoken');
const dbConfig = require('./config/db.config');
const authMiddleware = require('./middleware/authMiddleware');
const createProfileService = require('./services/Profile');

const app = express();
const PORT = process.env.PORT || 3000;
const frontend = path.join(__dirname, '..', 'frontend');
// R385 pump spec is around 1-2 L/min, use midpoint by default and allow override from env.
const PUMP_FLOW_RATE_LPM = Number(process.env.PUMP_FLOW_RATE_LPM || 1.5);

function sendPage(name) {
  return (req, res) => res.sendFile(path.join(frontend, 'pages', `${name}.html`));
}

// Default landing page for localhost root.
app.get('/', (req, res) => {
  res.sendFile(path.join(frontend, 'views', 'login.html'));
});

// Backward-compatible aliases for login page links.
app.get('/login', (req, res) => {
  res.redirect('/views/login.html');
});

app.get('/login.html', (req, res) => {
  res.redirect('/views/login.html');
});

/** Pretty URLs without .html (static middleware only maps exact filenames). */
app.get('/pages/history', sendPage('history'));
app.get('/pages/dashboard', sendPage('dashboard'));
app.get('/pages/profile', sendPage('profile'));

async function getConnection() {
  return mysql.createConnection({
    host: dbConfig.host,
    port: Number(dbConfig.port) || 3306,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
  });
}

const profileDB = {
  execute: async (query, params = []) => {
    let conn;
    try {
      conn = await getConnection();
      return await conn.execute(query, params);
    } finally {
      if (conn) await conn.end();
    }
  }
};

const profileService = createProfileService(profileDB);

app.use(express.static(frontend));
app.use(express.json());

// Profile routes (protected)
app.get('/profile', authMiddleware, profileService.getProfile);
app.put('/profile/username', authMiddleware, profileService.updateUsername);
app.put('/profile/email', authMiddleware, profileService.updateEmail);
app.put('/profile/password', authMiddleware, profileService.updatePassword);
app.put('/profile/language', authMiddleware, profileService.updateLanguage);
app.put('/profile/theme', authMiddleware, profileService.updateTheme);

app.post('/login', async (req, res) => {
  let conn;
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required!' });
    }

    conn = await getConnection();
    const [rows] = await conn.execute(
      `SELECT ID, username, email, password
       FROM Users
       WHERE username = ? OR email = ?
       LIMIT 1`,
      [username, username]
    );

    const user = rows[0];
    if (!user) {
      return res.status(401).json({ message: 'Username was not recognized!' });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: 'The given password is incorrect!' });
    }

    const token = jwt.sign(
      { id: user.ID, username: user.username },
      process.env.JWT_SECRET || 'SAIWS_SECRET',
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      message: 'Logging in is done successfully',
      token,
    });
  } catch (error) {
    console.error('Login route error:', error.message);
    return res.status(500).json({ message: 'Internal Server Error!' });
  } finally {
    if (conn) await conn.end();
  }
});

app.post('/signup', async (req, res) => {
  let conn;
  try {
    const { username, email, password } = req.body || {};
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields (username, email, password) are required!' });
    }

    conn = await getConnection();
    const [existing] = await conn.execute(
      `SELECT ID
       FROM Users
       WHERE username = ? OR email = ?
       LIMIT 1`,
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'The username or email has been used!' });
    }

    await conn.execute(
      `INSERT INTO Users (username, email, password)
       VALUES (?, ?, ?)`,
      [username, email, password]
    );

    return res.status(201).json({ message: 'Account was created successfully' });
  } catch (error) {
    console.error('Signup route error:', error.message);
    return res.status(500).json({ message: 'Internal Server Error!' });
  } finally {
    if (conn) await conn.end();
  }
});

app.get('/api/history/irrigation', async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const [rows] = await conn.execute(
      `SELECT device_id,
              start_at,
              end_at
       FROM Pump_actions
       WHERE start_at IS NOT NULL
       ORDER BY start_at DESC
       LIMIT 10`
    );
    res.json({ ok: true, rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Database error', detail: err.message });
  } finally {
    if (conn) await conn.end();
  }
});

app.get('/api/irrigation/usage', async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const requestedLimit = parseInt(req.query.limit, 10);
    const limit = Number.isFinite(requestedLimit)
      ? Math.max(1, Math.min(requestedLimit, 200))
      : 20;
    const flowRate = Number.isFinite(PUMP_FLOW_RATE_LPM) ? PUMP_FLOW_RATE_LPM : 1.5;
    const [rows] = await conn.execute(
      `SELECT device_id,
              start_at,
              end_at
       FROM Pump_actions
       WHERE start_at IS NOT NULL
         AND end_at IS NOT NULL
       ORDER BY start_at DESC
       LIMIT ${limit}`
    );

    const sessions = rows
      .map((row) => {
        const start = new Date(row.start_at);
        const end = new Date(row.end_at);
        const durationSeconds = Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000));
        const durationMinutes = Math.round((durationSeconds / 60) * 100) / 100;
        const waterLiters = Math.round(durationMinutes * flowRate * 100) / 100;

        return {
          device_id: row.device_id,
          start_at: row.start_at,
          end_at: row.end_at,
          duration_minutes: durationMinutes,
          water_liters: waterLiters,
        };
      })
      .reverse();

    res.json({ ok: true, flow_rate_lpm: flowRate, sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Database error', detail: err.message });
  } finally {
    if (conn) await conn.end();
  }
});

app.get('/api/history/alerts', async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const [rows] = await conn.execute(
      `SELECT device_id,
              message AS content,
              created_at
       FROM Alert
       ORDER BY created_at DESC
       LIMIT 10`
    );
    res.json({ ok: true, rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Database error', detail: err.message });
  } finally {
    if (conn) await conn.end();
  }
});

// Get latest sensor data for dashboard
app.get('/api/dashboard/data', async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const [rows] = await conn.execute(
      `SELECT device_id,
              temperature,
              humidity,
              soil_moisture,
              recorded_at
       FROM Sensor_logs
       ORDER BY recorded_at DESC
       LIMIT 1`
    );
    res.json({ ok: true, data: rows[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Database error', detail: err.message });
  } finally {
    if (conn) await conn.end();
  }
});

// Get motor status
app.get('/api/motor/status', async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const [rows] = await conn.execute(
      `SELECT device_id,
              CASE 
                WHEN end_at IS NULL THEN 'running'
                ELSE 'stopped'
              END AS status,
              start_at,
              end_at
       FROM Pump_actions
       ORDER BY start_at DESC
       LIMIT 1`
    );
    res.json({ ok: true, motor: rows[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Database error', detail: err.message });
  } finally {
    if (conn) await conn.end();
  }
});

// Store last pushed timestamp to only send new data
let lastPushedTimestamp = new Date();

// Server-Sent Events endpoint for real-time updates
app.get('/api/sensor/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Send initial connection message + current last timestamp
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: lastPushedTimestamp })}\n\n`);

  // Send batched updates every 10 seconds (only new records)
  const interval = setInterval(async () => {
    try {
      const conn = await getConnection();

      // Query ONLY records since last push to save bandwidth
      const [rows] = await conn.execute(`
        SELECT device_id, temperature, humidity, soil_moisture, recorded_at 
        FROM Sensor_logs 
        WHERE recorded_at > ?
        ORDER BY recorded_at ASC
      `, [lastPushedTimestamp]);

      if (rows.length > 0) {
        lastPushedTimestamp = rows[rows.length - 1].recorded_at;
        res.write(`data: ${JSON.stringify({ type: 'batch', records: rows, count: rows.length })}\n\n`);
      }

      await conn.end();
    } catch (err) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
    }
  }, 3000); // Batch every 3 seconds

  // Cleanup on disconnect
  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});

// Get recent sensor history for dashboard charts
app.get('/api/sensor/history', async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const limit = Math.min(parseInt(req.query.limit) || 24, 1000); // Default 24, max 1000
    const query = `SELECT device_id,
                          temperature,
                          humidity,
                          soil_moisture,
                          recorded_at
                   FROM Sensor_logs
                   ORDER BY recorded_at DESC
                   LIMIT ${limit}`;
    const [rows] = await conn.execute(query);
    // Reverse to get chronological order (oldest to newest)
    const sorted = rows.reverse();
    res.json({ ok: true, history: sorted });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Database error', detail: err.message });
  } finally {
    if (conn) await conn.end();
  }
});

// Debug: Get database stats
app.get('/api/debug/stats', async (req, res) => {
  let conn;
  try {
    conn = await getConnection();

    // Count total records
    const [[countResult]] = await conn.execute('SELECT COUNT(*) as total FROM Sensor_logs');

    // Get latest 5 records
    const [latestRecords] = await conn.execute(`
      SELECT device_id, temperature, humidity, soil_moisture, recorded_at 
      FROM Sensor_logs 
      ORDER BY recorded_at DESC 
      LIMIT 5
    `);

    // Get min/max recorded_at times
    const [[timeRange]] = await conn.execute(`
      SELECT 
        MIN(recorded_at) as earliest, 
        MAX(recorded_at) as latest 
      FROM Sensor_logs
    `);

    res.json({
      ok: true,
      total_records: countResult.total,
      earliest_record: timeRange?.earliest,
      latest_record: timeRange?.latest,
      latest_5_records: latestRecords
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.end();
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Server is running' });
});

// ============ MOTOR CONTROL (Server-side Automation) ============

// Motor control settings (default values)
let motorSettings = {
  onCondition: 'above',      // 'above' = moisture < onValue triggers watering
  onValue: 30,               // Turn ON if moisture < 30%
  offCondition: 'below',     // 'below' = moisture > offValue stops watering
  offValue: 40,              // Turn OFF if moisture > 40%
  enabled: true              // Enable/disable auto motor control
};

// Track current motor state
let currentMotorState = {
  status: 0,                 // 0 = OFF, 1 = ON
  lastUpdate: null
};

// Keep alert creation stable to avoid duplicate inserts every 3 seconds.
let lastAutoAlertType = null; // 'low' | 'high' | null
let lastAutoAlertAt = 0;
const AUTO_ALERT_COOLDOWN_MS = 5 * 60 * 1000;

// Firebase HTTPS helper to update MOTOR status
function updateFirebaseMotorStatus(status) {
  const motorValue = status ? 1 : 0;
  const postData = JSON.stringify(motorValue);

  const options = {
    hostname: 'dadn252-default-rtdb.asia-southeast1.firebasedatabase.app',
    path: '/MOTOR/status.json',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(options, (res) => {
    if (res.statusCode === 200) {
      currentMotorState.status = motorValue;
      currentMotorState.lastUpdate = new Date();
    }
  });

  req.on('error', (error) => {
    // Silent error handling
  });

  req.write(postData);
  req.end();
}

async function insertAutoAlertIfNeeded(conn, deviceId, type, moisture) {
  const now = Date.now();
  const shouldInsert =
    lastAutoAlertType !== type ||
    now - lastAutoAlertAt >= AUTO_ALERT_COOLDOWN_MS;

  if (!shouldInsert) return;

  const roundedMoisture = Number(moisture).toFixed(2);
  const message = type === 'low'
    ? `Soil moisture is too low (${roundedMoisture}%). Auto started irrigation.`
    : `Soil moisture is too high (${roundedMoisture}%). Auto stopped irrigation.`;

  await conn.execute(
    `INSERT INTO Alert (device_id, alert_type, message, is_read, created_at)
     VALUES (?, 'moisture', ?, FALSE, NOW())`,
    [deviceId, message]
  );

  lastAutoAlertType = type;
  lastAutoAlertAt = now;
}

// Check moisture condition and control motor
async function checkMoistureAndControlMotor() {
  let pool;
  let conn;
  try {
    if (!motorSettings.enabled) return;

    // Get latest soil moisture from database
    pool = await mysql.createPool({
      host: dbConfig.host,
      port: Number(dbConfig.port) || 3306,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database
    });

    conn = await pool.getConnection();
    const [rows] = await conn.execute(
      'SELECT device_id, soil_moisture FROM Sensor_logs ORDER BY recorded_at DESC LIMIT 1'
    );

    if (rows.length === 0) return;

    const deviceId = rows[0].device_id || 1;
    const moisture = rows[0].soil_moisture;
    if (moisture === null || moisture === undefined) return;

    // Check conditions
    const needsWatering = motorSettings.onCondition === 'above'
      ? moisture < motorSettings.onValue
      : moisture > motorSettings.onValue;

    const isOverMoisture = motorSettings.offCondition === 'below'
      ? moisture > motorSettings.offValue
      : moisture < motorSettings.offValue;

    // Determine motor action
    if (isOverMoisture) {
      // Turn OFF motor when moisture exceeds upper limit (always enforce)
      updateFirebaseMotorStatus(false);
      await insertAutoAlertIfNeeded(conn, deviceId, 'high', moisture);
    } else if (needsWatering) {
      // Turn ON motor when moisture below lower limit (always enforce)
      updateFirebaseMotorStatus(true);
      await insertAutoAlertIfNeeded(conn, deviceId, 'low', moisture);
    } else {
      // Reset state so next crossing can create a new alert entry.
      lastAutoAlertType = null;
    }
    // else: moisture between thresholds, keep current state

  } catch (error) {
    // Silent error handling
  } finally {
    if (conn) conn.release();
    if (pool) await pool.end();
  }
}

// API: Get motor settings
app.get('/api/motor/settings', (req, res) => {
  res.json({ ok: true, settings: motorSettings });
});

// API: Update motor settings
app.post('/api/motor/settings', express.json(), (req, res) => {
  try {
    if (req.body.onValue !== undefined) motorSettings.onValue = parseFloat(req.body.onValue);
    if (req.body.offValue !== undefined) motorSettings.offValue = parseFloat(req.body.offValue);
    if (req.body.onCondition !== undefined) motorSettings.onCondition = req.body.onCondition;
    if (req.body.offCondition !== undefined) motorSettings.offCondition = req.body.offCondition;
    if (req.body.enabled !== undefined) motorSettings.enabled = Boolean(req.body.enabled);

    res.json({ ok: true, message: 'Motor settings updated', settings: motorSettings });
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

// API: Get current motor state
app.get('/api/motor/state', (req, res) => {
  res.json({ ok: true, state: currentMotorState });
});

// API: Manually control motor (override auto)
app.post('/api/motor/control', express.json(), (req, res) => {
  try {
    const { action } = req.body; // 'on' or 'off'
    if (action === 'on' || action === 1) {
      updateFirebaseMotorStatus(true);
      res.json({ ok: true, message: 'Motor turned ON', status: 1 });
    } else if (action === 'off' || action === 0) {
      updateFirebaseMotorStatus(false);
      res.json({ ok: true, message: 'Motor turned OFF', status: 0 });
    } else {
      res.status(400).json({ ok: false, error: 'Invalid action' });
    }
  } catch (error) {
    res.status(400).json({ ok: false, error: error.message });
  }
});

app.listen(PORT, () => {
  // Start motor control automation (check every 3 seconds)
  // Run immediately on startup, then check every 3 seconds
  checkMoistureAndControlMotor();
  setInterval(checkMoistureAndControlMotor, 3000);
  console.log(`Server http://localhost:${PORT}`);
});
