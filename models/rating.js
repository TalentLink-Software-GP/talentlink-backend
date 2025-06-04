const mongoose = require("mongoose");
const ratingSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    type: { type: String, enum: ['User', 'Organization'], required: true },
    rating: { type: Number, required: true, default: 0 },
    count: { type: Number, required: true, default: 0 },
    users: { 
        type: [String], 
        required: true, 
        default: [],
        validate: {
            validator: function(v) {
                return v.every(id => typeof id === 'string' && id.length > 0);
            },
            message: 'Each user ID must be a non-empty string'
        }
    },
    userRatings: {
        type: Map,
        of: Number,
        default: new Map()
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Add a method to check if a user has already rated
ratingSchema.methods.hasUserRated = function(userId) {
    return this.userRatings.has(userId);
};

// Add a method to add or update a user's rating
ratingSchema.methods.addUserRating = function(userId, ratingValue) {
    const hadPreviousRating = this.hasUserRated(userId);
    
    if (hadPreviousRating) {
        // Remove old rating from total
        const oldRating = this.userRatings.get(userId);
        this.rating = ((this.rating * this.count) - oldRating) / (this.count - 1);
        this.count--;
    }

    // Add new rating
    this.userRatings.set(userId, ratingValue);
    this.users = Array.from(this.userRatings.keys());
    this.count++;
    
    // Calculate new average
    let totalRating = 0;
    this.userRatings.forEach((value) => {
        totalRating += value;
    });
    this.rating = totalRating / this.count;
    
    return true;
};

const Rating = mongoose.model("Rating", ratingSchema);
module.exports = Rating;


