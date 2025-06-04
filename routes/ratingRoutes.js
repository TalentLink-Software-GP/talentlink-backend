const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getRatingByUsername,
    getRatingByUserId,
    getRatingByToken,
    updateRating
} = require('../controllers/ratingController');


// Get rating by username
router.get('/username', auth, getRatingByUsername);
// Get rating by user ID
router.get('/user', getRatingByUserId);

// Get rating by token (requires authentication)
router.get('/me', auth, getRatingByToken);

// Update rating (requires authentication)
router.post('/update', auth, updateRating);

module.exports = router; 