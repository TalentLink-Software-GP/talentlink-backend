 const express = require("express");
const { register, login, verifyEmail, emailFornewPassword, verifyResetCode, setNewPassword,isverifyd } = require("../controllers/authController");
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - username
 *         - email
 *         - phone
 *         - password
 *         - isVerified
 *       properties:
 *         name:
 *           type: string
 *           description: Full name of the user
 *         username:
 *           type: string
 *           description: Unique username
 *         email:
 *           type: string
 *           description: User's email address
 *         phone:
 *           type: string
 *           description: User's phone number
 *         password:
 *           type: string
 *           description: User's hashed password
 *         isVerified:
 *           type: boolean
 *           description: Indicates if the user has verified their email
 *         resetCode:
 *           type: string
 *           description: Code used for password reset
 *         role:
 *           type: string
 *           enum: [admin, Organization, Freelancer, Job Seeker]
 *           description: Role of the user
 *         date:
 *           type: string
 *           format: date
 *           description: Optional birth date or registration date
 *         country:
 *           type: string
 *         city:
 *           type: string
 *         gender:
 *           type: string
 *         avatarUrl:
 *           type: string
 *           format: uri
 *         cvUrl:
 *           type: string
 *           format: uri
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User registered successfully, email verification required
 *       400:
 *         description: User already exists or invalid input
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       400:
 *         description: Invalid credentials or email not verified
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/verify-email/{token}:
 *   get:
 *     summary: Verify a user's email
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: JWT verification token sent via email
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */
router.get("/verify-email/:token", verifyEmail);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset code sent successfully
 *       404:
 *         description: Email not found
 */
router.post("/forgot-password", emailFornewPassword);

/**
 * @swagger
 * /api/auth/verify-reset-code:
 *   post:
 *     summary: Verify password reset code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               resetCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset code verified successfully
 *       400:
 *         description: Invalid reset code
 */
router.post("/verify-reset-code", verifyResetCode);

/**
 * @swagger
 * /api/auth/set-new-password:
 *   post:
 *     summary: Set a new password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       404:
 *         description: User not found
 */
router.post("/set-new-password", setNewPassword);


router.get("/isVerified/:email",isverifyd);

module.exports = router;
