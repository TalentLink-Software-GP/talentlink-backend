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

    // Try to find user or organization
    let user = await User.findById(decoded.id).select("name role");
    if (!user) {
      user = await Organization.findById(decoded.id).select("name role");
    }

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    req.user = {
      id: user._id,
      name: user.name,
      role: user.role,
    };

   // console.log("✅ Authenticated user:", req.user);
    next();
  } catch (error) {
    console.error("❌ Token verification failed:", error.message);
    res.status(401).json({ error: "Invalid Token" });
  }
};

module.exports = authenticateToken;
