/**
 * Kiểm tra kết nối MySQL (đọc .env + db.config).
 * Chạy: node check-db.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql = require('mysql2/promise');
const db = require('./db.config');

(async () => {
  const opts = {
    host: db.host,
    port: Number(db.port) || 3306,
    user: db.user,
    password: db.password,
  };
  console.log('Trying:', opts.user + '@' + opts.host + ':' + opts.port, '(password ' + (opts.password === '' ? 'empty' : 'set') + ')');
  try {
    const c = await mysql.createConnection(opts);
    await c.ping();
    console.log('OK — MySQL accepted this login. You can run: npm start');
    await c.end();
    process.exit(0);
  } catch (e) {
    console.error('FAIL —', e.code || '', e.message);
    console.error('');
    console.error('Fix: create/edit file .env next to package.json (copy from .env.example).');
    console.error('     DB_PASSWORD must match what you use in MySQL Workbench for this user.');
    process.exit(1);
  }
})();
