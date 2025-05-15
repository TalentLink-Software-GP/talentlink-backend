const mongoose = require('mongoose');

const userNotificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    sender: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
    receiver: { type: String, required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },

});

const AllPrivateUserNotification = mongoose.model('UserNotification', userNotificationSchema);

const globalNotificationSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organaization' },
    title: { type: String, required: true },
    body: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
        read: { type: Boolean, default: false },
            postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },


});
const GlobalNotification = mongoose.model('GlobalNotification', globalNotificationSchema);


const orgNotificationSchema = new mongoose.Schema({
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organaization', required: false },
    sender: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
    receiver: { type: String, required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },

});
const orgNotification = mongoose.model('orgNotification', orgNotificationSchema);




module.exports = {
    AllPrivateUserNotification,
    GlobalNotification,orgNotification,
    
};