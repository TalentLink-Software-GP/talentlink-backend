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
        author: req.user.name, 
        username: req.user.username,
        content,
        avatarUrl: req.user.avatarUrl,
      });
      console.log("Authenticated User:", req.user);

  
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
        { _id: new mongoose.Types.ObjectId(postId), username: req.user.username },
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
        username: req.user.username
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
  router.get('/get-posts', authMiddleware, async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;
  
      const posts = await Post.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
  
      const totalPosts = await Post.countDocuments({});
      const hasMore = skip + limit < totalPosts;
  
      const formattedPosts = posts.map(post => ({
        _id: post._id,
        // username:req.post.username,//////////////////////
        content: post.content,
        author: post.author, 
        username: req.user.username, 
        createdAt: post.createdAt,
        avatarUrl: post.avatarUrl || '',
        isLiked: post.likes.includes(req.user.username),
        likeCount: post.likes.length,
        comments: post.comments || [],
        isOwner: post.username === req.user.username // Add isOwner flag
      }));
  
      res.status(200).json({ posts: formattedPosts, hasMore });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error while fetching posts' });
    }
  });
  
  router.post('/like-post/:id', authMiddleware, async (req, res) => {
    try {
      const postId = req.params.id;
      const username = req.user.username;
  
      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ error: 'Post not found' });
  
      const hasLiked = post.likes.includes(username);
  
      if (hasLiked) {
        post.likes = post.likes.filter(user => user !== username);
      } else {
        post.likes.push(username);
      }
  
      await post.save();
  
      res.status(200).json({
        message: hasLiked ? 'Unliked post' : 'Liked post',
        isLiked: !hasLiked,
        likeCount: post.likes.length,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error toggling like' });
    }
  });
module.exports = router;

