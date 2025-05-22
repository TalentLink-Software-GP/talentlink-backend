const express = require("express")
const router = express.Router();
const {meetingSchedule,organizationFetchMeeting}=require("../controllers/meetingController");


router.post('/schedule',meetingSchedule );

router.get('/organizationFetchMeeting/:orgId', organizationFetchMeeting);

module.exports = router;