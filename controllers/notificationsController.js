const { AllPrivateUserNotification, GlobalNotification,orgNotification,meetingNotification } = require("../models/Notifications");
const User=require("../models/User");
const Organaization=require("../models/Organization");


getAppliedJob=async (req, res) => {
  console.log("orgNotification");
     try {
  const username = req.params.username;
        const notifications = await orgNotification.find({
          receiver: username,
        })
            .sort({ createdAt: -1 })
            .select('_id title body timestamp jobId senderId postId read'); 
            console.log("Response status code:", 200);

        res.status(200).json(notifications);
    
    
      } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

getGlobalJobNotification = async (req, res) => {
    try {
        const notifications = await GlobalNotification.find({})
            .sort({ createdAt: -1 })
            .select('_id title body timestamp jobId senderId postId read'); 
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

getPrivateNotificationsLikeCommentReply = async (req, res) => {
    try {
        console.log("getPrivateNotificationsLikeCommentReply");
        const { username } = req.params;  
        console.log("Username:", username);

        const privateNotifications = await AllPrivateUserNotification.find({
            receiver: username,
        })
        .sort({ createdAt: -1 })
        .select('_id title body timestamp postId senderId read');

        res.status(200).json(privateNotifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};



const fetchMeetingNotifications = async (req, res) => {
    try {
      console.log("fetchMeetingNotifications Reached");
        const userid = req.params.userid;
        console.log(userid);
        const notifications = await meetingNotification.find({
            applicantId: userid,
        })
            .sort({ createdAt: -1 })
            .select('_id title body  meetingId applicantId scheduledDateTime organizationId meetingLink read');
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};


const markAsReadFunc = async (req, res) => {
  console.log("markAsReadFunc called with ID:", req.params.notificationId);
  
  try {
    const notificationId = req.params.notificationId;
    
    let notification = await AllPrivateUserNotification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      notification = await GlobalNotification.findByIdAndUpdate(
        notificationId,
        { read: true },
        { new: true }
      );
    }
    if (!notification) {
      notification = await meetingNotification.findByIdAndUpdate(
        notificationId,
        { read: true },
        { new: true }
      );
    }


    
    // If notification still not found
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // For user notifications, check if the user is authorized
    // Commenting out auth check for now to simplify debugging
    /*
    if (notification.userId && notification.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this notification'
      });
    }
    */
    
    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


module.exports = {
    getGlobalJobNotification,getPrivateNotificationsLikeCommentReply,markAsReadFunc,getAppliedJob,fetchMeetingNotifications,
};