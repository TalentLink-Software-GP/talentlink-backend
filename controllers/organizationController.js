const Organization = require('../models/Organization'); // fixed import
const {uploadToGCS, bucket} = require("../utils/gcsUploader");

const getOrgDataWithuserName = async (req, res) => {
  try {
    console.log("🔔 Request received at getOrgDataWithuserName");
    console.log("🔍 Query parameters:", req.query);
    console.log("🔍 Headers:", req.headers);
    
    const { userName } = req.query;

    if (!userName) {
      console.log("❌ Missing username in query");
      return res.status(400).json({ message: "Missing username in query" });
    }

    console.log("🔍 Searching for organization with username:", userName);
    const user = await Organization.findOne({ username: userName }).select("+avatarUrl");

    if (!user) {
      console.log("❌ Organization not found for username:", userName);
      return res.status(404).json({ message: "User Not Found" });
    }

    console.log("✅ Found organization:", user);
    return res.status(200).json({
      name: user.name,
      avatarUrl: user.avatarUrl,
      userId: user._id,


    });
  } catch (error) {
    console.error("🔥 Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//byId 
const getProfileData = async (req, res) => {
    try {
      const organizationId = req.user.id;
      console.log("📥 getProfileData hit for ID:", organizationId);
  
      const organization = await Organization.findById(organizationId);
      if (!organization) {
        console.log("❌ Organization not found");
        return res.status(404).json({ message: "Organization Not Found" });
      }
  
      console.log("✅ Found organization:", organization.username);
  
      return res.status(200).json({
        name: organization.name,
        username: organization.username,
        industry: organization.industry,
        websiteURL: organization.websiteURL,
        country: organization.country,
        address1: organization.address1,
        address2: organization.address2,
        email: organization.email,
        avatarUrl: organization.avatarUrl,
        id: organization._id,
      });
    } catch (error) {
      console.error("❌ Error in getProfileData:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };

const updateAvatar = async (req,res) => {
    try{
        console.log("Update Hit");
        const organaizationId = req.user.id;
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: "No file uploaded." });
        }
        const imageUrl = await uploadToGCS(file);
        const organaization = await Organization.findByIdAndUpdate(
            organaizationId,
            {avatarUrl: imageUrl},
            {new: true}
        );
        res.status(200).json({avatarUrl: imageUrl, organaization});
    }catch(error){
        console.error("Avatar upload error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

const deleteAvatar = async (req,res) => {
    try{
        const organaizationId = req.user.id;
        const organaization = await Organaization.findById(organaizationId);
        if(!organaization || !organaization.avatarUrl){
            return res.status(404).json({ message: 'Avatar not found' });
        }
        const fileName = `avatars/${decodeURIComponent(organaization.avatarUrl.split('/').pop())}`;
        const file = bucket.file(fileName);
        await file.delete();
        organaization.avatarUrl = null;
        await organaization.save();
        return res.status(200).json({ message: 'Avatar removed' });
    }catch(error){
        console.error(error);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

module.exports = {getProfileData,updateAvatar,deleteAvatar,getOrgDataWithuserName}