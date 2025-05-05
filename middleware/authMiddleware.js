const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Organization = require("../models/Organization");
require("dotenv").config();

const authenticateToken = async (req, res, next) => {
  const token = req.header("Authorization");
 

  if (!token) {
    return res.status(401).json({ error: "Access Denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);

    let user = await User.findById(decoded.id).select("username name role avatarUrl");
    if (!user) {
      user = await Organization.findById(decoded.id).select("username name role avatarUrl");
    }

    if (!user) {
      console.log("❌ No user/org found with decoded ID:", decoded.id);
      return res.status(404).json({ error: "User not found." });
    }

    req.user = {
      id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
       avatarUrl: user.avatarUrl || '',
    };

    //console.log("✅ Authenticated user:", req.user);
    next();
  } catch (error) {
    console.error("❌ Token verification failed:", error.message);
    res.status(401).json({ error: "Invalid Token" });
  }
};

module.exports = authenticateToken;
