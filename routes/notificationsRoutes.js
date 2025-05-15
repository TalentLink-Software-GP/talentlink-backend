const express = require("express")
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const {
    getGlobalJobNotification,getPrivateNotificationsLikeCommentReply,markAsReadFunc,getAppliedJob,

}=require("../controllers/notificationsController");

router.get("/getGlobalJobNotification", getGlobalJobNotification);
router.get("/getPrivateNotificationsLikeCommentReply/:username", getPrivateNotificationsLikeCommentReply);

router.get("/getAppliedJob/:username",getAppliedJob);

router.patch('/markAsRead/:notificationId', markAsReadFunc);


module.exports = router;