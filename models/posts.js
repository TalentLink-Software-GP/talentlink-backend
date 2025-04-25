const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: { type: String, required: true },
  username: { type: String, required: true },
  content: { type: String, required: true },
  avatarUrl: { type: String },
  likes: { type: [String], default: [] },
  comments: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
