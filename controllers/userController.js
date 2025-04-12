const Users = require("../models/User");
const {uploadToGCS, bucket} = require("../utils/gcsUploader");

const getUserData = async (req,res) => {
    try{
      console.log("Distination Reached")
      const { userName } = req.query;
        const user = await Users.findOne({ username: userName });

        if(!user){
            return res.status(404).json({message: "User Not Found"});
        }
        return res.status(200).json({name: user.name, avatarUrl: user.avatarUrl});
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

const uploadCV = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No CV file uploaded." });
    }

    const cv_Url = await uploadToGCS(file, "cvs"); // Specify folder "cvs"

    const user = await Users.findByIdAndUpdate(
      userId,
      { cvUrl: cv_Url },  // Save CV URL in DB
      { new: true }
    );

    res.status(200).json({ cv_Url, user });
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


module.exports = {getUserData, updateAvatar, deleteAvatar, uploadCV, deleteCV}