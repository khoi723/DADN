const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

/**
 * MySQL — điền mật khẩu đúng trong file `.env` (xem `.env.example`).
 *
 * Lỗi ER_ACCESS_DENIED: mật khẩu sai, sai port, hoặc nhầm user — không phải lỗi Express.
 * Trên Windows nên dùng host 127.0.0.1 (TCP) thay vì localhost (socket/pipe).
 */
module.exports = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  /** Để trống trong .env nếu root không có mật khẩu (một số bản XAMPP). */
  password: process.env.DB_PASSWORD ?? '',
  database: 'SmartGardenDB',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
};
