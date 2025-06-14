const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    isVerified:{ type: Boolean, required: true },
    resetCode:{type: String },
    role: { 
      type: String, 
      enum: ["admin", "Organization", "Freelancer", "Job Seeker", ], 
      // default: "jobseeker" 
    },
    date: { type: Date, required: false },
    country:{type: String,required:false},
    city:{type: String,required:false},
    gender:{type: String,required:false},
    avatarUrl: { type: String, required: false },
    cvUrl: { type: String, required: false },
    analyzedCV:{type: String, required: false},
    createdAt: { type: Date, default: Date.now },
//for online status
    online: { type: Boolean, default: false },
    lastSeen: { type: Date },
    socketIds: { type: [String], default: [] },
    //for the notfications
     fcmTokens: { type: [String], default: [] }, 
    notificationSettings: {
      chat: { type: Boolean, default: true },
      calls: { type: Boolean, default: true },
       
   
    },
     followers: [{ type: String }],
following: [{ type: String }],
  });
  
const User = mongoose.model('User', userSchema);

module.exports = User;