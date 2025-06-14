const express = require("express")
const{
    getUserData,
    updateAvatar,
    deleteAvatar,
    uploadCV,
    deleteCV,
    userByUsername,getUserCv,getUserId,getCurrentUser,getUserStatus,saveFcmToken,removeFcmToken,
    followingSys,
checkFollowStatus,
getUserFollowingStatus,
fetchFollowList,
getUserCvByUsername,
} = require("../controllers/userController")
const upload = require("../middleware/multer");

const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
 


/**
 * @swagger
 * /api/users/getUserName:
 *   get:
 *     summary: Get the username of a user by their ID
 *     description: This endpoint allows you to get the user's name by providing their user ID in the body.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: body
 *         name: id
 *         description: The ID of the user whose name is to be fetched.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: "60d21b4967d0d8992e610c85"
 *     responses:
 *       200:
 *         description: User found, returns the name.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

router.get("/getUserData", getUserData)

/**
 * @swagger
 * /api/users/upload-avatar:
 *   post:
 *     summary: Upload user avatar
 *     description: Allows authenticated users to upload an avatar image.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 avatarUrl:
 *                   type: string
 *       400:
 *         description: Bad request (e.g. file not provided)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/upload-avatar", authMiddleware, upload.single("avatar"), updateAvatar);

/**
 * @swagger
 * /api/users/remove-avatar:
 *   delete:
 *     summary: Delete user avatar
 *     description: Deletes the avatar of the authenticated user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Avatar deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Avatar not found
 *       500:
 *         description: Internal server error
 */
router.delete('/remove-avatar', authMiddleware, deleteAvatar);

/**
 * @swagger
 * /api/users/upload-cv:
 *   post:
 *     summary: Upload user CV
 *     description: Allows authenticated users to upload a CV in PDF format.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               cv:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: CV uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cvUrl:
 *                   type: string
 *       400:
 *         description: Bad request (e.g. file not provided)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/upload-cv", authMiddleware, upload.single("cv"), uploadCV);

/**
 * @swagger
 * /api/users/remove-cv:
 *   delete:
 *     summary: Delete user CV
 *     description: Deletes the uploaded CV of the authenticated user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CV deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: CV not found
 *       500:
 *         description: Internal server error
 */
router.delete("/remove-cv", authMiddleware, deleteCV);

router.get("/byusername/:username", userByUsername);


router.get("/get-user-id", authMiddleware,getUserId);



router.get('/get-current-user', authMiddleware,getCurrentUser);



router.get('/:userId/status',getUserStatus);


router.post('/save-fcm-token', saveFcmToken);


router.post('/remove-fcm-token',removeFcmToken);



router.get('/getUserCV/:userId',getUserCv);
router.get('/getUserCvByUsername/:username',getUserCvByUsername);


router.get('/followingSys/:username/follow',authMiddleware,followingSys);
router.get('/followingStatus/:username',authMiddleware,checkFollowStatus);



router.get('/user-stats/:username', authMiddleware,getUserFollowingStatus);

router.get('/follow-list/:username/:type', authMiddleware,fetchFollowList);

module.exports = router;