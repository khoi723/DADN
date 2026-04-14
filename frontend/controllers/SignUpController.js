import View from '/views/View.js';

document.addEventListener('DOMContentLoaded', () => {
    const signUpForm = document.getElementById('registerForm');

    // Bước 1: Triggers - Người dùng nhấn nút "Sign up" (OK)
    signUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        View.hideMessage();

        // Thu thập dữ liệu
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim(); // Thêm email theo giao diện
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // --- AF1: Kiểm tra các trường trống (Empty fields) ---
        if (!username) return View.showError("A username is required!");
        if (!password) return View.showError("A password is required!");
        if (!confirmPassword) return View.showError("A confirming password is required!");

        // --- AF2 (Bước 2): Kiểm tra định dạng mật khẩu ---
        if (password.length < 8) {
            return View.showError("Password requires at least 8 characters!");
        }

        // --- AF3 (Bước 3): Kiểm tra so khớp mật khẩu ---
        if (password !== confirmPassword) {
            return View.showError("Passwords do not match!");
        }

        try {
            // --- Bước 4: Http client gửi request tới http server ---
            const response = await fetch('http://localhost:3000/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (response.status === 201 || response.status === 200) {
                // --- Bước 6: Hiển thị thông báo thành công và điều hướng ---
                View.showSuccess(data.message);
                
                setTimeout(() => {
                    window.location.href = '../views/login.html';
                }, 2000);

            } 
            else {
                View.showError(data.message);
            }

        } catch (error) {
            // Xử lý lỗi kết nối
            View.showError("Server connection failed!");
        }
    });
});