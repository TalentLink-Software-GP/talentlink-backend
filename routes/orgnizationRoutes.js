const express = require("express")
const Organization = require("../models/Organization");

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


router.post("/getOrgData", authMiddleware, getProfileData);

// ✅ FIXED THIS LINE
router.post("/updateAvatar", authMiddleware, upload.single("avatar"), updateAvatar);

// ✅ Removed multer from here — delete doesn't need it
router.delete("/deleteAvatar", authMiddleware, deleteAvatar);


router.post('/save-fcm-token', async (req, res) => {
  // console.log('Received FCM token:', req.body);
  console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
  
  
  await Organization.updateMany(
  { fcmTokens: { $exists: false } },
  { $set: { fcmTokens: [] } }
);
  const { organizationId, fcmToken } = req.body;

  if (!organizationId || !fcmToken) {
    return res.status(400).json({ error: 'organizationId and fcmToken are required.' });
  }

  try {
    const updatedOrg = await Organization.findByIdAndUpdate(
      organizationId,
      {
        $addToSet: { fcmTokens: fcmToken },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    );

    if (!updatedOrg) {
      return res.status(404).json({ error: 'Organization not found.' });
    }

    console.log(`✅ FCM Token saved for organization ${organizationId}: ${fcmToken}`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Error saving FCM token for organization:', error);
    res.status(500).json({ error: 'Failed to save FCM token for organization' });
  }
});
module.exports = router;
