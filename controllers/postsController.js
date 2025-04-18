const Post = require("../models/posts");
require("dotenv").config();



const postsCreate= async(req, res) =>{
    const { author, content } = req.body;

  try {
    const newPost = new Post({ author, content });
    await newPost.save();
    res.status(201).json({ message: 'Post created successfully', post: newPost });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create post', error });
  }



};

module.exports = {
    postsCreate,
   
  };
  

