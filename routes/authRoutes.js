const express = require("express");
const { register, login } = require("../controllers/authController");
const { registerUser, verifyEmail } = require('../controllers/authController');

const User= require("../models/User");
router.post('/register', registerUser);

router.get('/verify-email/:token', verifyEmail);

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
router.post("verifyEmail",verifyEmail);




module.exports = router;
