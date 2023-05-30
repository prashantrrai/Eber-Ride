const jwt = require('jsonwebtoken');
require("dotenv").config();
const jwtSecret = process.env.jwtSecret; // jwt secret key used to verify JWT token stored in environment variables

function authenticateToken(req, res, next) {
  // Check if 'Authorization' header exists
  const authorizationHeader = req.header('Authorization');
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return res.json({message: 'API  is  working, need Login Authorization to Access Data.', status: 403, Data: "Forbidden" })
    // return res.sendStatus(403)
  }

  // Extract the token from the header
  const token = authorizationHeader.replace('Bearer ', '');

  // Verify the token
  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    req.user = user;
    next();
  });
}

module.exports = authenticateToken;


