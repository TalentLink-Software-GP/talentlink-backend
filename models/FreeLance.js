const mongoose = require('mongoose');

const freelancePostSchema = new mongoose.Schema({
  username: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: String, required: true },
});

module.exports = mongoose.model('FreelancePost', freelancePostSchema);