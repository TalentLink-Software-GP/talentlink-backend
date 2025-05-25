const express = require("express")
const Organization = require("../models/Organization");


const {
  getProfileData,
  updateAvatar,
  deleteAvatar,
  getOrgDataWithuserName,saveFcmToken,removeFcmToken,
  followingSys,
  unfollowSys,
} = require('../controllers/organizationController')

const authMiddleware = require('../middleware/authMiddleware')
const upload = require("../middleware/multer");

const router = express.Router();

router.get("/getOrgDataWithuserName" ,getOrgDataWithuserName);


router.post("/getOrgData", authMiddleware, getProfileData);

router.post("/updateAvatar", authMiddleware, upload.single("avatar"), updateAvatar);

router.delete("/deleteAvatar", authMiddleware, deleteAvatar);

router.post('/save-fcm-token', saveFcmToken);


router.post('/remove-fcm-token',removeFcmToken);

router.get('/followingSys/:username/follow',authMiddleware,followingSys);


module.exports = router;
