const mongoose = require("mongoose");

const postSchema =new mongoose.Schema({

    author: { type: String,required: true,},
      content: { type: String, required: true,},
      likes: { type: Number,  default: 0, },
      comments: {  type: [String], default: [],},
      createdAt: { type: Date, default: Date.now,},


});

module.exports = mongoose.model('Post', postSchema);
