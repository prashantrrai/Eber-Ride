const express = require("express");
const userRoutes = express.Router()
const userModel = require("../models/users");



// Get all users
router.get('/userdata', (req, res) => {
    userModel.find()
      .then(users => res.json(users))
      .catch(err => res.status(500).json({ error: err.message }));
  });
  
  // Add a new user
  router.post('/adduser', (req, res) => {
    const newUser = new userModel(req.body);
    newUser.save()
      .then(user => res.status(201).json({ user }))
      .catch(err => res.status(400).json({ error: err.message }));
  });
  
  // Delete a user
  router.delete('/userdata/:id', (req, res) => {
    userModel.findByIdAndDelete(req.params.id)
      .then(() => res.sendStatus(204))
      .catch(err => res.status(500).json({ error: err.message }));
  });

// Update a user
userRoutes.put('/updateuser/:id', (req, res) => {
    userModel.findByIdAndUpdate(req.params.id, req.body)
        .then(() => res.sendStatus(204))
        .catch(err => res.status(500).json({ error: err.message }));
});


module.exports = userRoutes;


