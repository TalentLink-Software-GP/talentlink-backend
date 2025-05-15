const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const uploadMiddleware = require("../middleware/multer");
const { getOrgJobs, getAllJobs, addJob, deleteJob, updateJob, smartAddJob,getAllJobsUser,getJobById } = require('../controllers/jobController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Job:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         location:
 *           type: string
 *         salary:
 *           type: string
 *         jobType:
 *           type: string
 *           enum: [Full-Time, Part-Time, Remote, Internship, Contract]
 *         category:
 *           type: string
 *         deadline:
 *           type: string
 *           format: date
 *         requirements:
 *           type: array
 *           items:
 *             type: string
 *         responsibilities:
 *           type: array
 *           items:
 *             type: string
 *         companyId:
 *           type: string
 *           description: The organization ID that posted the job
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/job/getorgjobs:
 *   get:
 *     summary: Get all jobs for a specific organization
 *     tags: [Jobs]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of jobs for the organization
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: Organization not found
 */
router.get("/getorgjobs", authMiddleware, getOrgJobs);

/**
 * @swagger
 * /api/job/getalljobs:
 *   get:
 *     summary: Get all jobs available
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: List of all jobs
 *       204:
 *         description: No available jobs at the moment
 */
router.get("/getalljobs", getAllJobs);
router.get('/job/:jobId',getJobById);

/**
 * @swagger
 * /api/job/addjob:
 *   post:
 *     summary: Add a new job to the organization
 *     tags: [Jobs]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               salary:
 *                 type: string
 *               jobType:
 *                 type: string
 *               category:
 *                 type: string
 *               deadline:
 *                 type: string
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *               responsibilities:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Job created successfully
 *       404:
 *         description: Organization not found
 *       500:
 *         description: Server error while adding job
 */
router.post("/addjob", authMiddleware, addJob);

/**
 * @swagger
 * /api/job/deletejob:
 *   delete:
 *     summary: Delete a job by ID
 *     tags: [Jobs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: jobId
 *         required: true
 *         description: ID of the job to delete
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *       400:
 *         description: Job ID is required
 *       404:
 *         description: Job not found or unauthorized
 */
router.delete("/deletejob", authMiddleware, deleteJob);

/**
 * @swagger
 * /api/job/updatejob:
 *   patch:
 *     summary: Update job details
 *     tags: [Jobs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: jobId
 *         required: true
 *         description: ID of the job to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               salary:
 *                 type: string
 *               jobType:
 *                 type: string
 *               category:
 *                 type: string
 *               deadline:
 *                 type: string
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *               responsibilities:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Job updated successfully
 *       404:
 *         description: Job not found or unauthorized
 */
router.patch("/updatejob", authMiddleware, updateJob);

/**
 * @swagger
 * /api/job//smart-add-job:
 *   post:
 *     summary: Add a job via AI-powered extraction from a file or text
 *     tags: [Jobs]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Job created successfully via AI
 *       400:
 *         description: Invalid file or unsupported format
 *       500:
 *         description: Error processing the job
 */
router.post("/smart-add-job", authMiddleware, uploadMiddleware.single('file'), smartAddJob);

/**
 * @swagger
 * /api/job/getAllJobsUser:
 *   get:
 *     tags:
 *       - Jobs
 *     summary: Get all jobs for the authenticated user with match scores
 *     description: Returns a list of jobs, each with a calculated match score based on the user's skills.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JobWithMatchScore'
 *       204:
 *         description: No jobs available
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Server error while fetching jobs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     JobWithMatchScore:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 6802420cb441400ed774494e
 *         title:
 *           type: string
 *           example: Backend Developer
 *         description:
 *           type: string
 *           example: Fresh Graduate Backend Developer with knowledge in NodeJs and Express
 *         location:
 *           type: string
 *           example: Palestine(Remote)
 *         salary:
 *           type: string
 *           example: 1000$
 *         jobType:
 *           type: string
 *           enum: [Full-Time, Part-Time, Remote, Internship, Contract]
 *           example: Full-Time
 *         category:
 *           type: string
 *           example: Backend Development
 *         deadline:
 *           type: string
 *           format: date-time
 *           example: 2025-06-11T00:00:00.000Z
 *         requirements:
 *           type: array
 *           items:
 *             type: string
 *           example: ["NodeJs", "ExpressJs", "MongoDB"]
 *         responsibilities:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Work with team", "Available 9 to 5 from Sun to Thur"]
 *         companyId:
 *           type: string
 *           example: 680217f31a3f4db9dc7249d4
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2025-04-18T12:14:04.899Z
 *         matchScore:
 *           type: number
 *           format: float
 *           example: 66.67
 */
router.get("/getAllJobsUser",authMiddleware, getAllJobsUser)

module.exports = router;