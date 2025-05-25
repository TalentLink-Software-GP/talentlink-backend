const Organization = require('../models/Organization'); // fixed import
const {uploadToGCS, bucket} = require("../utils/gcsUploader");
const User = require("../models/User"); 


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
    const organizationId = req.body?.id || req.user?.id;
    if (!organizationId) {
      return res.status(400).json({ message: "Organization ID not provided" });
    }

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: "Organization Not Found" });
    }

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

const saveFcmToken= async (req, res) => {
 
  await Organization.updateMany(
  { fcmTokens: { $exists: false } },
  { $set: { fcmTokens: [] } }
);
  const { organizationId, fcmToken } = req.body;

  if (!organizationId || !fcmToken) {
    return res.status(400).json({ error: 'organizationId and fcmToken are required.' });
  }

  try {
    const updatedOrg = await Organization.findByIdAndUpdate(
      organizationId,
      {
        $addToSet: { fcmTokens: fcmToken },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    );

    if (!updatedOrg) {
      return res.status(404).json({ error: 'Organization not found.' });
    }

    console.log(`✅ FCM Token saved for organization ${organizationId}: ${fcmToken}`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Error saving FCM token for organization:', error);
    res.status(500).json({ error: 'Failed to save FCM token for organization' });
  }
};

const removeFcmToken= async (req, res) => {
  const { id, fcmToken } = req.body;
  
  if (!id || !fcmToken) {
    return res.status(400).json({ error: 'Organization ID and FCM token  required' });
  }
  
  try {
    const organization = await Organization.findByIdAndUpdate(
      id,
      { $pull: { fcmTokens: fcmToken } },
      { new: true }
    );
    
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    console.log(`FCM Token removed for organization ${id}: ${fcmToken}`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error removing FCM token:', error);
    res.status(500).json({ error: 'Failed to remove FCM token' });
  }
};



const followingSys= async (req, res) => {
 try {
  console.log("Following system route hit");
    // Try to find user to follow
    let userToFollow = await User.findOne({ username: req.params.username });
    
    // If not found, try organization
    if (!userToFollow) {
      userToFollow = await Organization.findOne({ username: req.params.username });
    }
    
    if (!userToFollow) {
      return res.status(404).json({ message: 'User/Organization not found' });
    }

    const currentUser = await Organization.findOne({ username: req.user.username });
    if (!currentUser) {
      return res.status(404).json({ message: 'Current user not found' });
    }

   const isFollowing = userToFollow.followers.some(
  username => username.toString() === currentUser.username.toString()
);

if (!isFollowing) {
  userToFollow.followers.push(currentUser.username);
  currentUser.following.push(userToFollow.username);
}else {
      userToFollow.followers = userToFollow.followers.filter(
        u => u !== currentUser.username
      );
      currentUser.following = currentUser.following.filter(
        u => u !== userToFollow.username
      );
    }

    await userToFollow.save();
    await currentUser.save();
    
    return res.status(200).json({ 
      message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
      following: !isFollowing
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getProfileData,
  updateAvatar,
  deleteAvatar,
  getOrgDataWithuserName,
  saveFcmToken,
  removeFcmToken,
  followingSys,
}