const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) =>{
    const token = req.header("Authorization");

    if(!token){
        return res.status(401).json({error: "Access Denied"});
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({eroor: "Invalid Token"});
    }
}