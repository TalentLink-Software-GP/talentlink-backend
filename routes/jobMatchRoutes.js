const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const{getMatchSortedByScore} = require('../controllers/jobMatchController');

/**
 * @swagger
 * components:
 *   schemas:
 *     JobMatch:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           description: ID of the matched user
 *         jobId:
 *           type: string
 *           description: ID of the job
 *         matchScore:
 *           type: number
 *           format: float
 *           description: Match score between user and job
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the match was created
 */

/**
 * @swagger
 * /api/jobMatch/getMatchSortedByScore:
 *   post:
 *     summary: Get matched users sorted by matchScore for a specific job
 *     tags: [JobMatch]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jobId:
 *                 type: string
 *                 description: ID of the job
 *             required:
 *               - jobId
 *     responses:
 *       200:
 *         description: List of matched users sorted by score
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JobMatch'
 *       401:
 *         description: Unauthorized - No user info in token
 *       404:
 *         description: No matched users for this job
 *       500:
 *         description: Internal server error
 */

router.post("/getMatchSortedByScore",authMiddleware,getMatchSortedByScore);

module.exports = router;