const express = require('express');
const {postsCreate}=require("../controllers/postsController");
const router = express.Router();


/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - author
 *         - content
 *       properties:
 *         author:
 *           type: string
 *           description: Name of the post author
 *         content:
 *           type: string
 *           description: Content of the post
 *         likes:
 *           type: integer
 *           default: 0
 *         comments:
 *           type: array
 *           items:
 *             type: string
 *           default: []
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date when the post was created
 */



/**
 * @swagger
 * /api/posts/createPost:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Invalid request
 */




router.post("/createPost", postsCreate);


module.exports = router;

