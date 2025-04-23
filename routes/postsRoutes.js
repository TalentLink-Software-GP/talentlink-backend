const express = require('express');
const {postsCreate}=require("../controllers/postsController");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Post = require('../models/posts');
const mongoose = require('mongoose');




/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - author
 *         - content
 *       properties:
 *         author:
 *           type: string
 *           description: Name of the post author
 *         content:
 *           type: string
 *           description: Content of the post
 *         likes:
 *           type: integer
 *           default: 0
 *         comments:
 *           type: array
 *           items:
 *             type: string
 *           default: []
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date when the post was created
 */



/**
 * @swagger
 * /api/posts/createPost:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Invalid request
 */




// router.post("/createPost", postsCreate);

router.post('/createPost', authMiddleware, async (req, res) => {
    try {
      const { content } = req.body;
  
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Post content is required' });
      }
  
      const newPost = new Post({
        author: req.user.username,
        content,
        avatarUrl: req.user.avatarUrl,
      });
  
      const savedPost = await newPost.save();
  
      res.status(201).json({
        message: 'Post created successfully',
        id: savedPost._id
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

//test
router.put('/updatePost/:id', authMiddleware, async (req, res) => {
    try {
      const { content } = req.body;
      const postId = req.params.id;
  
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Post content is required' });
      }
  
      const updatedPost = await Post.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(postId), author: req.user.username },
        { content, updatedAt: new Date() },
        { new: true }
      );
  
      if (!updatedPost) {
        return res.status(404).json({ error: 'Post not found or unauthorized' });
      }
  
      res.status(200).json({ message: 'Post updated successfully', post: updatedPost });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  
  router.delete('/deletePost/:id', authMiddleware, async (req, res) => {
    try {
      const postId = req.params.id;
  
      const deletedPost = await Post.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(postId),
        author: req.user.username
      });
  
      if (!deletedPost) {
        return res.status(404).json({ error: 'Post not found or unauthorized' });
      }
  
      res.status(200).json({ message: 'Post deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

module.exports = router;

