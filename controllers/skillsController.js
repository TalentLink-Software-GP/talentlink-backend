const Skills = require("../models/Skills");

const addSkills = async (req, res) => {
  const { skills } = req.body;
  const userId = req.user.id; // Get user ID from token
  console.log('Skills: ' + skills)
  try {
    let userSkills = await Skills.findOne({ userId });

    if (!userSkills) {
      userSkills = new Skills({ userId, skills: [], education: [] });
    }

    userSkills.skills.push(...skills);
    await userSkills.save();

    res.status(201).json({ message: "Skills added successfully", skills: userSkills.skills });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addEducation = async (req, res) => {
  const { education } = req.body;
  console.log(req.body);
  const userId = req.user.id; // Get user ID from token
  console.log('education: ' + education + "ID: " + userId)
  try {
    let userEducation = await Skills.findOne({ userId });

    if (!userEducation) {
      userEducation = new Skills({ userId, skills: [], education: [] });
    }

    userEducation.education.push(...education);
    await userEducation.save();

    res.status(201).json({ message: "Education added successfully", education: userEducation.education });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteSkill = async (req, res) => {
  const { skill } = req.body;
  const userId = req.user.id; // Get user ID from token

  try {
    const userSkills = await Skills.findOneAndUpdate(
      { userId },
      { $pull: { skills: skill } },
      { new: true }
    );

    if (!userSkills) {
      return res.status(404).json({ error: "Skill not found" });
    }

    res.status(200).json({ message: "Skill deleted successfully", skills: userSkills.skills });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteEducation = async (req, res) => {
  const { education } = req.body;
  const userId = req.user.id; // Get user ID from token

  try {
    const userEducation = await Skills.findOneAndUpdate(
      { userId },
      { $pull: { education: education } },
      { new: true }
    );

    if (!userEducation) {
      return res.status(404).json({ error: "Education not found" });
    }

    res.status(200).json({ message: "Education deleted successfully", education: userEducation.education });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllSkills = async (req, res) => {
  const userId = req.user.id; // Get user ID from token

  try {
    const user = await Skills.findOne({ userId });

    if (!user) {
      return res.status(404).json({ skills: [] });
    }

    res.status(200).json({ skills: user.skills });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllEducation = async (req, res) => {
  const userId = req.user.id; // Get user ID from token

  try {
    const user = await Skills.findOne({ userId });

    if (!user) {
      return res.status(404).json({ education: [] });
    }

    res.status(200).json({ education: user.education });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSkillsAndEducation = async (req, res) => {
  const userId = req.user.id; // Get user ID from token

  try {
    const user = await Skills.findOne({ userId });

    if (!user) {
      return res.status(404).json({ skills: [], education: [] });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addSkills, addEducation, deleteSkill, deleteEducation, getAllSkills, getAllEducation, getSkillsAndEducation };
