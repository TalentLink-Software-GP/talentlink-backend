const express = require('express');
const router = express.Router();
const FreelancePost = require('../models/FreeLance');

const savePost =async (req, res) => {
  const { username, content, date } = req.body;

  try {
    const newPost = new FreelancePost({ username, content, date });
    await newPost.save();
    res.status(201).json({ message: 'Freelance post created', post: newPost });
  } catch (err) {
    res.status(500).json({ message: 'Error creating freelance post', error: err });
  }
};

const fetchPost= async (req, res) => {
  try {
    const posts = await FreelancePost.find().sort({ _id: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching freelance posts', error: err });
  }
};



module.exports = {
 savePost,
 fetchPost,
}