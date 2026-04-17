/**
 * Firebase Real-time Database Sync
 * Listens to sensor data from Firebase and saves to MySQL
 * Uses Firebase REST API - NO SDK needed!
 */

const mysql = require('mysql2/promise');
const dbConfig = require('./db.config');
const https = require('https');

// Firebase database URL (same as in Devices.js)
const FIREBASE_URL = 'https://dadn252-default-rtdb.asia-southeast1.firebasedatabase.app/';

// Connection pool for MySQL
let pool;

async function initDatabase() {
  pool = await mysql.createPool({
    host: dbConfig.host,
    port: Number(dbConfig.port) || 3306,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
  });
}

/**
 * Fetch data from Firebase REST API
 */
function fetchFromFirebase(path) {
  return new Promise((resolve, reject) => {
    const url = `${FIREBASE_URL}${path}.json`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

/**
 * Insert or update sensor data in Sensor_logs
 * Maps Firebase data to database schema
 */
async function saveSensorData(temperature, humidity, soilMoisture) {
  try {
    const conn = await pool.getConnection();
    
    // Get latest device_id (default: 1 for first sensor)
    const [devices] = await conn.execute('SELECT id FROM Devices LIMIT 1');
    const deviceId = devices.length > 0 ? devices[0].id : 1;
    
    // Insert new sensor log record
    await conn.execute(
      `INSERT INTO Sensor_logs 
       (device_id, temperature, humidity, soil_moisture, recorded_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      [deviceId, temperature, humidity, soilMoisture]
    );
    
    conn.release();
  } catch (error) {
    console.error('❌ Error saving sensor data:', error.message);
  }
}

/**
 * Handle motor status changes
 * When motor starts/stops, record in Pump_actions table
 */
async function handleMotorStatusChange(status) {
  try {
    const conn = await pool.getConnection();
    
    // Get device_id
    const [devices] = await conn.execute('SELECT id FROM Devices LIMIT 1');
    const deviceId = devices.length > 0 ? devices[0].id : 1;
    
    if (status === 1) {
      // Motor started - insert new record with start_at
      await conn.execute(
        `INSERT INTO Pump_actions (device_id, start_at) VALUES (?, NOW())`,
        [deviceId]
      );
    } else if (status === 0) {
      // Motor stopped - update latest record with end_at
      await conn.execute(
        `UPDATE Pump_actions 
         SET end_at = NOW() 
         WHERE device_id = ? AND end_at IS NULL
         ORDER BY start_at DESC 
         LIMIT 1`,
        [deviceId]
      );
    }
    
    conn.release();
  } catch (error) {
    console.error('❌ Error handling motor status:', error.message);
  }
}

// Track previous motor status to detect changes
let previousMotorStatus = null;

/**
 * Fetch and sync all sensor data from Firebase
 */
async function syncFirebaseData() {
  try {
    // Fetch DHT11 (Temperature & Humidity)
    const dht11Data = await fetchFromFirebase('DHT11');
    if (dht11Data) {
      global.currentTemp = dht11Data.temp || 0;
      global.currentHumi = dht11Data.humi || 0;
    }
    
    // Fetch SOIL (Moisture)
    const soilData = await fetchFromFirebase('SOIL');
    if (soilData) {
      global.currentMoist = soilData.moist || 0;
    }
    
    // Save sensor data if we have all values
    if (typeof global.currentTemp !== 'undefined' && 
        typeof global.currentHumi !== 'undefined' && 
        typeof global.currentMoist !== 'undefined') {
      await saveSensorData(global.currentTemp, global.currentHumi, global.currentMoist);
    }
    
    // Fetch MOTOR (Water pump status)
    const motorData = await fetchFromFirebase('MOTOR');
    if (motorData) {
      const status = motorData.status || 0;
      
      // Detect status change
      if (previousMotorStatus !== null && previousMotorStatus !== status) {
        await handleMotorStatusChange(status);
      }
      
      previousMotorStatus = status;
    }
  } catch (error) {
    console.error('❌ Error syncing Firebase data:', error.message);
  }
}

/**
 * Main initialization
 */
async function start() {
  try {
    await initDatabase();
        
    // Sync immediately
    await syncFirebaseData();
    
      // Then sync every 3 seconds
      setInterval(syncFirebaseData, 3000);
    
  } catch (error) {
    console.error('❌ Failed to start Firebase Sync:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  if (pool) await pool.end();
  process.exit(0);
});

// Start the service
start();

module.exports = { saveSensorData, handleMotorStatusChange };
