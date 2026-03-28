const express = require('express');
const admin = require("firebase-admin");
const mysql = require('mysql2/promise'); // Bổ sung thư viện MySQL

// =================================================================
// 1. KHỞI TẠO FIREBASE (SPEED LAYER / BUFFER LAYER)
// =================================================================
const serviceAccount = require("./dadn252-firebase-adminsdk-fbsvc-f5ceba380b.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://dadn252-default-rtdb.asia-southeast1.firebasedatabase.app" 
});

// Biến đại diện cho Firebase Realtime DB
const speedDB = admin.database(); 

// =================================================================
// 2. KHỞI TẠO MYSQL (PERSISTENT LAYER) BẰNG CONNECTION POOL
// =================================================================
const DB = mysql.createPool({
    host: 'localhost',
    user: 'root',          
    password: 'mysql', // Hãy đảm bảo mật khẩu này khớp với máy của bạn
    database: 'smartgardendb', // Tên DB được tạo ra từ file setup_db.js
    waitForConnections: true,
    connectionLimit: 10,  // Tối đa 10 kết nối mở ngầm cùng lúc
    queueLimit: 0
});

// Test nhanh xem MySQL có kết nối thành công lúc khởi động không
DB.getConnection()
    .then(connection => {
        console.log("✅ Đã kết nối thành công tới MySQL (Persistent DB)!");
        connection.release(); // Trả kết nối lại cho Pool để chờ API gọi
    })
    .catch(error => {
        console.error("❌ Lỗi kết nối MySQL:", error.message);
    });

// =================================================================
// 3. KHỞI TẠO HTTP SERVER BẰNG EXPRESS
// =================================================================
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// =================================================================
// 4. LOAD CÁC DOMAIN SERVICES VÀ BƠM DATABASE VÀO
// =================================================================
// Xử lý Login
const loginHandler = require('./services/Login')(DB);

// =================================================================
// 5. ĐỊNH NGHĨA CÁC ĐƯỜNG DẪN API (ROUTING)
// =================================================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'..', 'frontend', 'views', 'login.html'));
});
app.post('/login', loginHandler.login);

// =================================================================
// 6. BẬT SERVER LẮNG NGHE
// =================================================================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy ổn định tại http://localhost:${PORT}`);
});