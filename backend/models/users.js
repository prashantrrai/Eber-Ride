const mongoose = require("mongoose");


const user_Schema = new mongoose.Schema({
  profile: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  useremail: {
    type: String,
    required: true,
    unique: true,
  },
  countrycode: {
    type: String,
    required: true,
  },
  userphone: {
    type: String,
    required: true,
  }
});

const userModel = mongoose.model("userModel", user_Schema);



module.exports = userModel;
