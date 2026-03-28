import AuthModel from '../models/AuthModel.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const messageBox = document.getElementById('message');

    // Đối tượng View: Quản lý hiển thị (Thay thế hàm showMessage dư thừa)
    const view = {
        showSuccess: (text) => {
            messageBox.textContent = text;
            messageBox.className = 'message success';
            messageBox.classList.remove('hidden');
        },
        showError: (text) => {
            messageBox.textContent = text;
            messageBox.className = 'message error';
            messageBox.classList.remove('hidden');
        },
        hideMessage: () => {
            messageBox.classList.add('hidden');
        }
    };

    // BƯỚC 1: Lắng nghe sự kiện click nút "OK"
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        view.hideMessage();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
       
        try {
            // BƯỚC 2: Gửi request đến HTTP Server
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // Bắt buộc phải có để Backend hiểu JSON
                },
                body: JSON.stringify({ username, password })
            });

            console.log("Status từ Server:", response.status);
            const data = await response.json();
            console.log("Dữ liệu JSON từ Server:", data);
            // BƯỚC 3: Xử lý Response
            if (response.status == 200) {
                // Lưu vào Model
                AuthModel.setToken(data.token); 
                // Hiển thị qua View
                view.showSuccess(data.message);
                
                // Điều hướng sang Homepage
                setTimeout(() => {
                    window.location.href = './pages/index.html'; 
                }, 1500);

            } 
            else {
                view.showError(data.message || "An error occurred");
            }
        } catch (error) {
            // Postcondition Failure
            view.showError("Connection failed. Server checking needed!");
        }
    });
});