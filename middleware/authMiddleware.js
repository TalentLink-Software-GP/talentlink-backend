const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ error: "Access Denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
         
        
        
        req.user = decoded;
        console.log("✅ Token decoded:", decoded); 
        next();
    } catch (error) {
        console.error("❌ Token verification failed:", error.message);
        res.status(401).json({ error: "Invalid Token" });
    }
};

module.exports = authenticateToken;
