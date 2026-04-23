(function () {
    const LANG_KEY = 'saiws.language';
    const THEME_KEY = 'saiws.theme';

    const I18N = {
        en: {
            nav_home: 'Home',
            nav_dashboard: 'Dashboard',
            nav_history: 'History',
            nav_profile: 'Profile',
            nav_view_profile: 'View Profile',
            nav_logout: 'Log out',
            user_menu_title: 'Profile',
            watering_needed_title: 'Plants need watering',

            modal_moisture_alert: 'Moisture Alert',
            modal_outside_range: 'Moisture level is outside the configured range!',
            modal_current_moisture: 'Current Moisture:',
            modal_configured_range: 'Configured Range:',
            btn_close: 'Close',

            badge_moisture: 'Moisture:',
            badge_humidity: 'Humidity:',
            badge_temperature: 'Temperature:',

            home_auto: 'Automatic',
            home_manual: 'Manual',
            home_lower_border: 'Lower border',
            home_upper_limit: 'Upper limit',
            home_water_pump: 'Water pump',
            home_turn_off_after: 'Turn off after',
            option_above: 'above',
            option_below: 'below',
            option_15_minutes: '15 minutes',
            option_30_minutes: '30 minutes',
            option_1_hour: '1 hour',
            option_2_hours: '2 hours',
            option_never: 'Never',
            condition_above: 'above',
            condition_below: 'below',

            dashboard_title: 'Dashboard',
            dashboard_soil_moisture: 'Soil Moisture',
            dashboard_temperature: 'Temperature',
            dashboard_air_humidity: 'Air Humidity',
            dashboard_water_usage: 'Water Usage',
            stat_current: 'Current',
            stat_average: 'Average',
            stat_max: 'Max',
            stat_min: 'Min',
            chart_label_soil: 'Soil Moisture (%)',
            chart_label_temperature: 'Temperature (°C)',
            chart_label_humidity: 'Air Humidity (%)',
            chart_label_water: 'Water Flow (L)',
            chart_no_irrigation_data: 'No irrigation sessions yet',

            history_title: 'History',
            history_irrigation: 'Irrigation History',
            history_alert: 'Alert History',
            col_date: 'Date',
            col_start: 'Start',
            col_end: 'End',
            col_time: 'Time',
            col_content: 'Content',
            col_device_id: 'Device ID',
            history_loading: 'Loading...',
            history_no_irrigation: 'No irrigation records yet.',
            history_no_alert: 'No alerts yet.',
            history_load_error: 'Could not load data. Is the server running (npm start) and MySQL configured?',

            profile_title: 'Profile',
            profile_reload: 'Reload Profile',
            profile_username: 'Username',
            profile_email: 'Email',
            profile_password: 'Password',
            profile_language: 'Language',
            profile_theme: 'Theme',
            profile_save: 'Save',
            profile_password_note: 'New password must be at least 6 characters.',
            profile_placeholder_new_username: 'Enter new username',
            profile_placeholder_new_email: 'Enter new email',
            profile_placeholder_old_password: 'Old password',
            profile_placeholder_new_password: 'New password',
            language_en: 'English (en)',
            language_vi: 'Vietnamese (vi)',
            theme_light: 'Light',
            theme_dark: 'Dark',
            profile_loaded_success: 'Profile loaded successfully.',
            profile_username_updated: 'Username updated successfully.',
            profile_email_updated: 'Email updated successfully.',
            profile_password_updated: 'Password updated successfully.',
            profile_language_updated: 'Language updated successfully.',
            profile_theme_updated: 'Theme updated successfully.',
            profile_no_token: 'No auth token found in localStorage/sessionStorage. Please login first.',
            profile_close_status: 'Close notification',
            warning_moisture_high: 'Moisture is too high ({condition} {value}%).',

            login_left_title: 'Smart Automatic Irrigation Web System',
            login_welcome: 'Welcome to SAIWS!',
            login_label_username_or_email: 'Username or Email',
            login_label_password: 'Password',
            login_button: 'Login',
            login_no_account: "Don't have any accounts?",
            login_register: 'Register',
            login_toggle_password: 'Show/hide password',

            signup_title: 'Create your account',
            signup_label_username: 'Username',
            signup_label_email: 'Email',
            signup_label_password: 'Password',
            signup_label_confirm_password: 'Enter your password again',
            signup_button: 'Sign up'
        },
        vi: {
            nav_home: 'Trang chủ',
            nav_dashboard: 'Bảng điều khiển',
            nav_history: 'Lịch sử',
            nav_profile: 'Hồ sơ',
            nav_view_profile: 'Xem hồ sơ',
            nav_logout: 'Đăng xuất',
            user_menu_title: 'Hồ sơ',
            watering_needed_title: 'Cây đang cần tưới nước',

            modal_moisture_alert: 'Cảnh báo độ ẩm',
            modal_outside_range: 'Độ ẩm đất đang nằm ngoài ngưỡng đã cài đặt!',
            modal_current_moisture: 'Độ ẩm hiện tại:',
            modal_configured_range: 'Ngưỡng đã cài đặt:',
            btn_close: 'Đóng',

            badge_moisture: 'Độ ẩm đất:',
            badge_humidity: 'Độ ẩm không khí:',
            badge_temperature: 'Nhiệt độ:',

            home_auto: 'Tự động',
            home_manual: 'Thủ công',
            home_lower_border: 'Ngưỡng dưới',
            home_upper_limit: 'Ngưỡng trên',
            home_water_pump: 'Máy bơm nước',
            home_turn_off_after: 'Tắt sau',
            option_above: 'lớn hơn',
            option_below: 'nhỏ hơn',
            option_15_minutes: '15 phút',
            option_30_minutes: '30 phút',
            option_1_hour: '1 giờ',
            option_2_hours: '2 giờ',
            option_never: 'Không bao giờ',
            condition_above: 'lớn hơn',
            condition_below: 'nhỏ hơn',

            dashboard_title: 'Bảng điều khiển',
            dashboard_soil_moisture: 'Độ ẩm đất',
            dashboard_temperature: 'Nhiệt độ',
            dashboard_air_humidity: 'Độ ẩm không khí',
            dashboard_water_usage: 'Lượng nước sử dụng',
            stat_current: 'Hiện tại',
            stat_average: 'Trung bình',
            stat_max: 'Cao nhất',
            stat_min: 'Thấp nhất',
            chart_label_soil: 'Độ ẩm đất (%)',
            chart_label_temperature: 'Nhiệt độ (°C)',
            chart_label_humidity: 'Độ ẩm không khí (%)',
            chart_label_water: 'Lưu lượng nước (L)',
            chart_no_irrigation_data: 'Chưa có phiên tưới nào',

            history_title: 'Lịch sử',
            history_irrigation: 'Lịch sử tưới nước',
            history_alert: 'Lịch sử cảnh báo',
            col_date: 'Ngày',
            col_start: 'Bắt đầu',
            col_end: 'Kết thúc',
            col_time: 'Giờ',
            col_content: 'Nội dung',
            col_device_id: 'ID thiết bị',
            history_loading: 'Đang tải...',
            history_no_irrigation: 'Chưa có bản ghi tưới nước.',
            history_no_alert: 'Chưa có cảnh báo.',
            history_load_error: 'Không thể tải dữ liệu. Hãy kiểm tra server (npm start) và cấu hình MySQL.',

            profile_title: 'Hồ sơ',
            profile_reload: 'Tải lại hồ sơ',
            profile_username: 'Tên đăng nhập',
            profile_email: 'Email',
            profile_password: 'Mật khẩu',
            profile_language: 'Ngôn ngữ',
            profile_theme: 'Giao diện',
            profile_save: 'Lưu',
            profile_password_note: 'Mật khẩu mới phải có ít nhất 6 ký tự.',
            profile_placeholder_new_username: 'Nhập tên đăng nhập mới',
            profile_placeholder_new_email: 'Nhập email mới',
            profile_placeholder_old_password: 'Mật khẩu cũ',
            profile_placeholder_new_password: 'Mật khẩu mới',
            language_en: 'Tiếng Anh (en)',
            language_vi: 'Tiếng Việt (vi)',
            theme_light: 'Sáng',
            theme_dark: 'Tối',
            profile_loaded_success: 'Đã tải thông tin hồ sơ thành công.',
            profile_username_updated: 'Đã cập nhật tên đăng nhập thành công.',
            profile_email_updated: 'Đã cập nhật email thành công.',
            profile_password_updated: 'Đã cập nhật mật khẩu thành công.',
            profile_language_updated: 'Đã cập nhật ngôn ngữ thành công.',
            profile_theme_updated: 'Đã cập nhật giao diện thành công.',
            profile_no_token: 'Không tìm thấy auth token trong localStorage/sessionStorage. Vui lòng đăng nhập trước.',
            profile_close_status: 'Đóng thông báo',
            warning_moisture_high: 'Độ ẩm quá cao ({condition} {value}%).',

            login_left_title: 'Hệ thống tưới nước tự động thông minh',
            login_welcome: 'Chào mừng đến với SAIWS!',
            login_label_username_or_email: 'Tên đăng nhập hoặc Email',
            login_label_password: 'Mật khẩu',
            login_button: 'Đăng nhập',
            login_no_account: 'Bạn chưa có tài khoản?',
            login_register: 'Đăng ký',
            login_toggle_password: 'Ẩn/hiện mật khẩu',

            signup_title: 'Tạo tài khoản của bạn',
            signup_label_username: 'Tên đăng nhập',
            signup_label_email: 'Email',
            signup_label_password: 'Mật khẩu',
            signup_label_confirm_password: 'Nhập lại mật khẩu',
            signup_button: 'Đăng ký'
        }
    };

    function normalizeLanguage(language) {
        return language === 'vi' ? 'vi' : 'en';
    }

    function normalizeTheme(theme) {
        return theme === 'dark' ? 'dark' : 'light';
    }

    function getLanguage() {
        return normalizeLanguage(localStorage.getItem(LANG_KEY) || localStorage.getItem('language') || 'en');
    }

    function getTheme() {
        return normalizeTheme(localStorage.getItem(THEME_KEY) || localStorage.getItem('theme') || 'light');
    }

    function format(template, params) {
        if (!params) return template;
        return template.replace(/\{(\w+)\}/g, function (_, key) {
            return Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : '';
        });
    }

    function t(key) {
        const lang = getLanguage();
        return I18N[lang][key] || I18N.en[key] || key;
    }

    function tf(key, params) {
        return format(t(key), params);
    }

    function applyLanguage() {
        document.documentElement.setAttribute('lang', getLanguage());

        document.querySelectorAll('[data-i18n]').forEach(function (node) {
            node.textContent = t(node.getAttribute('data-i18n'));
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(function (node) {
            node.setAttribute('placeholder', t(node.getAttribute('data-i18n-placeholder')));
        });

        document.querySelectorAll('[data-i18n-title]').forEach(function (node) {
            node.setAttribute('title', t(node.getAttribute('data-i18n-title')));
        });
    }

    function applyTheme() {
        document.documentElement.setAttribute('data-theme', getTheme());
    }

    function setLanguage(language) {
        const normalized = normalizeLanguage(language);
        localStorage.setItem(LANG_KEY, normalized);
        localStorage.setItem('language', normalized);
        applyLanguage();
        return normalized;
    }

    function setTheme(theme) {
        const normalized = normalizeTheme(theme);
        localStorage.setItem(THEME_KEY, normalized);
        localStorage.setItem('theme', normalized);
        applyTheme();
        return normalized;
    }

    window.SAIWS_PREFS = {
        getLanguage: getLanguage,
        setLanguage: setLanguage,
        getTheme: getTheme,
        setTheme: setTheme,
        applyLanguage: applyLanguage,
        applyTheme: applyTheme,
        t: t,
        tf: tf
    };

    applyTheme();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyLanguage);
    } else {
        applyLanguage();
    }
})();
