const express = require("express")
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const {
    getGlobalJobNotification,getPrivateNotificationsLikeCommentReply,markAsReadFunc,getAppliedJob,fetchMeetingNotifications

}=require("../controllers/notificationsController");

router.get("/getGlobalJobNotification", getGlobalJobNotification);
router.get("/getPrivateNotificationsLikeCommentReply/:username", getPrivateNotificationsLikeCommentReply);

router.get("/getAppliedJob/:username",getAppliedJob);

router.patch('/markAsRead/:notificationId', markAsReadFunc);

router.get('/getMeetingNotification/:userid', fetchMeetingNotifications);


module.exports = router;