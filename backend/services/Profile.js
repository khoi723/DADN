module.exports = (DB) => {
    return {

        // GET /profile
        // Returns current profile for the logged-in user
        getProfile: async (req, res) => {
            const userId = req.user.id;
            try {
                const [rows] = await DB.execute(
                    'SELECT username, email, theme, language FROM Users WHERE ID = ? LIMIT 1',
                    [userId]
                );
                if (rows.length === 0) {
                    return res.status(404).json({ message: "User not found." });
                }
                return res.status(200).json(rows[0]);
            } catch (error) {
                console.error("getProfile Error:", error);
                return res.status(500).json({ message: "Internal Server Error!" });
            }
        },

        // PUT /profile/username
        // Body: { newUsername }
        updateUsername: async (req, res) => {
            const userId = req.user.id;
            const { newUsername } = req.body;

            if (!newUsername || newUsername.trim() === '') {
                return res.status(400).json({ message: "New username is required." });
            }

            try {
                // Check if username is already taken by another user
                const [existing] = await DB.execute(
                    'SELECT ID FROM Users WHERE username = ? AND ID != ? LIMIT 1',
                    [newUsername, userId]
                );
                if (existing.length > 0) {
                    return res.status(409).json({ message: "Username is already taken." });
                }

                await DB.execute(
                    'UPDATE Users SET username = ? WHERE ID = ?',
                    [newUsername, userId]
                );
                return res.status(200).json({ message: "Username updated successfully." });
            } catch (error) {
                console.error("updateUsername Error:", error);
                return res.status(500).json({ message: "Internal Server Error!" });
            }
        },

        // PUT /profile/email
        // Body: { newEmail }
        updateEmail: async (req, res) => {
            const userId = req.user.id;
            const { newEmail } = req.body;

            if (!newEmail || newEmail.trim() === '') {
                return res.status(400).json({ message: "New email is required." });
            }

            // Basic email format check
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(newEmail)) {
                return res.status(400).json({ message: "Invalid email format." });
            }

            try {
                // Check if email is already taken by another user
                const [existing] = await DB.execute(
                    'SELECT ID FROM Users WHERE email = ? AND ID != ? LIMIT 1',
                    [newEmail, userId]
                );
                if (existing.length > 0) {
                    return res.status(409).json({ message: "Email is already in use." });
                }

                await DB.execute(
                    'UPDATE Users SET email = ? WHERE ID = ?',
                    [newEmail, userId]
                );
                return res.status(200).json({ message: "Email updated successfully." });
            } catch (error) {
                console.error("updateEmail Error:", error);
                return res.status(500).json({ message: "Internal Server Error!" });
            }
        },

        // PUT /profile/password
        // Body: { oldPassword, newPassword }
        updatePassword: async (req, res) => {
            const userId = req.user.id;
            const { oldPassword, newPassword } = req.body;

            if (!oldPassword || !newPassword) {
                return res.status(400).json({ message: "Old password and new password are required." });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({ message: "New password must be at least 6 characters." });
            }

            try {
                // Fetch current password from DB
                const [rows] = await DB.execute(
                    'SELECT password FROM Users WHERE ID = ? LIMIT 1',
                    [userId]
                );
                if (rows.length === 0) {
                    return res.status(404).json({ message: "User not found." });
                }

                // Verify old password matches (plain text, same as Login.js)
                if (rows[0].password !== oldPassword) {
                    return res.status(401).json({ message: "Old password is incorrect." });
                }

                await DB.execute(
                    'UPDATE Users SET password = ? WHERE ID = ?',
                    [newPassword, userId]
                );
                return res.status(200).json({ message: "Password updated successfully." });
            } catch (error) {
                console.error("updatePassword Error:", error);
                return res.status(500).json({ message: "Internal Server Error!" });
            }
        },

        // PUT /profile/language
        // Body: { language }
        updateLanguage: async (req, res) => {
            const userId = req.user.id;
            const { language } = req.body;

            const allowedLanguages = ['en', 'vi'];
            if (!language || !allowedLanguages.includes(language)) {
                return res.status(400).json({ message: "Invalid language. Allowed: 'en', 'vi'." });
            }

            try {
                await DB.execute(
                    'UPDATE Users SET language = ? WHERE ID = ?',
                    [language, userId]
                );
                return res.status(200).json({ message: "Language updated successfully." });
            } catch (error) {
                console.error("updateLanguage Error:", error);
                return res.status(500).json({ message: "Internal Server Error!" });
            }
        },

        // PUT /profile/theme
        // Body: { theme }
        updateTheme: async (req, res) => {
            const userId = req.user.id;
            const { theme } = req.body;

            const allowedThemes = ['light', 'dark'];
            if (!theme || !allowedThemes.includes(theme)) {
                return res.status(400).json({ message: "Invalid theme. Allowed: 'light', 'dark'." });
            }

            try {
                await DB.execute(
                    'UPDATE Users SET theme = ? WHERE ID = ?',
                    [theme, userId]
                );
                return res.status(200).json({ message: "Theme updated successfully." });
            } catch (error) {
                console.error("updateTheme Error:", error);
                return res.status(500).json({ message: "Internal Server Error!" });
            }
        }

    };
};
