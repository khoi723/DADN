/**
 * Chèn vài dòng demo vào Pump_actions nếu đang trống (cần đã có Devices).
 * Không xóa database. Chạy: node seed_irrigation_demo.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql = require('mysql2/promise');
const dbConfig = require('./db.config');

(async () => {
  const conn = await mysql.createConnection({
    host: dbConfig.host,
    port: Number(dbConfig.port) || 3306,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
  });

  const [[{ c: n }]] = await conn.execute('SELECT COUNT(*) AS c FROM Pump_actions');
  if (n > 0) {
    console.log('Pump_actions đã có', n, 'bản ghi — không chèn thêm.');
    await conn.end();
    return;
  }

  const [devices] = await conn.execute('SELECT ID FROM Devices ORDER BY ID ASC LIMIT 3');
  if (devices.length === 0) {
    console.log('Chưa có Devices. Chạy: node setup_db.js (hoặc tạo user/device trong DB).');
    await conn.end();
    process.exit(1);
  }

  const d = devices.map((x) => x.ID);
  const d1 = d[0];
  const d2 = d[1] ?? d1;
  const d3 = d[2] ?? d1;

  const rows = [
    [d1, 'on', 'auto', '2026-03-21 08:00:00', '2026-03-21 08:20:00'],
    [d2, 'on', 'manual', '2026-03-14 07:30:00', '2026-03-14 08:20:00'],
    [d1, 'on', 'auto', '2026-03-07 09:10:00', '2026-03-07 09:45:00'],
    [d3, 'on', 'auto', '2026-02-28 17:00:00', '2026-02-28 17:45:00'],
    [d2, 'on', 'auto', '2026-02-21 06:45:00', '2026-02-21 07:00:00'],
    [d1, 'on', 'manual', '2026-02-14 18:10:00', '2026-02-14 18:40:00'],
  ];

  const sql =
    'INSERT INTO Pump_actions (device_id, pump_status, trigger_type, start_at, end_at) VALUES (?, ?, ?, ?, ?)';
  for (const row of rows) {
    await conn.execute(sql, row);
  }
  console.log('Đã chèn', rows.length, 'bản ghi tưới nước demo. Tải lại trang History.');
  await conn.end();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
