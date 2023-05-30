const mongoose = require("mongoose");

const url = 'mongodb://0.0.0.0:27017/login-auth';

mongoose.connect(url)
.then(() => {
  console.log("Database Connected")
})
.catch((error) => console.log('This is errorrr...'+error));


