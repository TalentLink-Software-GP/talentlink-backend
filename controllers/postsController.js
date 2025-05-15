const Post = require("../models/posts");
require("dotenv").config();
const mongoose = require('mongoose');
const User = require("../models/User");  
const Organization = require("../models/Organization");
const { AllPrivateUserNotification, GlobalNotification } = require("../models/Notifications");
const { sendNotification } = require('../services/firebaseAdmin');




const postsCreate = async (req, res) => {
  console.log("=== REQUEST DETAILS ===0");

  try {
    console.log("REQ.HEADERS:", req.headers);
    console.log("REQ.USER:", req.user);

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

    const savedPost = await newPost.save();
    res.status(201).json({
      message: 'Post created successfully',
      id: savedPost._id,
    });
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ error: 'Server error' });
  }
};
const updatePost= async(req, res) =>{
  console.log("=== REQUEST DETAILS ===3");

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
 
};
const deletePost= async(req, res) =>{
  console.log("=== REQUEST DETAILS ===2");

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
 
};
const getposts= async(req, res) =>{

console.log("=== REQUEST DETAILS ===");
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
    
        const formattedPosts = await Promise.all(posts.map(async post => {
          // Try to find in User collection
          let authorData = await User.findOne({ username: post.username });
        
          // If not found in User, try Organization
          if (!authorData) {
            authorData = await Organization.findOne({ username: post.username });
          }
        
          return {
            _id: post._id,
            content: post.content,
            author: post.username,
            username: authorData?.username || '',
            avatarUrl: authorData?.avatarUrl || '', // from User or Organization
            createdAt: post.createdAt,
            isLiked: post.likes.includes(req.user.username),
            likeCount: post.likes.length,
            comments: post.comments || [],
            isOwner: post.username === req.user.username,
          };
        }));
        console.log("Formatted Posts:", formattedPosts);
    
        res.status(200).json({ posts: formattedPosts, hasMore });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while fetching posts' });
      }
 
};
const likePost = async (req, res) => {
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

      if (username !== post.username) {
  // Save notification
  const newNotification = new AllPrivateUserNotification({
    title: "New Like",
    body: `${username} liked your post`,
    postId,
    type: 'like',
    sender: username,
    receiver: post.username
  });
  await newNotification.save();

  // Send push notification
  const user = await User.findOne({ username: post.username });
  if (user) {
    await sendNotification([user.firebaseToken], "New Like", `${username} liked your post`);
  }
}
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
};
///////////comment and reply
const addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const newComment = {
      text,
      author: req.user.name || 'Anonymous',
      avatarUrl: req.user.avatarUrl || '',
      createdAt: new Date()
    };
    post.comments.push(newComment);
    await post.save();

    // Save notification
    const newNotification = new AllPrivateUserNotification({
      title: "New Comment",
      body: `${req.user.username} commented on your post`,
      postId,
      type: 'comment',
      sender: req.user.username,
      receiver: post.username
    });
    await newNotification.save();

    // Send push notification
    const user = await User.findOne({ username: post.username });
    if (user && user.firebaseToken) {
      await sendNotification([user.firebaseToken], "New Comment", `${req.user.username} commented on your post`);
    }

    res.status(201).json({
      message: 'Comment added',
      comment: newComment
    });
  } catch (err) {
    console.error('Error in addComment:', err);
    res.status(500).json({ error: 'Error adding comment' });
  }
};

const addReply = async (req, res) => {
   try {
    const postId = req.params.id;
    const commentId = req.params.commentId;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Reply text is required' });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const targetComment = post.comments.id(commentId);
    if (!targetComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const newReply = {
      text,
      author: req.user.name || 'Anonymous',
      avatarUrl: req.user.avatarUrl || '',
      createdAt: new Date()
    };

    targetComment.replies.push(newReply);
    await post.save();

    res.status(201).json({
      message: 'Reply added',
      reply: targetComment.replies[targetComment.replies.length - 1]
    });
  } catch (err) {
    console.error('Error in addReply:', err);
    res.status(500).json({ error: 'Error adding reply' });
  }
};

const getpostsbyusername = async (req, res) => {
  try {
    const { username } = req.params; // Get username from URL parameter
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch posts for that username
    const posts = await Post.find({ username })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments({ username });
    const hasMore = skip + limit < totalPosts;

    const formattedPosts = posts.map(post => ({
      _id: post._id,
      content: post.content,
      authorUsername: post.username, // IMPORTANT: use authorUsername directly
      createdAt: post.createdAt,
      avatarUrl: post.avatarUrl || '',
      isLiked: post.likes.includes(req.user.username), // If user liked the post
      likeCount: post.likes.length,
      comments: post.comments || [],
      isOwner: post.username === req.user.username, // If current user owns the post
    }));

    res.status(200).json({ posts: formattedPosts, hasMore });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while fetching posts by username' });
  }
};




const getPostById = async (req, res) => {
    try {
console.log("Received request to get post by ID:", req.params.postId);
        const { postId } = req.params;

        // Check if postId is not "No postId" and is a valid ObjectId
        if (!postId || postId === "No postId" || !mongoose.Types.ObjectId.isValid(postId)) {
                      console.log("no:", req.params.postId);

            return res.status(400).json({ message: 'Invalid or missing post ID' });

        }

        const post = await Post.findById(postId).populate('author');
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
                      console.log("post id found:", req.params.postId);

        res.status(200).json(post);
       // console.log( post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};



module.exports = {
    postsCreate,
    updatePost,
    deletePost,
    getposts,
    likePost,
    addReply,
    addComment,getpostsbyusername ,getPostById
   
  };
  

