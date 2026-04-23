import AuthModel from '/models/AuthModel.js';
import View from '/views/View.js';

function getCurrentLanguage() {
    if (window.SAIWS_PREFS && typeof window.SAIWS_PREFS.getLanguage === 'function') {
        return window.SAIWS_PREFS.getLanguage();
    }
    return 'en';
}

function localizeLoginMessage(message) {
    if (getCurrentLanguage() !== 'vi') {
        return message;
    }

    const map = {
        'Username and password are required!': 'Vui lòng nhập tên đăng nhập và mật khẩu.',
        'Username was not recognized!': 'Không tìm thấy tên đăng nhập.',
        'The given password is incorrect!': 'Mật khẩu không đúng.',
        'Internal Server Error!': 'Lỗi hệ thống máy chủ.',
        'Cannot connect to server. Please ensure server is running at localhost:3000.': 'Không thể kết nối đến máy chủ. Vui lòng đảm bảo server đang chạy tại localhost:3000.'
    };

    return map[message] || message;
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    // BƯỚC 1: Lắng nghe sự kiện click nút "OK"
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        View.hideMessage();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            // BƯỚC 2: Gửi request đến HTTP Server
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // Bắt buộc phải có để Backend hiểu JSON
                },
                body: JSON.stringify({ username, password })
            });

            const contentType = response.headers.get('content-type') || '';
            const data = contentType.includes('application/json')
                ? await response.json()
                : { message: await response.text() };

            // BƯỚC 3: Xử lý Response
            if (response.ok) {
                // Lưu vào Model
                AuthModel.setToken(data.token);

                if (data.token) {
                    localStorage.setItem('token', data.token);
                    sessionStorage.setItem('token', data.token);
                }

                // Điều hướng sang Home ngay khi login thành công.
                window.location.assign('/index.html');

            }
            else {
                View.showError(localizeLoginMessage(data.message || `Request failed (${response.status})`));
            }
        } catch (error) {
            // Postcondition Failure
            View.showError(localizeLoginMessage("Cannot connect to server. Please ensure server is running at localhost:3000."));
        }
    });
});