const Users = require("../models/User");
const {uploadToGCS, bucket} = require("../utils/gcsUploader");
const extractTextFromGCS = require("../utils/extractTextFromGCS");
const { Readable } = require('stream');
const openai = require("../utils/openaiClient");
const Skills = require('../models/Skills');
const Organization = require("../models/Organization");
const User = require("../models/User"); 
const { AllPrivateUserNotification } = require("../models/Notifications");



const getUserData = async (req,res) => {
    try{
      console.log("Distination Reached")
      const { userName } = req.query;
      
        const user = await Users.findOne({ username: userName });
      if(user)
      {
        return res.status(200).json({name: user.name, avatarUrl: user.avatarUrl});

      }
      const organization = await Organization.findOne({ username: userName });
        if(organization){
          await Organization.findOne({ username: userName });
          return res.status(200).json({name: organization.name, avatarUrl: organization.avatarUrl});
        }

       else{
            return res.status(404).json({message: "User Not Found"});
        }

    }
    catch(error){
        console.error(error);
        return res.status(500).json({message: "Internal Server Error"});
    }
};


const updateAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const imageUrl = await uploadToGCS(file);

    const user = await Users.findByIdAndUpdate(
      userId,
      { avatarUrl: imageUrl },
      { new: true }
    );

    res.status(200).json({ avatarUrl: imageUrl, user });
  } catch (err) {
    console.error("Avatar upload error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

const deleteAvatar = async (req, res) => {
  console.log("🔁 deleteAvatar hit");
  console.log("req.user:", req.user);

  const userName = req.user.username;

  try {
    const user = await Users.findOne({ username: userName });
    if (!user || !user.avatarUrl) {
      return res.status(404).json({ message: 'Avatar not found' });
    }

    const fileName = `avatars/${decodeURIComponent(user.avatarUrl.split('/').pop())}`;
    const file = bucket.file(fileName);

    await file.delete();
    user.avatarUrl = null;
    await user.save();

    return res.status(200).json({ message: 'Avatar removed' });
  } catch (error) {
    console.error('Error deleting avatar:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const normalizeToNested = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'object') return [data];
  return [];
};

const uploadCV = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No CV file uploaded." });
    }

    const user = await Users.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.cvUrl) {
      try {
        const oldFileName = `cvs/${decodeURIComponent(user.cvUrl.split('/').pop())}`;
        await bucket.file(oldFileName).delete();
      } catch (err) {
        console.warn("Previous CV not found or error deleting:", err.message);
      }
    }

    const cv_Url = await uploadToGCS(file, "cvs");
    const filePath = cv_Url.split(`https://storage.googleapis.com/${bucket.name}/`)[1];
    const gcsUri = `gs://${bucket.name}/${filePath}`;

    console.log("Starting OCR for URI:", gcsUri);

    const extractedText = await extractTextFromGCS(gcsUri);

    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You're an assistant that extracts structured JSON from CV/resume text."
        },
        {
          role: "user",
          content: `You are an AI that extracts structured information from resumes. 
        
        Given the following resume text:
        
        ${extractedText}
        
        Extract the following fields as a clean JSON object:
        - fullName (string)
        - email (string)
        - phone (string)
        - skills (array of strings)
        - education (array of strings; each string should include degree, institution, and years, e.g. "B.Sc in Computer Science, XYZ University (2010–2014)")
        - experience (array of strings; each string should summarize company, role, and dates, e.g. "Software Engineer at ABC Corp (2016–2020)")
        - certifications (array of strings)
        - languages (array of strings)
        - summary (string; if not clearly present, generate a concise professional summary based on the candidate’s experience and skills)
        
        Return only a clean JSON object with no extra explanation or formatting.`
        },
      ],
      temperature: 0.2,
    });

    let structuredJsonString = chatResponse.choices[0].message.content;
    structuredJsonString = structuredJsonString.replace(/```json|```/g, '').trim();
    const parsedData = JSON.parse(structuredJsonString);

    const educationArray = normalizeToNested(parsedData.education || []).slice(0, 3);
    const skillsArray = normalizeToNested(parsedData.skills || []).flat().slice(0, 100);
    const experienceArray = normalizeToNested(parsedData.experience || parsedData.workExperience || []).slice(0, 100);
    const certificationsArray = normalizeToNested(parsedData.certifications || []).flat().slice(0, 100);
    const languagesArray = normalizeToNested(parsedData.languages || []).flat().slice(0, 100);
    const summary = parsedData.summary || '';

    console.log("Education:", JSON.stringify(educationArray, null, 2));
    console.log("Experience:", JSON.stringify(experienceArray, null, 2));
    console.log("Skills:", JSON.stringify(skillsArray, null, 2));
    console.log("Certifications:", JSON.stringify(certificationsArray, null, 2));
    console.log("Languages:", JSON.stringify(languagesArray, null, 2));
    console.log("Summary:", summary);

    const jsonFileName = `analyzed-cvs/${userId}_${Date.now()}.json`;
    const jsonFile = bucket.file(jsonFileName);

    const jsonStream = jsonFile.createWriteStream({
      metadata: { contentType: 'application/json' },
    });

    await new Promise((resolve, reject) => {
      Readable.from([JSON.stringify(parsedData, null, 2)])
        .pipe(jsonStream)
        .on('error', reject)
        .on('finish', resolve);
    });

    const analyzedJsonUrl = `https://storage.googleapis.com/${bucket.name}/${jsonFileName}`;

    await Skills.findOneAndUpdate(
      { userId: user._id },
      {
        $addToSet: {
          education: { $each: educationArray },
          experience: { $each: experienceArray },
          skills: { $each: skillsArray },
          certifications: { $each: certificationsArray },
          languages: { $each: languagesArray },
        },
        summary,
      },
      { upsert: true, new: true }
    );

    user.cvUrl = cv_Url;
    user.analyzedCV = analyzedJsonUrl;
    await user.save();

    res.status(200).json({
      message: 'CV uploaded and analyzed successfully.',
      cv_Url,
      analyzedJson: analyzedJsonUrl,
      parsedData,
      user,
    });
  } catch (err) {
    console.error("CV upload error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};


const deleteCV = async (req, res) => {
  try {
    const user = await Users.findById(req.user.id);
    if (!user || !user.cvUrl) {
      return res.status(404).json({ message: 'CV not found' });
    }

    const fileName = `cvs/${decodeURIComponent(user.cvUrl.split('/').pop())}`;
    const file = bucket.file(fileName);

    await file.delete();
    user.cvUrl = null;
    await user.save();

    return res.status(200).json({ message: 'CV removed' });
  } catch (error) {
    console.error('Error deleting CV:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};






const userByUsername = async (req, res) => {
console.log("User by username route hit");
  try {
    
    const { username } = req.params;
    const user = await Users.findOne({ username: username })
    // .populate('skills')
      // .populate('posts')
      // .populate('followers')
      // .populate('following')
      // .populate('savedPosts')
      // .populate('bookmarks');
  
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
  
  return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user by username:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const getUserCv = async (req, res) => {
  try {
    console.log("Getting CV route hit");
    //cvUrl
    const { userId } = req.params;
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ cvUrl: user.cvUrl });
  } catch (error) {
    console.error('Error getting CV:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


const getUserId= async (req, res) => {
  console.log("AWWADX");

  try {

    const user = await User.findById(req.user.id);
    console.log(user);

    console.log("Decoded token email:", req.user.email);

    
    console.log("Fetched user:", user); 

    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({ userId: user._id, username: user.username,avatarUrl: user.avatarUrl, });
  } catch (err) {
    console.error("Error in /get-user-id route:", err); 
    res.status(500).json({ msg: "Server error" });
  }
};

const getCurrentUser=async (req, res) => {
  try {
    console.log('Current User:', req.user);  

    res.status(200).json({
      name: req.user.username,
      avatarUrl: req.user.avatarUrl || '',  
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch current user' });
  }
};
const getUserStatus=async (req, res) => {
  console.log("Received request for user status");
  try {
    const user = await User.findById(req.params.userId, 'online lastSeen');
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({ 
      online: user.online, 
      lastSeen: user.lastSeen 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
const saveFcmToken= async (req, res) => {
  
  const { userId, fcmToken } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        $addToSet: { fcmTokens: fcmToken }, 
        $set: { updatedAt: new Date() } 
      },
      { new: true }
    );

    console.log(`FCM Token registered for user ${userId}: ${fcmToken}`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({ error: 'Failed to save FCM token' });
  }
};

const removeFcmToken= 
async (req, res) => {
  const { id, fcmToken } = req.body;
  
  if (!id || !fcmToken) {
    return res.status(400).json({ error: 'User ID and FCM token are required' });
  }
  
  try {
    const user = await User.findByIdAndUpdate(
      id,
      { $pull: { fcmTokens: fcmToken } },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log(`FCM Token removed for user ${id}: ${fcmToken}`);
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

    const currentUser = await User.findOne({ username: req.user.username });
    if (!currentUser) {
      return res.status(404).json({ message: 'Current user not found' });
    }

   const isFollowing = userToFollow.followers.some(
  username => username.toString() === currentUser.username.toString()
);

if (!isFollowing) {
  userToFollow.followers.push(currentUser.username);
  currentUser.following.push(userToFollow.username);
  const notification = new AllPrivateUserNotification({
 title: 'New Follower',
      body: ` ${currentUser.name} started following you.`,
      receiver: userToFollow.username,
      sender: currentUser.username,
      type: 'follower',
      newfollowFrom: currentUser.username,
          });
              await notification.save();

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



const checkFollowStatus = async (req, res) => {
  try {
    const userToCheck = await User.findOne({ username: req.params.username }) || 
                      await Organization.findOne({ username: req.params.username });

    if (!userToCheck) {
      return res.status(404).json({ message: 'User/Organization not found' });
    }

    const currentUser = await User.findOne({ username: req.user.username });
    if (!currentUser) {
      return res.status(404).json({ message: 'Current user not found' });
    }

    const isFollowing = userToCheck.followers.some(
      username => username.toString() === currentUser.username.toString()
    );

    return res.status(200).json({ isFollowing });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getUserFollowingStatus =async (req, res) => {
  console.log("User following status route hit");
  try {
    const user = await User.findOne({ username: req.params.username }) || 
                 await Organization.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      followersCount: user.followers.length,
      followingCount: user.following.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
} 


const fetchFollowList=async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }) || 
                 await Organization.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const listType = req.params.type; // 'followers' or 'following'
    const usernames = listType === 'followers' ? user.followers : user.following;

    // Fetch details for each user
    const users = await User.find({ username: { $in: usernames } })
      .select('username name avatarUrl');

    // For following list, check if current user follows them
    const currentUser = await User.findOne({ username: req.user.username });
    const followingSet = new Set(currentUser?.following || []);

    const result = users.map(u => ({
      username: u.username,
      name: u.name,
      avatarUrl: u.avatarUrl,
      isFollowing: followingSet.has(u.username)
    }));

    res.status(200).json(result);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
const getUserCvByUsername=async (req, res) => {
  try {
    console.log("Getting CV route hit");
    //cvUrl
    const { username } = req.params;
    const user = await Users.findOne({username: username});
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ cvUrl: user.cvUrl });
  } catch (error) {
    console.error('Error getting CV:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  getUserData,
   updateAvatar, 
   deleteAvatar,
    uploadCV,
     deleteCV,
     userByUsername,
     getUserCv,
     getUserId,
     getCurrentUser,
    getUserStatus,
    saveFcmToken,
    removeFcmToken,
    followingSys,
checkFollowStatus,
getUserFollowingStatus,
fetchFollowList,
getUserCvByUsername,
    }