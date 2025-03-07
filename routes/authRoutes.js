const express = require("express");
const { register, login, verifyEmail,emailFornewPassword,verifyResetCode,setNewPassword } = require("../controllers/authController");
const User = require("../models/User");

const router = express.Router();

// TODO: Add Swagger docs for this route
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
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User registered successfully
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
 *         description: Invalid credentials
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

router.post("/forgot-password",emailFornewPassword);
router.post("/verify-reset-code",verifyResetCode);
router.post("/set-new-password",setNewPassword)

module.exports = router;
