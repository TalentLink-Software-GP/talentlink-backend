const Users = require("../models/User");
const {uploadToGCS, bucket} = require("../utils/gcsUploader");
const extractTextFromGCS = require("../utils/extractTextFromGCS");
const { Readable } = require('stream');
// const { VertexAI } = require('@google-cloud/vertexai');
// const path = require('path');

// process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, 'talentlink-456012-085abb34dcc0.json');

// const vertexAI = new VertexAI({
//   project: 'talentlink-456012',
//   location: 'us-central1', // same region where the model is hosted
// });

// const generativeModel = vertexAI.getGenerativeModel({
//   model: 'text-bison', // publisher model
// });

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

    const user = await Users.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.cvUrl) {
      try {
        const oldFileName = `cvs/${decodeURIComponent(user.cvUrl.split('/').pop())}`;
        await bucket.file(oldFileName).delete();
        console.log("Previous CV deleted:", oldFileName);
      } catch (err) {
        console.warn("No previous CV found or error deleting it:", err.message);
      }
    }

    const cv_Url = await uploadToGCS(file, "cvs");
    const filePath = cv_Url.split(`https://storage.googleapis.com/${bucket.name}/`)[1];
    const gcsUri = `gs://${bucket.name}/${filePath}`;
    console.log("GCS URI:", gcsUri);

    const extractedText = await extractTextFromGCS(gcsUri);
    console.log("Extracted Text:", extractedText);
    
    // const prompt = `
    // Extract the following structured data from this CV:
    
    // - Name
    // - Email
    // - Phone number
    // - Skills
    // - Education
    // - Work Experience
    
    // Text:
    // """${extractedText}"""
    // `;
    
    // // Run Vertex AI
    // const result = await generativeModel.generateContent({
    //   contents: [{ role: 'user', parts: [{ text: prompt }] }],
    // });
    
    // const aiOutput = result.response.candidates?.[0]?.content?.parts?.[0]?.text || "No AI response";
    // console.log("AI Structured Data:\n", aiOutput);


    const analyzedFileName = `analyzed-cvs/${userId}_${Date.now()}.txt`;
    const analyzedFile = bucket.file(analyzedFileName);

    const stream = analyzedFile.createWriteStream({
      metadata: {
        contentType: 'text/plain',
      },
    });

    await new Promise((resolve, reject) => {
      Readable.from([extractedText])
        .pipe(stream)
        .on('error', reject)
        .on('finish', resolve);
    });

    const analyzedCVUrl = `https://storage.googleapis.com/${bucket.name}/${analyzedFileName}`;

    user.cvUrl = cv_Url;
    user.analyzedCV = analyzedCVUrl;
    await user.save();

    res.status(200).json({
      message: 'CV uploaded and analyzed successfully.',
      cv_Url,
      analyzedCV: analyzedCVUrl,
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


module.exports = {getUserData, updateAvatar, deleteAvatar, uploadCV, deleteCV}