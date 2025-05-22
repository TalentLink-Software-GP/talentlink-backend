const Application = require('../models/Application');
const mongoose = require("mongoose");
const { UserNotification, GlobalNotification,orgNotification } = require("../models/Notifications");
const Organization = require("../models/Organization");

const applicationData=async (req, res) => {

    try {
      const { jobId, jobTitle, matchScore, organizationId,  } = req.body;
      
      if (!req.user || !req.user.id || !req.user.name) {
// const userId=req.user.id;
       


        return res.status(400).json({ 
          message: 'User information missing.'
        });
      }

      
      const isValidObjectId = mongoose.Types.ObjectId.isValid(organizationId);
if (!organizationId || !isValidObjectId) {

  
  return res.status(400).json({
    message: 'Invalid organizationId.',
  });
}

  const organization = await Organization.findById(organizationId);
  const username = organization?.username;

      const application = new Application({
  userId: new mongoose.Types.ObjectId(req.user.id),
        userName: req.user.name,  
        username: req.user.username,
        jobId,
        jobTitle,
        matchScore,
        organizationId: organizationId, 
        appliedDate: new Date()
      });
      
      const savedApplication = await application.save();



        const notification = new orgNotification({
                    
                    title: `New Applied: ${jobTitle}`,
                    body: `Applied by ${req.user.name}`,
                    companyId: organizationId,
                    jobId: jobId,
                    receiver:username,
                    sender:req.user.username,
                });
                await notification.save();
        
                // Send job notification

                
      res.status(201).json(savedApplication);
    } catch (error) {
      console.error('Error saving application:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          message: 'Validation error', 
          details: error.errors 
        });
      }
      
      res.status(500).json({ message: 'error', error: error.message });
    }
  };


  const fetchApplicationData=async (req, res) => {

    try {
      if (req.user.role !== 'Organization') {
          return res.status(403).json({ message: 'u hae no access' });
        }
      
      const applications = await Application.find({ organizationId: req.user.id })
    .sort({ appliedDate: -1 })
.populate('userId', 'name _id username')
    .populate('jobId', 'title');     
  
  res.json(applications.map(app => ({
    _id: app._id,
    jobTitle: app.jobId?.title || 'unkown Job',
    userName: app.userId?.name || 'unkown User',
    status: app.status,
    appliedDate: app.appliedDate,
    matchScore: app.matchScore,
userId: app.userId?._id|| '',
username: app.userId?.username || '',

  })));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'error' });
    }
  };

  
  module.exports = {
    applicationData,
    fetchApplicationData,
    };