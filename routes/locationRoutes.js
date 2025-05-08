const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getLangLat,
  getAllCompaniesLngLat,
  setLangLat,
} = require('../controllers/locationController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Location:
 *       type: object
 *       required:
 *         - companyId
 *         - lat
 *         - lng
 *       properties:
 *         companyId:
 *           type: string
 *           description: MongoDB ObjectId reference to the Organization
 *         lat:
 *           type: number
 *           format: float
 *           example: 32.150146
 *         lng:
 *           type: number
 *           format: float
 *           example: 35.253834
 */

/**
 * @swagger
 * /api/location/set:
 *   post:
 *     summary: Create or update the logged-in organization's location
 *     tags: [Location]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lat
 *               - lng
 *             properties:
 *               lat:
 *                 type: number
 *               lng:
 *                 type: number
 *     responses:
 *       200:
 *         description: Location updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Location'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/set', authMiddleware, setLangLat);

/**
 * @swagger
 * /api/location/get:
 *   post:
 *     summary: Get location by organization username
 *     tags: [Location]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: Location data (or default 0,0 if not set)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lat:
 *                   type: number
 *                 lng:
 *                   type: number
 *       404:
 *         description: Organization not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/get', authMiddleware, getLangLat);

/**
 * @swagger
 * /api/location/all:
 *   get:
 *     summary: Get all organizations' location data
 *     tags: [Location]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of organizations with location info
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *                   organization:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       username:
 *                         type: string
 *                       industry:
 *                         type: string
 *                       websiteURL:
 *                         type: string
 *                       country:
 *                         type: string
 *                       address1:
 *                         type: string
 *                       address2:
 *                         type: string
 *                       email:
 *                         type: string
 *                       avatarUrl:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/all', authMiddleware, getAllCompaniesLngLat);

module.exports = router;
