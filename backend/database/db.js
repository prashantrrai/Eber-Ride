const mongoose = require("mongoose");
require("dotenv").config();

// const url = 'mongodb://0.0.0.0:27017/login-auth';
const url = process.env.MONGO_URL;
// console.log(url);

mongoose.connect(url)
.then(() => {
  console.log("Database Connected")
})
.catch((error) => console.log('This is errorrr...'+error));


