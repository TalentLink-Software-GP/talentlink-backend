const express = require("express")
const {
  getProfileData,
  updateAvatar,
  deleteAvatar,
  getOrgDataWithuserName,
} = require('../controllers/organizationController')

const authMiddleware = require('../middleware/authMiddleware')
const upload = require("../middleware/multer");

const router = express.Router();

router.get("/getOrgDataWithuserName" ,getOrgDataWithuserName);


router.get("/getOrgData", authMiddleware, getProfileData);

// ✅ FIXED THIS LINE
router.post("/updateAvatar", authMiddleware, upload.single("avatar"), updateAvatar);

// ✅ Removed multer from here — delete doesn't need it
router.delete("/deleteAvatar", authMiddleware, deleteAvatar);

module.exports = router;
