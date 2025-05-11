const Skills = require("../models/Skills");
const User = require("../models/User");

const getOrCreateSkillsDoc = async (userId) => {
  let userDoc = await Skills.findOne({ userId });
  if (!userDoc) {
    userDoc = new Skills({ userId });
  }
  return userDoc;
};

const addItems = (field) => async (req, res) => {
  console.log("Add Item");
  const items = req.body[field] || (req.body.item ? [req.body.item] : []);
  const userId = req.user.id;

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: `${field} must be an array` });
  }

  try {
    const userDoc = await getOrCreateSkillsDoc(userId);
    userDoc[field].push(...items);
    await userDoc.save();

    res.status(201).json({
      message: `${field} added successfully`,
      [field]: userDoc[field],
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

const deleteItem = (field) => async (req, res) => {
  const item = req.body[field];
  const userId = req.user.id;

  try {
    const userDoc = await Skills.findOneAndUpdate(
      { userId },
      { $pull: { [field]: item } },
      { new: true }
    );

    if (!userDoc) {
      return res.status(404).json({ error: `${field} not found` });
    }

    res.status(200).json({ message: `${field} deleted successfully`, [field]: userDoc[field] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateSummary = async (req, res) => {
  const { summary } = req.body;
  const userId = req.user.id;

  try {
    const userDoc = await getOrCreateSkillsDoc(userId);
    userDoc.summary = summary;
    await userDoc.save();

    res.status(200).json({ message: "Summary updated successfully", summary: userDoc.summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getField = (field) => async (req, res) => {
  const userId = req.user.id;

  try {
    const userDoc = await Skills.findOne({ userId });
    if (!userDoc) return res.status(404).json({ [field]: [] });

    res.status(200).json({ [field]: userDoc[field] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAll = async (req, res) => {
  const requesterId = req.user?.id; // From token
  const { username } = req.body;

  if (!requesterId) {
    return res.status(401).json({ message: "Unauthorized: No token provided or invalid token" });
  }

  try {
    let targetUserId;

    if (username) {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      targetUserId = user._id;
    } else {
      targetUserId = requesterId;
    }

    const userDoc = await Skills.findOne({ userId: targetUserId });
    if (!userDoc) {
      return res.status(404).json({
        skills: [],
        education: [],
        experience: [],
        certifications: [],
        languages: [],
        summary: ""
      });
    }

    res.status(200).json(userDoc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const updateItem = (field) => async (req, res) => {
  const { oldItem, newItem } = req.body;
  const userId = req.user.id;

  try {
    const userDoc = await getOrCreateSkillsDoc(userId);
    const index = userDoc[field].indexOf(oldItem);

    if (index === -1) {
      return res.status(404).json({ error: `${field} not found` });
    }

    userDoc[field][index] = newItem;
    await userDoc.save();

    res.status(200).json({ message: `${field} updated successfully`, [field]: userDoc[field] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  // Skills
  addSkills: addItems("skills"),
  deleteSkill: deleteItem("skills"),
  updateSkill: updateItem("skills"),
  getSkills: getField("skills"),

  // Education
  addEducation: addItems("education"),
  deleteEducation: deleteItem("education"),
  updateEducation: updateItem("education"),
  getEducation: getField("education"),

  // Experience
  addExperience: addItems("experience"),
  deleteExperience: deleteItem("experience"),
  updateExperience: updateItem("experience"),
  getExperience: getField("experience"),

  // Certifications
  addCertifications: addItems("certifications"),
  deleteCertifications: deleteItem("certifications"),
  updateCertifications: updateItem("certifications"),
  getCertifications: getField("certifications"),

  // Languages
  addLanguages: addItems("languages"),
  deleteLanguages: deleteItem("languages"),
  updateLanguages: updateItem("languages"),
  getLanguages: getField("languages"),

  // Summary & Full Data
  updateSummary,
  getAll,
};

