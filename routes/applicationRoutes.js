const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const authenticateToken  = require("../middleware/authMiddleware");
const{applicationData,fetchApplicationData,getApplicationById  }=require("../controllers/applicationController");


router.post('/data', authenticateToken , applicationData);
  

router.get('/organization', authenticateToken , fetchApplicationData);
router.get('/getAppbyId/:applicationId', authenticateToken, getApplicationById);


module.exports = router;
