const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const uploadMiddleware = require("../middleware/multer");

const {getOrgJobs,getAllJobs,addJob,deleteJob,updateJob,smartAddJob} = require('../controllers/jobController')

router.get("/getorgjobs",authMiddleware,getOrgJobs);
router.get("/getalljobs",getAllJobs);
router.post("/addjob",authMiddleware,addJob);
router.delete("/deletejob",authMiddleware,deleteJob);
router.patch("/updatejob",authMiddleware,updateJob);
router.post("/smart-add-job", authMiddleware, uploadMiddleware.single('file'), smartAddJob);


module.exports = router;