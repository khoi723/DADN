import View from '/views/View.js';

function getCurrentLanguage() {
    if (window.SAIWS_PREFS && typeof window.SAIWS_PREFS.getLanguage === 'function') {
        return window.SAIWS_PREFS.getLanguage();
    }
    return 'en';
}

function localizeSignupMessage(message) {
    if (getCurrentLanguage() !== 'vi') {
        return message;
    }

    const map = {
        'A username is required!': 'Vui lòng nhập tên đăng nhập!',
        'A password is required!': 'Vui lòng nhập mật khẩu!',
        'A confirming password is required!': 'Vui lòng nhập lại mật khẩu!',
        'Password requires at least 8 characters!': 'Mật khẩu phải có ít nhất 8 ký tự!',
        'Passwords do not match!': 'Mật khẩu xác nhận không khớp!',
        'All fields (username, email, password) are required!': 'Vui lòng nhập đầy đủ tên đăng nhập, email và mật khẩu!',
        'The username or email has been used!': 'Tên đăng nhập hoặc email đã được sử dụng!',
        'Account was created successfully': 'Tạo tài khoản thành công.',
        'Internal Server Error!': 'Lỗi hệ thống máy chủ.',
        'Server connection failed!': 'Kết nối máy chủ thất bại!'
    };

    return map[message] || message;
}

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
        if (!username) return View.showError(localizeSignupMessage("A username is required!"));
        if (!password) return View.showError(localizeSignupMessage("A password is required!"));
        if (!confirmPassword) return View.showError(localizeSignupMessage("A confirming password is required!"));

        // --- AF2 (Bước 2): Kiểm tra định dạng mật khẩu ---
        if (password.length < 8) {
            return View.showError(localizeSignupMessage("Password requires at least 8 characters!"));
        }

        // --- AF3 (Bước 3): Kiểm tra so khớp mật khẩu ---
        if (password !== confirmPassword) {
            return View.showError(localizeSignupMessage("Passwords do not match!"));
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
                View.showSuccess(localizeSignupMessage(data.message));

                setTimeout(() => {
                    window.location.href = '../views/login.html';
                }, 2000);

            }
            else {
                View.showError(localizeSignupMessage(data.message));
            }

        } catch (error) {
            // Xử lý lỗi kết nối
            View.showError(localizeSignupMessage("Server connection failed!"));
        }
    });
});