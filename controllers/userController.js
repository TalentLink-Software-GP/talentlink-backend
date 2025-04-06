const Users = require("../models/User");

const getUserName = async (req,res) => {
    try{
        const{userName} = req.body;
        const user = await Users.findOne(username == userName);

        if(!user){
            return res.status(404).json({message: "User Not Found"});
        }
        return res.status(200).json({name: user.name});
    }
    catch(error){
        console.error(error);
        return res.status(500).json({message: "Internal Server Error"});
    }
};

module.exports = {getUserName}