const Job = require('../models/Job');
const Organaization = require('../models/Organization');


const getOrgJobs = async (req, res) => {
    console.log("🔍 [getOrgJobs] Route hit");
  
    try {
      if (!req.user) {
        console.log("❌ No req.user found.");
        return res.status(401).json({ message: "Unauthorized: No user info in token" });
      }
  
      const organaizationId = req.user.id;
      console.log("✅ User ID from token:", organaizationId);
  
      const organaization = await Organaization.findById(organaizationId);
      if (!organaization) {
        console.log("❌ Organization not found with ID:", organaizationId);
        return res.status(404).json({ message: "Organization Not found" });
      }
  
      console.log("✅ Organization found:", organaization.name || organaization._id);
  
      const jobs = await Job.find({ companyId: organaizationId }).sort({ createdAt: -1 });
      console.log("📦 Jobs found:", jobs.length);
  
      return res.status(200).json(jobs);
  
    } catch (error) {
      console.error("🔥 Server error in getOrgJobs:", error);
      return res.status(500).json({ message: 'Error fetching jobs' });
    }
  };

const getAllJobs = async (req,res) => {
    try {
        const jobs = await Job.find().sort({createdAt : -1});
        if(!jobs){
            return res.status(204).json({message: "No Available Jobs rigte Now"});
        }
        return res.status(200).json(jobs);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching jobs' });
    }
}

const addJob = async (req,res) => {
    console.log("Reach Add Job");
    try {
        const {
            title,
            description,
            location,
            salary,
            jobType,
            category,
            deadline,
            requirements,
            responsibilities,
          } = req.body;
        const organaizationId = req.user.id;
        const organaization = await Organaization.findById(organaizationId);
        if(!organaization){
            return res.status(404).json({ message: "Organization Not found"});
        }
        const newJob = new Job({
            title,
            description,
            location,
            salary,
            jobType,
            category,
            deadline,
            requirements,
            responsibilities,
            companyId: organaizationId
          });
          console.log(newJob);
          await newJob.save();
          
          return res.status(201).json({message:"Job Created Successfully", job: newJob});
    } catch (error) {
        console.log("Server Error: " + error)
        return res.status(500).json({ message: 'Server error while adding job'});
    }
}

const deleteJob = async (req, res) => {
    try {
        const jobId = req.query.jobId;
        const organaizationId = req.user.id;

        const job = await Job.findOneAndDelete({
            _id: jobId,
            companyId: organaizationId,
        });

        if (!job) {
            return res.status(404).json({ message: "Job not found or unauthorized" });
        }

        return res.status(200).json({ message: "Job deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting job" });
    }
};


const updateJob = async (req, res) => {
    try {
        const jobId = req.query.jobId;
        const organaizationId = req.user.id;

        const job = await Job.findOneAndUpdate(
            { _id: jobId, companyId: organaizationId },
            req.body,
            { new: true }
        );

        if (!job) {
            return res.status(404).json({ message: "Job not found or unauthorized" });
        }

        return res.status(200).json({ message: "Job updated successfully", job });
    } catch (error) {
        return res.status(500).json({ message: "Error updating job" });
    }
};

module.exports = {getOrgJobs,getAllJobs,addJob,deleteJob,updateJob}