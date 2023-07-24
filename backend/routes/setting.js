const express = require('express');
const settingRouter = express.Router();
const SettingModel = require('../models/setting');

require("dotenv").config();

const fs = require('fs');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);


// --------------------------------------------POST SETTING DATA API---------------------------------------------
// settingRouter.post('/setting', async (req, res) => {

//     const {ridetimeout, stop} = req.body;

//     try {
//         const settingData = new SettingModel({
//             ridetimeout: ridetimeout,
//             stop: stop,
//         })

//         await settingData.save();
//         console.log(settingData);
//         res.status(200).json({
//             success: true,
//             message: "Setting Data Added Successfully",
//             settingData,
//           });

//     } catch (error) {
//     console.log(error);
//     res.status(500).json({ success: false, message: error });
//     }
// })

// --------------------------------------------GET SETTING DATA API---------------------------------------------
settingRouter.get('/settingdata', async (req, res) => {
    try {
        const settingData = await SettingModel.find();
        // console.log(settingData);
        
        res.status(200).json({
            success: true,
            message: "Setting Data Found Successfully",
            settingData,
            });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error });
    }
})

// // --------------------------------------------UPDATE SETTING DATA API---------------------------------------------
settingRouter.put("/updatesetting", async (req, res) => {
    try {
      const {ridetimeout, stop} = req.body;
      console.log(req.body);

      id = req.body.id
      console.log(id);

      if(stop){
        data = {stop: stop};
      }else{
        data = {ridetimeout: ridetimeout};
      }
  
      let settingdata = await SettingModel.findByIdAndUpdate(id ,data, { new: true });

      await settingdata.save()
      console.log(settingdata)

      if (settingdata) {
        const ridetimeout = settingdata.ridetimeout;
        
        const existingEnvFile = fs.readFileSync('.env', 'utf-8');
        // const newline = existingEnvFile.endsWith('\n') ? '' : '\n';
        const updatedEnvFile = existingEnvFile.replace(/RIDETIMEOUT=\d+/, `RIDETIMEOUT=${ridetimeout}`);
        await writeFileAsync('.env', updatedEnvFile);
        // await writeFileAsync('.env', `RIDETIMEOUT=${ridetimeout}\n`, { flag: 'a' });
        // dotenv.config(); 
      }

      
      res.status(200).json({
          success: true,
          message: "Setting Data Updated Successfully",
          settingdata,
        });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error, error: error.message });
    }
  });

module.exports = settingRouter;



// // --------------------------------------------DELETE SETTING DATA API---------------------------------------------
// settingRouter.delete("/deletesetting/:id", async (req, res) => {
//     try {
//       const id = req.params.id;
//       const settingData = await SettingModel.findByIdAndDelete(id);
//       res.status(200).json({
//           success: true,
//           message: "Setting Data Deleted Successfully",
//           settingData,
//         });
//     } catch (error) {
//       console.log(error);
//       res.status(500).json({ success: false, message: error });
//     }
//   });
  

  