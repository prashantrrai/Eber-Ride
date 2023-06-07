const mongoose = require("mongoose");


const admin_Schema = new mongoose.Schema({
  adminName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  cnfpassword: {
    type: String,
    required: true,
  }
});

const adminModel = mongoose.model("adminModel", admin_Schema);  //mapping registration data into signup data

// const document = new signup_data({ name: 'John', email: 'john@gmail.com', password: 'abcdef'});

// document.save()
// .then(() => {
//   console.log("Document inserted")
// }).catch((err) => {
//   console.log("this is error......"+ err)
// })


module.exports = adminModel;
