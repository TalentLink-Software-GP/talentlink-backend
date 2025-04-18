const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

const {getOrgJobs,getAllJobs,addJob,deleteJob,updateJob} = require('../controllers/jobController')

router.get("/getorgjobs",authMiddleware,getOrgJobs);
router.get("/getalljobs",getAllJobs);
router.post("/addjob",authMiddleware,addJob);
router.delete("/deletejob",authMiddleware,deleteJob);
router.patch("/updatejob",authMiddleware,updateJob);

module.exports = router;