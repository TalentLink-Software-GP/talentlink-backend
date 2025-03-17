const mongoose = require('mongoose');

const skillsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  education: {
    type: [String],
    required: true,
    validate: [arrayLimit, '{PATH} exceeds the limit of 3']
  },
  skills: {
    type: [String],
    required: true,
    validate: [arrayLimitSkills, '{PATH} exceeds the limit of 100']
  }
});

function arrayLimit(val) {
  return val.length <= 3;
}

function arrayLimitSkills(val) {
  return val.length <= 100;
}

const Skills = mongoose.model('Skills', skillsSchema);

module.exports = Skills;
