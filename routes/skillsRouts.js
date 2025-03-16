const express = require("express");
const SkillsController = require("../controllers/skillsController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Skills:
 *       type: object
 *       required:
 *         - skills
 *       properties:
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           maxItems: 100
 *           description: A list of up to 100 skills for the user.
 */

/**
 * @swagger
 * /api/skills:
 *   get:
 *     summary: Retrieve the authenticated user's skills
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user's skills
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Skills'
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       404:
 *         description: No skills found for this user
 *       500:
 *         description: Server error
 */
router.get("/", authMiddleware, SkillsController.getUserSkills);

/**
 * @swagger
 * /api/skills:
 *   post:
 *     summary: Add or update skills for the authenticated user
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - skills
 *             properties:
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 100
 *                 description: List of skills to add or update
 *     responses:
 *       200:
 *         description: Skills updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 skills:
 *                   type: array
 *                   items:
 *                     type: string
 *       201:
 *         description: New skills list created
 *       400:
 *         description: Validation error or skills limit exceeded
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       500:
 *         description: Server error
 */
router.post("/", authMiddleware, SkillsController.addUserSkills);

/**
 * @swagger
 * /api/skills:
 *   delete:
 *     summary: Delete a specific skill from the authenticated user's list
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - skill
 *             properties:
 *               skill:
 *                 type: string
 *                 description: The skill to be removed
 *     responses:
 *       200:
 *         description: Skill removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 skills:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       404:
 *         description: Skill not found in user's list or user has no skills
 *       500:
 *         description: Server error
 */
router.delete("/", authMiddleware, SkillsController.deleteSkill);

module.exports = router;
