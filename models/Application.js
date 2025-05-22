const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId,ref: 'User', required: true  },
username: { type: String, required: true  },

  userName: { type: String, required: true  },

  jobId: { type: mongoose.Schema.Types.ObjectId,   ref: 'Job',required: true},

  jobTitle: { type: String,  required: true},

  organizationId: { type: mongoose.Schema.Types.ObjectId,  ref: 'User', required: true },

  matchScore: { type: Number, required: true},

  appliedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', ApplicationSchema);
