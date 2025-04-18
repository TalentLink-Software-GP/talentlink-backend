const Organaization = require("../models/Organization")
const {uploadToGCS, bucket} = require("../utils/gcsUploader");

const getProfileData = async (req,res) => {
    try{
        const organaizationId = req.user.id;
        const organaization = await Organaization.findById(organaizationId)
        if(!organaization){
            return res.status(404).json({ message: "Organiazation Not Found" });
        }
        return res.status(200).json({
            name: organaization.name,
            industry:organaization.industry, 
            websiteURL: organaization.websiteURL,
            country: organaization.country,
            address1: organaization.address1,
            address2: organaization.address2,
            email:organaization.email,
            avatarUrl: organaization.avatarUrl,
        });
    }catch(error){
        console.error(error);
        return res.status(500).json({message: "Internal Server Error"});
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
        const organaization = await Organaization.findByIdAndUpdate(
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

module.exports = {getProfileData,updateAvatar,deleteAvatar}