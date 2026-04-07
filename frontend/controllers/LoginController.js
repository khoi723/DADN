import AuthModel from '/models/AuthModel.js';
import View from '/views/View.js';

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
                View.showSuccess(data.message);
                
                // Điều hướng sang Homepage
                setTimeout(() => {
                    window.location.href = '../pages/index.html'; 
                }, 1500);

            } 
            else {
                View.showError(data.message);
            }
        } catch (error) {
            // Postcondition Failure
            View.showError("Server connection failed!");
        }
    });
});