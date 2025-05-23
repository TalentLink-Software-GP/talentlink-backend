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
 *         - phone
 *         - password
 *         - date
 *         - country
 *         - city
 *         - gender
 *       properties:
 *         name:
 *           type: string
 *           description: Full name of the user
 *         username:
 *           type: string
 *           description: Unique username (will be used to generate email as username@talent.ps)
 *         phone:
 *           type: string
 *           description: User's phone number
 *         password:
 *           type: string
 *           description: User's password
 *         date:
 *           type: string
 *           format: date
 *           description: Birth date or registration date
 *         country:
 *           type: string
 *           description: User's country
 *         city:
 *           type: string
 *           description: User's city
 *         gender:
 *           type: string
 *           description: User's gender
 *         role:
 *           type: string
 *           enum: [admin, Organization, Freelancer, Job Seeker]
 *           description: Role of the user
 *         email:
 *           type: string
 *           description: Automatically generated as username@talent.ps for admin users
 *         isVerified:
 *           type: boolean
 *           description: Automatically set to true for admin users
 *         avatarUrl:
 *           type: string
 *           format: uri
 *           description: Optional avatar URL
 *         cvUrl:
 *           type: string
 *           format: uri
 *           description: Optional CV URL
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *     AdminResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Admin user created successfully
 *         token:
 *           type: string
 *           description: JWT token for authentication
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               description: User's unique identifier
 *             name:
 *               type: string
 *               description: User's full name
 *             username:
 *               type: string
 *               description: User's username
 *             email:
 *               type: string
 *               description: User's email (username@talent.ps)
 *             role:
 *               type: string
 *               example: admin
 *             phone:
 *               type: string
 *               description: User's phone number
 *             date:
 *               type: string
 *               format: date
 *             country:
 *               type: string
 *             city:
 *               type: string
 *             gender:
 *               type: string
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [Admin, Organization, Freelancer, Job Seeker]
 *                 description: Role of the user to register
 *               name:
 *                 type: string
 *                 description: Full name of the user
 *               username:
 *                 type: string
 *                 description: Unique username (for admin, will be used to generate email)
 *               phone:
 *                 type: string
 *                 description: User's phone number
 *               password:
 *                 type: string
 *                 description: User's password
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Birth date or registration date
 *               country:
 *                 type: string
 *                 description: User's country
 *               city:
 *                 type: string
 *                 description: User's city
 *               gender:
 *                 type: string
 *                 description: User's gender
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/AdminResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: User registered. Please verify your email.
 *                     token:
 *                       type: string
 *       400:
 *         description: User already exists or invalid input
 *       500:
 *         description: Server error
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
