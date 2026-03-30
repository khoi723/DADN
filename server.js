const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const dbConfig = require('./db.config');

const app = express();
const PORT = process.env.PORT || 3000;
const frontend = path.join(__dirname, 'frontend');

function sendPage(name) {
  return (req, res) => res.sendFile(path.join(frontend, 'pages', `${name}.html`));
}

/** Pretty URLs without .html (static middleware only maps exact filenames). */
app.get('/pages/history', sendPage('history'));
app.get('/pages/dashboard', sendPage('dashboard'));
app.get('/pages/settings', sendPage('settings'));

async function getConnection() {
  return mysql.createConnection({
    host: dbConfig.host,
    port: Number(dbConfig.port) || 3306,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
  });
}

app.use(express.static(frontend));

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
       LIMIT 200`
    );
    res.json({ ok: true, rows });
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
       LIMIT 200`
    );
    res.json({ ok: true, rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Database error', detail: err.message });
  } finally {
    if (conn) await conn.end();
  }
});

app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT}`);
  console.log(`History: http://localhost:${PORT}/pages/history or .../history.html`);
});
