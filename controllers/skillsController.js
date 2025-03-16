const Skills = require("../models/Skills");


exports.getUserSkills = async (req, res) => {
    try {
        const userId = req.user.id;
        const skills = await Skills.findOne({ userId });

        if (!skills) {
            return res.status(404).json({ message: "No skills found for this user." });
        }

        res.status(200).json(skills);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.addUserSkills = async (req, res) => {
    try {
        const userId = req.user.id;
        const { skills } = req.body;

        if (!Array.isArray(skills) || skills.length === 0) {
            return res.status(400).json({ message: "Skills must be a non-empty array." });
        }

        let userSkills = await Skills.findOne({ userId });

        if (userSkills) {
            userSkills.skills = [...new Set([...userSkills.skills, ...skills])];

            if (userSkills.skills.length > 100) {
                return res.status(400).json({ message: "Skill list cannot exceed 100 skills." });
            }

            await userSkills.save();
            return res.status(200).json({ message: "Skills updated successfully", skills: userSkills.skills });
        } else {
            const newSkills = new Skills({ userId, skills });
            await newSkills.save();
            return res.status(201).json({ message: "Skills added successfully", skills: newSkills.skills });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.deleteSkill = async (req, res) => {
    try {
        const userId = req.user.id;
        const { skill } = req.body;

        if (!skill) {
            return res.status(400).json({ message: "Skill name is required." });
        }

        let userSkills = await Skills.findOne({ userId });

        if (!userSkills) {
            return res.status(404).json({ message: "No skills found for this user." });
        }

        const updatedSkills = userSkills.skills.filter(s => s.toLowerCase() !== skill.toLowerCase());

        if (updatedSkills.length === userSkills.skills.length) {
            return res.status(404).json({ message: "Skill not found in the user's list." });
        }

        userSkills.skills = updatedSkills;
        await userSkills.save();

        res.status(200).json({ message: "Skill removed successfully", skills: userSkills.skills });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
