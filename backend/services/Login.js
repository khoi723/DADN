const jwt = require('jsonwebtoken');

module.exports = (DB) => {
    return {
        // Hàm xử lý chính cho route POST /login
        login: async (req, res) => {
            const { username, password } = req.body;

            // Kiểm tra đầu vào cơ bản (Sơ cứu dữ liệu)
            if (!username || !password) {
                return res.status(400).json({ 
                    message: "Username and password are required!" 
                });
            }

            try {
                // BƯỚC 2: Http server retrieves the password stored in the database
                // Truy vấn từ MySQL (Persistent Layer) dựa trên username
                [rows] = await DB.execute(
                    'SELECT * FROM Users WHERE username = ? LIMIT 1',
                    [username]
                );

                user = rows[0];
                // Check email if no username
                if (!user){
                    [rows] = await DB.execute(
                    'SELECT * FROM Users WHERE email = ? LIMIT 1',
                    [username]
                );
                    user = rows[0];
                }
                if (!user){
                    return res.status(401).json({
                        message: "Username was not recognized!"
                    });
                }
                // BƯỚC 3: So sánh mật khẩu và phản hồi
                if (user.password === password) {
                    // THÀNH CÔNG: Passwords are the same (HTTP 200 OK)
                    
                    // Tạo một token đơn giản (Sử dụng bí danh 'SAIWS_SECRET')
                    const token = jwt.sign(
                        { id: user.id, username: user.username },
                        'SAIWS_SECRET',
                        { expiresIn: '1h' }
                    );

                    

                    // Trả về token cho Http client (Postcondition Success)
                    return res.status(200).json({
                        message: "Logging in is done successfully",
                        token: token
                    });
                } else {
                    // THẤT BẠI: Server returns HTTP 401 Unauthorized
                    return res.status(401).json({
                        message: "The given password is incorrect!"
                    });
                }

            } catch (error) {
                // Xử lý lỗi hệ thống hoặc kết nối DB thất bại
                console.error("Login Service Error:", error);
                return res.status(500).json({
                    message: "Internal Server Error!"
                });
            }
        }
    };
};