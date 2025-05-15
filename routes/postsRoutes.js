const express = require('express');
const {
  postsCreate,
  updatePost,
  deletePost,
  getposts,
  likePost,
  addComment,
  addReply,getpostsbyusername,getPostById,

}=require("../controllers/postsController");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");





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




// create post for postcard creating post
router.post('/createPost', authMiddleware, postsCreate);


//update post for 3-dot
router.put('/updatePost/:id', authMiddleware, updatePost);

  //delete post for 3-dot
router.delete('/deletePost/:id', authMiddleware,deletePost );


// get post by id for feed 
  router.get('/get-posts', authMiddleware, getposts);
  //  router.get('/get-posts', authMiddleware, getposts);


  router.get('/getuser-posts-byusername/:username',authMiddleware, getpostsbyusername);



  router.patch('/:id/like-post', authMiddleware, likePost);
  /**
 * @swagger
 * /api/posts/{id}/comments:
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 example: "This is a comment"
 *     responses:
 *       201:
 *         description: Comment added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 _id:
 *                   type: string
 *                 comment:
 *                   type: object
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.post('/:id/comments', authMiddleware, addComment);


/**
 * @swagger
 * /api/posts/{id}/comments/{commentId}/replies:
 *   post:
 *     summary: Add a reply to a comment
 *     tags: [Replies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 example: "This is a reply"
 *     responses:
 *       201:
 *         description: Reply added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 reply:
 *                   type: object
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Post or comment not found
 *       500:
 *         description: Server error
 */
router.post('/:id/comments/:commentId/replies', authMiddleware, addReply); 



router.get('/:postId', getPostById);


module.exports = router;

