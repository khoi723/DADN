const AuthModel = {
    // State nội bộ (Dữ liệu trong bộ nhớ tạm)
    state: {
        // Khi load file, thử lấy token từ localStorage ra trước
        token: localStorage.getItem('userToken') || null,
        isLoggedIn: !!localStorage.getItem('userToken'),
    },
    // Hàm cập nhật Token (Tiếp nhận từ Controller)
    setToken(token) {
        this.state.token = token;
        this.state.isLoggedIn = !!token;
        if (token) {
            localStorage.setItem('userToken', token);
        }
    },

    // Hàm lấy Token (Để các trang khác sử dụng)
    getToken() {
        return this.state.token;
    },



    // Hàm xóa sạch dữ liệu (Logout)
    clearAuth() {
        this.state.token = null;
        this.state.isLoggedIn = false;
        localStorage.removeItem('userToken');
    }
};

// Xuất Model để Controller sử dụng
export default AuthModel;