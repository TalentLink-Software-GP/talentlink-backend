const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  location: String,
  salary: String,
  jobType: {
    type: String,
    enum: ['Full-Time', 'Part-Time', 'Remote', 'Internship', 'Contract'],
    default: 'Full-Time',
  },
  
  category: String,
  deadline: Date,
  requirements: [String],
  responsibilities: [String],
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Job', jobSchema);