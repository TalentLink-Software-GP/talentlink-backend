const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const authenticateToken  = require("../middleware/authMiddleware");
const{applicationData,fetchApplicationData   }=require("../controllers/applicationController");


router.post('/data', authenticateToken , applicationData);
  

router.get('/organization', authenticateToken , fetchApplicationData);

module.exports = router;
