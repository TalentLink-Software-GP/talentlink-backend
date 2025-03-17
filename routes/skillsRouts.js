const express = require("express");
const { 
  addSkills, 
  addEducation, 
  deleteSkill, 
  deleteEducation, 
  getAllSkills, 
  getAllEducation, 
  getSkillsAndEducation 
} = require("../controllers/skillsController");

const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Skills:
 *       type: object
 *       required:
 *         - skills
 *         - education
 *       properties:
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           description: List of skills
 *         education:
 *           type: array
 *           items:
 *             type: string
 *           description: List of education qualifications
 */

/**
 * @swagger
 * /api/skills/add-skills:
 *   post:
 *     summary: Add one or more skills
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Skills added successfully
 *       400:
 *         description: Invalid input
 */
router.post("/add-skills", authMiddleware, addSkills);

/**
 * @swagger
 * /api/skills/add-education:
 *   post:
 *     summary: Add one or more education qualifications
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               education:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Education added successfully
 *       400:
 *         description: Invalid input
 */
router.post("/add-education", authMiddleware, addEducation);

/**
 * @swagger
 * /api/skills/delete-skill:
 *   delete:
 *     summary: Delete a skill
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               skill:
 *                 type: string
 *     responses:
 *       200:
 *         description: Skill deleted successfully
 *       400:
 *         description: Invalid input
 */
router.delete("/delete-skill", authMiddleware, deleteSkill);

/**
 * @swagger
 * /api/skills/delete-education:
 *   delete:
 *     summary: Delete an education qualification
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               education:
 *                 type: string
 *     responses:
 *       200:
 *         description: Education deleted successfully
 *       400:
 *         description: Invalid input
 */
router.delete("/delete-education", authMiddleware, deleteEducation);

/**
 * @swagger
 * /api/skills/get-all-skills:
 *   get:
 *     summary: Get all skills for the authenticated user
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all skills
 */
router.get("/get-all-skills", authMiddleware, getAllSkills);

/**
 * @swagger
 * /api/skills/get-all-education:
 *   get:
 *     summary: Get all education qualifications for the authenticated user
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all education qualifications
 */
router.get("/get-all-education", authMiddleware, getAllEducation);

/**
 * @swagger
 * /api/skills/get-skills-education:
 *   get:
 *     summary: Get all skills and education for the authenticated user
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all skills and education
 */
router.get("/get-skills-education", authMiddleware, getSkillsAndEducation);

module.exports = router;
