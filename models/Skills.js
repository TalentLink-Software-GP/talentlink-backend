const mongoose = require('mongoose');

const skillsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  skills: {
    type: [String],
    required: true,
    maxItems: 100
  }
});

const Skills = mongoose.model('Skills', skillsSchema);

module.exports = Skills;