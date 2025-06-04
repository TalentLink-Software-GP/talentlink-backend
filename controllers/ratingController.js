const Rating = require('../models/rating');
const User = require('../models/User');
const Organization = require('../models/Organization');

// Get rating by username
const getRatingByUsername = async (req, res) => {
    try {
        const { username } = req.query;
        
        if (!username) {
            return res.status(400).json({ message: "Username is required" });
        }

        // Try to find user first
        let user = await User.findOne({ username });
        let type = 'User';
        
        // If not found, try organization
        if (!user) {
            user = await Organization.findOne({ username });
            type = 'Organization';
        }

        if (!user) {
            return res.status(404).json({ message: "User or organization not found" });
        }

        const rating = await Rating.findOne({ userId: user._id });
        if (!rating) {
            return res.status(404).json({ 
                message: "Rating not found",
                type: type,
                username: username
            });
        }

        // Get current user's rating if authenticated
        let userRating = null;
        // If you use JWT/session, make sure req.user is set by your auth middleware
        if (req.user && rating.userRatings && typeof rating.userRatings.get === 'function') {
            userRating = rating.userRatings.get(req.user.id) || null;
        }

        res.status(200).json({
            ...rating.toObject(),
            type: type,
            userRating: userRating // <-- Add this line
        });
    } catch (error) {
        console.error("Error in getRatingByUsername:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get rating by user ID
const getRatingByUserId = async (req, res) => {
    try {
        const { userId } = req.query;
        
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const rating = await Rating.findOne({ userId });
        if (!rating) {
            return res.status(404).json({ message: "Rating not found" });
        }

        res.status(200).json(rating);
    } catch (error) {
        console.error("Error in getRatingByUserId:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get rating by token (current user)
const getRatingByToken = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming auth middleware sets req.user

        const rating = await Rating.findOne({ userId });
        if (!rating) {
            return res.status(404).json({ message: "Rating not found" });
        }

        res.status(200).json(rating);
    } catch (error) {
        console.error("Error in getRatingByToken:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update rating
const updateRating = async (req, res) => {
    try {
        const { targetUsername, ratingValue } = req.body;
        const raterUserId = req.user.id; // Assuming auth middleware sets req.user

        if (!targetUsername || !ratingValue) {
            return res.status(400).json({ message: "Target username and rating value are required" });
        }

        if (ratingValue < 1 || ratingValue > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        // Find user or organization by username
        let target = await User.findOne({ username: targetUsername });
        let targetType = 'User';
        if (!target) {
            target = await Organization.findOne({ username: targetUsername });
            targetType = 'Organization';
        }
        if (!target) {
            return res.status(404).json({ message: "Target user or organization not found" });
        }

        // Find or create rating document
        let rating = await Rating.findOne({ userId: target._id });
        if (!rating) {
            rating = new Rating({
                userId: target._id,
                userName: target.username,
                type: targetType,
                rating: ratingValue,
                count: 1,
                users: [raterUserId],
                userRatings: new Map([[raterUserId, ratingValue]])
            });
        } else {
            // Ensure type is set correctly
            rating.type = targetType;
            // Add or update rating
            rating.addUserRating(raterUserId, ratingValue);
        }

        await rating.save();
        res.status(200).json({
            message: `Rating ${rating.hasUserRated(raterUserId) ? 'updated' : 'added'} successfully`,
            type: targetType,
            targetUsername: target.username,
            rating: rating.rating,
            count: rating.count,
            userRating: rating.userRatings.get(raterUserId)
        });
    } catch (error) {
        console.error("Error in updateRating:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    getRatingByUsername,
    getRatingByUserId,
    getRatingByToken,
    updateRating
};
