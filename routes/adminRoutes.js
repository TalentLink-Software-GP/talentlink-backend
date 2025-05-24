const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAut');

const User = require('../models/User');
const Organization = require('../models/Organization');
const Post = require("../models/posts");
const Job = require('../models/Job');


router.get('/users', adminAuth, async (req, res) => {
  const type = req.query.type;
  try {
    if (type === 'org') {
      console.log("Fetching organizations");
      const orgs = await Organization.find();
      return res.json(orgs);
    } else if (type === 'user') {
      console.log("Fetching users");
      const users = await User.find();
      return res.json(users);
    } else {
      const users = await User.find();
      const orgs = await Organization.find();
      return res.json([...users, ...orgs]);
    }
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

router.put('/users/:id/ban', adminAuth, async (req, res) => {
  const type = req.query.type;
  try {
    let entity;
    if (type === 'org') {
      entity = await Organization.findById(req.params.id);
    } else {
      entity = await User.findById(req.params.id);
    }

    if (!entity) return res.status(404).json({ message: "User not found" });

    entity.isBanned = true;
    await entity.save();
    res.json({ message: `${type === 'org' ? 'Organization' : 'User'} banned` });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/posts', adminAuth, async (req, res) => {
  console.log("POSTS REACHED ");
  const ownerId = req.query.ownerId ;
  try {
    const posts = await Post.find({ username: ownerId }).populate('author', 'name username'); 
    console.log(`Found ${posts.length} posts for owner ${ownerId}`);
    return res.json(posts);
  } catch (err) {
    console.log("Error fetching posts:", err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/posts/:id', adminAuth, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    return res.json({ message: "Post deleted" });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/stats', adminAuth, async (req, res) => {
  console.log("STATS REACHED");
  try {
   
    const userCount = await User.countDocuments();
    const orgCount = await Organization.countDocuments();
    
    
    const postCount = await Post.countDocuments();
    const activeTodayCount = await User.countDocuments({ online: true });
    const jobCount = await Job.countDocuments();

    console.log('Stats:', { userCount, postCount, activeTodayCount, jobCount });

    res.json({
      users: userCount,
      posts: postCount,
      activeToday: activeTodayCount,
      jobs: jobCount,
        org: orgCount
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/jobs', adminAuth, async (req, res) => {
    console.log("JOBS REACHED");
  try {
    console.log("Fetching jobs...");
    const jobs = await Job.find();
    console.log("Jobs found:", jobs.length);
    res.json(jobs);
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ error: 'Server error' });
  }
});
module.exports = router;