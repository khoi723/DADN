const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, 'SAIWS_SECRET');
        req.user = decoded; // { id, username }
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};
