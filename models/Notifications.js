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
       newfollowFrom:{ type: String, required: false },

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
                    newfollowFrom:{ type: String, required: false },



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


const meetingNotificationSchema=new mongoose.Schema({

    title: { type: String, required: true },
    body: { type: String, required: true },
    read: { type: Boolean, default: false },
    meetingId: { type: String,required: true},
    applicantId: {  type: mongoose.Schema.Types.ObjectId,  ref: 'User', required: true},
    scheduledDateTime: {type: Date,required: true},
     organizationId: { type: mongoose.Schema.Types.ObjectId,  ref: 'Organization',  required: true },
     orgName:{ type: String, required: false },
     meetingLink: { type: String,required: true, },
});
const meetingNotification=mongoose.model('meetingNotification',meetingNotificationSchema);


module.exports = {
    AllPrivateUserNotification,
    GlobalNotification,
    orgNotification,
    meetingNotification,
    
};