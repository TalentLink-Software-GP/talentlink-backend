const Organization = require('../models/Organization');
const JobMatch = require('../models/jobMatch');

const getMatchSortedByScore = async (req, res) => {
    try {
      const organizationId = req.user.id;
      const { jobId } = req.body;
  
      const organization = await Organization.findById(organizationId);
      if (!organization) {
        return res.status(401).json({ message: "Unauthorized: No user info in token" });
      }
  
      const jobMatches = await JobMatch.find({
        jobId,
        matchScore: { $gt: 50 }
      })
      .sort({ matchScore: -1 })
      .populate('userId');
  
      if (!jobMatches || jobMatches.length === 0) {
        return res.status(404).json({ message: "No matched users for this job above 50%" });
      }
  
      return res.status(200).json(jobMatches);
    } catch (e) {
      console.error("Error fetching job matches:", e);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  

module.exports = {getMatchSortedByScore};
