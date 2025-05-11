const Location = require('../models/Location');
const Organization = require('../models/Organization');

const getLangLat = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized: No or expired token. Please login again." });
  }

  const { username } = req.body;

  try {
    const organization = await Organization.findOne({ username });
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const location = await Location.findOne({ companyId: organization._id });

    res.status(200).json({
      lat: location?.lat ?? 0,
      lng: location?.lng ?? 0,
    });
  } catch (error) {
    console.error("Error in getLangLat:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllCompaniesLngLat = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized: No or expired token. Please login again." });
  }

  try {
    const locations = await Location.find().populate("companyId");

    const result = locations.map((loc) => ({
      lat: loc.lat,
      lng: loc.lng,
      organization: {
        id: loc.companyId._id,
        name: loc.companyId.name,
        username: loc.companyId.username,
        industry: loc.companyId.industry,
        websiteURL: loc.companyId.websiteURL,
        country: loc.companyId.country,
        address1: loc.companyId.address1,
        address2: loc.companyId.address2,
        email: loc.companyId.email,
        avatarUrl: loc.companyId.avatarUrl,
      },
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getAllCompaniesLngLat:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const setLangLat = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized: No or expired token. Please login again." });
  }

  const organizationId = req.user.id;
  const { lat, lng } = req.body;

  try {
    const location = await Location.findOneAndUpdate(
      { companyId: organizationId },
      { lat, lng },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ message: "Location updated", location });
  } catch (error) {
    console.error("Error in setLangLat:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getLangLat,
  getAllCompaniesLngLat,
  setLangLat,
};
