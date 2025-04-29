const express = require("express");
const {
  addSkills, deleteSkill, getSkills,
  addEducation, deleteEducation, getEducation,
  addExperience, deleteExperience, getExperience,
  addCertifications, deleteCertifications, getCertifications,
  addLanguages, deleteLanguages, getLanguages,
  updateSummary, getAll
} = require("../controllers/skillsController");

const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Skills
 *   description: User skills, education, experience, certifications, and summary
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Skills:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *           description: The ID of the user the skills belong to
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           description: List of skills
 *         education:
 *           type: array
 *           items:
 *             type: string
 *           description: List of education qualifications (max 3)
 *         experience:
 *           type: array
 *           items:
 *             type: string
 *           description: List of experiences
 *         certifications:
 *           type: array
 *           items:
 *             type: string
 *           description: List of certifications
 *         languages:
 *           type: array
 *           items:
 *             type: string
 *           description: List of languages
 *         summary:
 *           type: string
 *           description: Summary or bio of the user
 *       example:
 *         userId: "605c5f4057e5f4374c8b4567"
 *         skills: ["Node.js", "MongoDB"]
 *         education: ["B.Sc Computer Science", "M.Sc Data Science"]
 *         experience: ["Backend Developer at XYZ", "Freelancer at ABC"]
 *         certifications: ["AWS Certified", "Google Cloud Associate"]
 *         languages: ["English", "Arabic"]
 *         summary: "A highly motivated backend developer with 5+ years of experience."
 */

/**
 * @swagger
 * /api/skills/add-skills:
 *   post:
 *     summary: Add user skills
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
 */
router.post("/add-skills", authMiddleware, addSkills);

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
 *               skills:
 *                 type: string
 *     responses:
 *       200:
 *         description: Skill deleted successfully
 */
router.delete("/delete-skill", authMiddleware, deleteSkill);

/**
 * @swagger
 * /api/skills/get-skills:
 *   get:
 *     summary: Get user skills
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user skills
 */
router.get("/get-skills", authMiddleware, getSkills);

// Education
/**
 * @swagger
 * /api/skills/add-education:
 *   post:
 *     summary: Add user education
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
 */
router.post("/add-education", authMiddleware, addEducation);

/**
 * @swagger
 * /api/skills/delete-education:
 *   delete:
 *     summary: Delete an education entry
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
 *         description: Education entry deleted
 */
router.delete("/delete-education", authMiddleware, deleteEducation);

/**
 * @swagger
 * /api/skills/get-education:
 *   get:
 *     summary: Get user education
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of education entries
 */
router.get("/get-education", authMiddleware, getEducation);

// Experience
/**
 * @swagger
 * /api/skills/add-experience:
 *   post:
 *     summary: Add user experience
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
 *               experience:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Experience added successfully
 */
router.post("/add-experience", authMiddleware, addExperience);

/**
 * @swagger
 * /api/skills/delete-experience:
 *   delete:
 *     summary: Delete an experience entry
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
 *               experience:
 *                 type: string
 *     responses:
 *       200:
 *         description: Experience entry deleted
 */
router.delete("/delete-experience", authMiddleware, deleteExperience);

/**
 * @swagger
 * /api/skills/get-experience:
 *   get:
 *     summary: Get user experience
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of experience entries
 */
router.get("/get-experience", authMiddleware, getExperience);

// Certifications
/**
 * @swagger
 * /api/skills/add-certifications:
 *   post:
 *     summary: Add certifications
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
 *               certifications:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Certifications added
 */
router.post("/add-certifications", authMiddleware, addCertifications);

/**
 * @swagger
 * /api/skills/delete-certifications:
 *   delete:
 *     summary: Delete a certification
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
 *               certifications:
 *                 type: string
 *     responses:
 *       200:
 *         description: Certification deleted
 */
router.delete("/delete-certifications", authMiddleware, deleteCertifications);

/**
 * @swagger
 * /api/skills/get-certifications:
 *   get:
 *     summary: Get certifications
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of certifications
 */
router.get("/get-certifications", authMiddleware, getCertifications);

// Languages
/**
 * @swagger
 * /api/skills/add-languages:
 *   post:
 *     summary: Add languages
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
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Languages added
 */
router.post("/add-languages", authMiddleware, addLanguages);

/**
 * @swagger
 * /api/skills/delete-languages:
 *   delete:
 *     summary: Delete a language
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
 *               languages:
 *                 type: string
 *     responses:
 *       200:
 *         description: Language deleted
 */
router.delete("/delete-languages", authMiddleware, deleteLanguages);

/**
 * @swagger
 * /api/skills/get-languages:
 *   get:
 *     summary: Get languages
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of languages
 */
router.get("/get-languages", authMiddleware, getLanguages);

// Summary
/**
 * @swagger
 * /api/skills/update-summary:
 *   post:
 *     summary: Update user summary
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
 *               summary:
 *                 type: string
 *     responses:
 *       200:
 *         description: Summary updated
 */
router.post("/update-summary", authMiddleware, updateSummary);

// Get all user info
/**
 * @swagger
 * /api/skills/get-all:
 *   get:
 *     summary: Get all user skills and information
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All user profile data (skills, education, etc.)
 */
router.get("/get-all", authMiddleware, getAll);

module.exports = router;
