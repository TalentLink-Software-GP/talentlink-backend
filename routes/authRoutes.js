const express = require("express");
const { register, login, verifyEmail, emailFornewPassword, verifyResetCode, setNewPassword } = require("../controllers/authController");
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
 *       properties:
 *         name:
 *           type: string
 *           description: Full name of the user
 *         username:
 *           type: string
 *           description: Unique username
 *         email:
 *           type: string
 *           description: User's email
 *         phone:
 *           type: string
 *           description: Phone number
 *         password:
 *           type: string
 *           description: User's password (hashed)
 *         role:
 *           type: string
 *           enum: [admin, organization, freelancer, user]
 *           default: user
 * 
 *     Skills:
 *       type: object
 *       required:
 *         - userId
 *         - skills
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *           description: The ID of the user associated with the skills.
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           maxItems: 100
 *           description: A list of up to 100 skills for the user.
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
 * 
 * /api/skills:
 *   post:
 *     summary: Add skills for a user
 *     tags: [Skills]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Skills'
 *     responses:
 *       201:
 *         description: Skills added successfully
 *       400:
 *         description: Invalid input or exceeded skill limit
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

module.exports = router;
