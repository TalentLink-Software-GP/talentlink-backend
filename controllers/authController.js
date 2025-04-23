const User = require("../models/User");
const Organaization = require("../models/Organization");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const { Console } = require("console");

const PORT = process.env.PORT || 5000;
const register = async (req, res) => {
  try {
    const {role} = req.body;
    if(role === "Organization")
      {
        const { name, industry, websiteURL, country, address1, address2, email, password } = req.body;
        if (!name || !industry || !country || !address1|| !email || !password)
          {
            return res.status(400).json({ error: "All fields are required" });
          }
          const existingUser = await User.findOne({ email });
          const existingOrg = await Organaization.findOne({ email });
          if (existingUser || existingOrg) {
            return res.status(400).json({ error: "User already exists" });
          }
          const hashedPassword = await bcrypt.hash(password, 10);

          const organaization = new Organaization({
            name,
            industry,
            websiteURL,
            country,
            address1,
            address2,
            email,
            password: hashedPassword,
            isVerified: false,
            role: "Organization",
          });
          await organaization.save();

          const token = jwt.sign({ id: organaization._id }, process.env.JWT_SECRET, {
            expiresIn: "35h",
          });

          console.log(token);

          const verificationUrl = `http://localhost:${PORT}/api/auth/verify-email/${token}`;
          await sendEmail(organaization.email, "Verify Your Email", `Click this link to verify: ${verificationUrl}`);
      
          res.status(201).json({
            message: "User registered. Please verify your email.",
            token: token,  
          });
      }
    else
    {
      const { name, username, email, phone, password, date, country, city, gender } = req.body;
    if (!name || !username || !email || !phone || !password || !role|| !date || !country || !city || !gender
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    const existingOrg = await Organaization.findOne({ email });
    if (existingUser || existingOrg) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      username,
      email,
      phone,
      password: hashedPassword,
      role: role || "Freelancer",
      isVerified: false,
      date,
      country,
      city,
      gender,
    });

    await user.save();
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "35h" }
    );

    const verificationUrl = `http://localhost:${PORT}/api/auth/verify-email/${token}`;
    await sendEmail(user.email, "Verify Your Email", `Click this link to verify: ${verificationUrl}`);

    res.status(201).json({
      message: "User registered. Please verify your email.",
      token: token,  
    });

   }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    const organaization = await Organaization.findById(decoded.id);
    if (!user && !organaization) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    if ((user && user.isVerified)||(organaization && organaization.isVerified)) {
      return res.status(400).json({ error: "Email already verified" });
    }

    if(user){
      user.isVerified = true;
      await user.save();
    }
    else if(organaization){
      organaization.isVerified = true;
      await organaization.save();
    }
    

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(400).json({ error: "Invalid or expired token" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    const organaization = await Organaization.findOne({ email });
    
    if (!user && !organaization) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    if((user && !user.isVerified) || (organaization && !organaization.isVerified)){
        return res.status(400).json({ error: "email is not Verified" });
      }

    var isMatch;
    var token
    if(user){
      isMatch = await bcrypt.compare(password, user.password);
      token = jwt.sign({ id: user._id, role: user.role , username: user.username}, process.env.JWT_SECRET, { expiresIn: "1d" });
      console.log(user.username)
    }
    else if(organaization){
      isMatch = await bcrypt.compare(password, organaization.password);
      token = jwt.sign({ id: organaization._id, role: "Organization" , industry: organaization.industry, email: organaization.email, name: organaization.name}, process.env.JWT_SECRET, { expiresIn: "1d" });
      console.log(organaization.email);
    }

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    res.status(200).json({ message: "Login successful", token });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const emailFornewPassword= async(req,res)=>{
  try{
    const {email}=req.body;

    console.log("The",email);
    const user = await User.findOne({ email });
    const organaization = await Organaization.findOne({ email });
    

    if(!user && !organaization){
      return res.status(404).json({ message: "no email found, try again" });
    }

    const resetCode = crypto.randomInt(100000, 999999).toString();
    if(user){
      user.resetCode = resetCode;  
      user.resetCodeExpires = Date.now() + 10 * 60 * 1000;
      await user.save();
      await sendEmail(user.email, " Password Reset Code", `Your password reset code is: ${resetCode}. It expires in 10 minutes.`);
    }
    else if(organaization){
      organaization.resetCode = resetCode;
      organaization.resetCodeExpires = Date.now() + 10 * 60 * 1000;
      await organaization.save();
      await sendEmail(organaization.email, " Password Reset Code", `Your password reset code is: ${resetCode}. It expires in 10 minutes.`);
    }
    res.status(200).json({ message: "sent succes" });
  }
  catch(error){
    res.status(500).json({ error: error.message });

  }
};
const verifyResetCode =async(req,res)=>{

  const { email, resetCode } = req.body;

  const user = await User.findOne({ email: email });
  const organaization = await Organaization.findOne({ email })

  if (!user && !organaization) {
    return res.status(404).json({ message: "User not found" });
  }

  if ((user && user.resetCode === resetCode) || (organaization && organaization.resetCode === resetCode) ) {
    return res.status(200).json({ message: "Reset code is correct. You can now reset your password." });
  } else {
    return res.status(400).json({ message: "Invalid reset code" });
  }
}
const setNewPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email);

    const user = await User.findOne({ email });
    const organaization = await Organaization.findOne({ email })

    if (!user && !organaization) {
      return res.status(404).json({ error: "User not found" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      if(user){
      user.password = hashedPassword;
      user.resetCode = undefined;
      user.resetCodeExpires = undefined;
      await user.save();
      }
      if(organaization){
      organaization.password =hashedPassword;
      organaization.resetCode = undefined;
      organaization.resetCodeExpires = undefined;
      await organaization.save();
      }
      res.status(200).json({ message: "Password updated successfully" });
    } catch (hashError) {
      console.error("Error hashing password:", hashError);
      return res.status(500).json({ error: "Error hashing password" });
    }
  } catch (error) {
    console.error("Error in setNewPassword:", error);
    res.status(500).json({ error: error.message });
  }
};


const isverifyd = async (req, res) => { 
  try {
    const { email } = req.params; 

    const user = await User.findOne({ email });
    const organaization = await Organaization.findOne({ email });
    if (!user && !organaization) {
      return res.status(404).json({ error: "User not found" });
    }

    if ((organaization && organaization.isVerified) || (user && user.isVerified)) {
      return res.status(200).json({ message: "Email is verified" });
    }
    
    return res.status(400).json({ message: "Email is not verified" });

  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  emailFornewPassword,
  verifyResetCode,
  setNewPassword,
  isverifyd,
};
