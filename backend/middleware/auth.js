const jwt = require('jsonwebtoken');
require("dotenv").config();         
const jwtSecret = process.env.jwtSecret         //jwt secret key used to verify jwt token stored in env varibales


// middleware to authenticate user for getting access to database and /admin route

function authenticateToken(req, res, next) {

    let token = req.header('Authorization').replace("Bearer ", "")
      
    jwt.verify(token, jwtSecret, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
  
      req.user = user;
      next();
    });
  }


  module.exports = authenticateToken
  