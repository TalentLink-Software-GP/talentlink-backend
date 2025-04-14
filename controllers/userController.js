const Users = require("../models/User");
const {uploadToGCS, bucket} = require("../utils/gcsUploader");
const extractTextFromGCS = require("../utils/extractTextFromGCS");
const { Readable } = require('stream');
const openai = require("../utils/openaiClient");
const Skills = require('../models/Skills');

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


module.exports = {getUserData, updateAvatar, deleteAvatar, uploadCV, deleteCV}