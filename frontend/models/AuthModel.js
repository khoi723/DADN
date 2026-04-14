const AuthModel = {
    // State nội bộ (Dữ liệu trong bộ nhớ tạm)
    state: {
        token: null,
        isLoggedIn: false,
    },

    // Hàm cập nhật Token (Tiếp nhận từ Controller)
    setToken(token) {
        this.state.token = token;
        this.state.isLoggedIn = !!token;
        
    },

    // Hàm lấy Token (Để các trang khác sử dụng)
    getToken() {
        return this.state.token;
    },



    // Hàm xóa sạch dữ liệu (Logout)
    clearAuth() {
        this.state.token = null;
        this.state.isLoggedIn = false;
    }
};

// Xuất Model để Controller sử dụng
export default AuthModel;