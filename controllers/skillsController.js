const Skills = require("../models/Skills");

const getOrCreateSkillsDoc = async (userId) => {
  let userDoc = await Skills.findOne({ userId });
  if (!userDoc) {
    userDoc = new Skills({ userId });
  }
  return userDoc;
};

const addItems = (field) => async (req, res) => {
  const items = req.body[field];
  const userId = req.user.id;

  try {
    const userDoc = await getOrCreateSkillsDoc(userId);
    userDoc[field].push(...items);
    await userDoc.save();

    res.status(201).json({ message: `${field} added successfully`, [field]: userDoc[field] });
  } catch (error) {
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
  const userId = req.user.id;

  try {
    const userDoc = await Skills.findOne({ userId });
    if (!userDoc) {
      return res.status(404).json({
        skills: [], education: [], experience: [],
        certifications: [], languages: [], summary: ""
      });
    }

    res.status(200).json(userDoc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addSkills: addItems("skills"),
  deleteSkill: deleteItem("skills"),
  getSkills: getField("skills"),

  addEducation: addItems("education"),
  deleteEducation: deleteItem("education"),
  getEducation: getField("education"),

  addExperience: addItems("experience"),
  deleteExperience: deleteItem("experience"),
  getExperience: getField("experience"),

  addCertifications: addItems("certifications"),
  deleteCertifications: deleteItem("certifications"),
  getCertifications: getField("certifications"),

  addLanguages: addItems("languages"),
  deleteLanguages: deleteItem("languages"),
  getLanguages: getField("languages"),

  updateSummary,
  getAll
};
