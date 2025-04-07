const express = require("express")
const{
    getUserData,
    updateAvatar,
    deleteAvatar
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

router.post("/upload-avatar", authMiddleware, upload.single("avatar"), updateAvatar);

router.delete('/remove-avatar', authMiddleware, deleteAvatar);

module.exports = router;