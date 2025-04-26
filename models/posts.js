const mongoose = require('mongoose');


const replySchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: String, required: true },
  avatarUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});
const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: String, required: true },
  avatarUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  replies: { type: [replySchema], default: [] }
});
//ASAL 
const postSchema = new mongoose.Schema({
  author: { type: String, required: true },
  username: { type: String, required: true },
  content: { type: String, required: true },
  avatarUrl: { type: String },
  likes: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  comments: [commentSchema],
});



const Post = mongoose.model('Post', postSchema);

module.exports = Post;
