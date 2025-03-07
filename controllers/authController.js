const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");


const PORT = process.env.PORT || 5000;

const register = async (req, res) => {
  try {
    const { name, username, email, phone, password, role } = req.body;

    // Validate required fields
    if (!name || !username || !email || !phone || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user instance
    const user = new User({
      name,
      username,
      email,
      phone,
      password: hashedPassword,
      role: role || "user",
      isVerified: false, // Ensure new users are unverified
    });

    // Generate verification token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "35h",
    });

    // Send verification email
    const verificationUrl = `http://localhost:${PORT}/api/auth/verify-email/${token}`;
    await sendEmail(user.email, "Verify Your Email", `Click this link to verify: ${verificationUrl}`);

    await user.save();

    res.status(201).json({ message: "User registered. Please verify your email." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Fix: Define and export verifyEmail function
const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // If already verified, prevent duplicate updates
    if (user.isVerified) {
      return res.status(400).json({ error: "Email already verified" });
    }

    // Mark user as verified
    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(400).json({ error: "Invalid or expired token" });
  }
};

// ✅ Fix: Define and export login function
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    
    if(!user.isVerified)
{
  return res.status(400).json({ error: "email is not Verified" });

}
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(200).json({ message: "Login successful", token });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const emailFornewPassword= async(req,res)=>{
  try{
    // console.log("awwad1");

    const {email}=req.body;

    console.log("The",email);
    //const user=await User.findOne(email);
    const user = await User.findOne({ email });

    

    if(!user){
      // console.log("awwa4");

      return res.status(404).json({ message: "no email found, try again" });
    }
    // console.log("awwad5");

    const resetCode = crypto.randomInt(100000, 999999).toString();
    // console.log("awwa6");

    user.resetCode = resetCode;  
    // console.log("awwa7");

    user.resetCodeExpires = Date.now() + 10 * 60 * 1000;
    await user.save();


    await sendEmail(user.email, " Password Reset Code", `Your password reset code is: ${resetCode}. It expires in 10 minutes.`);
    res.status(200).json({ message: "sent succes" });

  }
  catch(error){
    res.status(500).json({ error: error.message });

  }


};
const verifyResetCode =async(req,res)=>{

  const { email, resetCode } = req.body;

  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.resetCode === resetCode) {
    return res.status(200).json({ message: "Reset code is correct. You can now reset your password." });
  } else {
    return res.status(400).json({ message: "Invalid reset code" });
  }


}
const setNewPassword = async (req, res) => {
  console.log("awwad1");

  try {
    const { email, password } = req.body;
    console.log(email);
    console.log("awwad2");

    const user = await User.findOne({ email });
    console.log("awwad3");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    } catch (hashError) {
      console.error("Error hashing password:", hashError);
      return res.status(500).json({ error: "Error hashing password" });
    }

    user.resetCode = undefined;
    console.log("awwad5");

    user.resetCodeExpires = undefined;
    console.log("awwad6");

    await user.save();
    console.log("awwad7");

    res.status(200).json({ message: "Password updated successfully" });
    console.log("awwad8");
  } catch (error) {
    console.error("Error in setNewPassword:", error);
    res.status(500).json({ error: error.message });
  }
};


// ✅ Fix: Export all functions
module.exports = {
  register,
  verifyEmail,
  login,
  emailFornewPassword,
  verifyResetCode,
  setNewPassword,
};
