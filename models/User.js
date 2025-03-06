const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    isVerified:{
      type: Boolean, required: true
    },
    role: { 
      type: String, 
      enum: ["admin", "organization", "freelancer", "user"], 
      default: "user" 
    },
    createdAt: { type: Date, default: Date.now },
  });
  
const User = mongoose.model('User', userSchema);

module.exports = User;