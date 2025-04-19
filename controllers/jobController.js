const Job = require('../models/Job');
const Organaization = require('../models/Organization');
const extractTextFromGCS = require('../utils/extractTextFromGCS');
const { uploadToGCS, bucket } = require('../utils/gcsUploader');
const openai = require('../utils/openaiClient');
const path = require('path');
const fs = require("fs");


const getOrgJobs = async (req, res) => {  
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: No user info in token" });
      }
  
      const organaizationId = req.user.id;  
      const organaization = await Organaization.findById(organaizationId);
      if (!organaization) {
        console.log("❌ Organization not found with ID:", organaizationId);
        return res.status(404).json({ message: "Organization Not found" });
      }
  
      console.log("✅ Organization found:", organaization.name || organaization._id);
  
      const jobs = await Job.find({ companyId: organaizationId }).sort({ deadline: -1 });
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
      const organizationId = req.user.id;
  
      if (!jobId) {
        return res.status(400).json({ message: "Job ID is required in query parameters." });
      }
  
      const job = await Job.findOneAndDelete({
        _id: jobId,
        companyId: organizationId,
      });
  
      if (!job) {
        return res.status(404).json({ message: "Job not found or you're not authorized to delete it." });
      }
  
      return res.status(200).json({ message: "Job deleted successfully", deletedJob: job });
    } catch (error) {
      console.error("❌ Error deleting job:", error);
      return res.status(500).json({ message: "Server error while deleting job" });
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

const smartAddJob = async (req, res) => {
  try {
    const organaizationId = req.user.id;
    const file = req.file;
    const rawText = req.body?.text;

    let extractedText = '';

    if (rawText) {
      extractedText = rawText;
    } else if (file) {
      const ext = path.extname(file.originalname).toLowerCase();

      if (ext === '.txt') {
        // Read plain text from file
        const contents = fs.readFileSync(file.path, 'utf-8');
        extractedText = contents;
        fs.unlinkSync(file.path); // Cleanup
      } else if (ext === '.pdf') {
        // Upload PDF to GCS
        const gcsUrl = await uploadToGCS(file, "job-files");
        const gcsUri = `gs://${bucket.name}/${gcsUrl.split(`https://storage.googleapis.com/${bucket.name}/`)[1]}`;
        console.log("Uploaded to GCS:", gcsUri);

        // Extract text using OCR
        extractedText = await extractTextFromGCS(gcsUri);
        if (!extractedText) throw new Error("OCR failed to extract any text.");

        // Cleanup
        fs.unlinkSync(file.path);
      } else {
        fs.unlinkSync(file.path); // Cleanup
        return res.status(400).json({ message: "Unsupported file format. Only .txt or .pdf allowed." });
      }
    } else {
      return res.status(400).json({ message: "No text or file provided" });
    }

    // Create prompt for AI
    const prompt = `
Given the following job description text, extract a complete JSON object that fits this job model:
{
  title: string,
  description: string,
  location: string,
  salary: string,
  jobType: one of ["Full-Time", "Part-Time", "Remote", "Internship", "Contract"],
  category: string,
  deadline: string (ISO date),
  requirements: string[],
  responsibilities: string[]
}
Only return JSON.
---

${extractedText}
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: "user", content: prompt }],
    });

    const jobData = JSON.parse(completion.choices[0].message.content);

    const newJob = new Job({ ...jobData, companyId: organaizationId });
    await newJob.save();

    return res.status(201).json({ message: "Job created via AI", job: newJob });
  } catch (err) {
    console.error("Smart Add Job Error:", err);
    return res.status(500).json({ message: "Error creating job via AI", error: err.message });
  }
};

module.exports = {getOrgJobs,getAllJobs,addJob,deleteJob,updateJob,smartAddJob}