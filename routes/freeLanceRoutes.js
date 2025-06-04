const express = require('express');
const router = express.Router();
const {savePost,fetchPost}= require('../controllers/freelanceController');

router.post('/post', savePost);

router.get('/post', fetchPost);

module.exports = router;