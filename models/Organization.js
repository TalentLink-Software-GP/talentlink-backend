const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true  },
    username: { type: String, required: true, unique: true }, 
    industry: { type: String, required: true},
    websiteURL: { type: String, required: false},
    country: { type: String, required: true },
    address1: { type: String, required: true },
    address2: { type: String, required: false },
    email:{type: String, required:true, unique: true},
    password: { type: String, required: true },
    isVerified:{ type: Boolean, required: true },
    resetCode:{type: String },
    role: { 
      type: String, 
      enum: ["Organization"], 
      default: "Organization" 
    },
    avatarUrl: { type: String, required: false},

    createdAt: { type: Date, default: Date.now },
  });
  
  const Organization = mongoose.model('Organization', organizationSchema);
  module.exports = Organization;