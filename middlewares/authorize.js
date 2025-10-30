const jwt = require('jsonwebtoken');

module.exports.authorize = (req, res, next) => {
    const token = req.cookies.cipherBucksToken;
    if (!token) {
        return res.status(401).json({ success: false, message: "Not Authorized. Login again." });
    }

    try {
        const tokenData = jwt.verify(token, process.env.JWT_SECRET);
        if (!tokenData) {
            return res.status(401).json({ success: false, message: "Invalid token. Login again." });
        }

        req.user = { id: tokenData.id }; // safer than modifying req.body
        next();

    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired token.", error: error.message });
    }
};
