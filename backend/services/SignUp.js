module.exports = (DB) => {
    return {
        signup: async (req, res) => {
            const { username, email, password } = req.body;

            // Kiểm tra sơ bộ dữ liệu gửi lên từ Http client
            if (!username || !password || !email) {
                return res.status(400).json({ 
                    message: "All fields (username, email, password) are required!" 
                });
            }

            try {
                // AF4: Kiểm tra xem username đã tồn tại trong database chưa
                const [existingUser] = await DB.execute(
                    'SELECT * FROM users WHERE username = ? LIMIT 1',
                    [username]
                );

                if (existingUser.length > 0) {
                    // 5.1 & 5.2: Trả về lỗi nếu username đã được sử dụng
                    return res.status(409).json({ 
                        message: "The username has been used!" 
                    });
                }

                // BƯỚC 5: Http server gửi request tới database để tạo tài khoản
                const [result] = await DB.execute(
                    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                    [username, email, password]
                );

                // Kiểm tra nếu việc chèn dữ liệu thành công
                if (result.affectedRows > 0) {
                    // Trả về thành công cho Http client
                    return res.status(201).json({
                        message: "Account was created successfully"
                    });
                } else {
                    return res.status(500).json({ message: "Fail to register new account into database!"});
                }

            } catch (error) {
                // Xử lý lỗi hệ thống hoặc lỗi kết nối DB
                return res.status(500).json({
                    message: "Internal Server Error!"
                });
            }
        }
    };
};