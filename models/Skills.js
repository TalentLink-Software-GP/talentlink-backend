const mongoose = require("mongoose");
const { validate } = require("./User");

const skillsSchema = new mongoose.Schema({

    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    skills: {
        type: [string],
        validate: [arrayLimit, "Skills list exceeds the limit of 100"]
    }

})

function arrayLimit(val) {
    return val.length <= 100;
}