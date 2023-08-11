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
      // const {ridetimeout, stop} = req.body;
      console.log(req.body);
      const id = req.body.id
      const stop = req.body.settingdata.stop
      const ridetimeout = req.body.settingdata.ridetimeout
      console.log(stop, ridetimeout);

      if(stop){
        data = {stop: stop};
      }else if(ridetimeout){
        data = {ridetimeout: ridetimeout};
      }else{
        data = {ridetimeout: ridetimeout, stop: stop}
      }
  
      let settingdata = await SettingModel.findByIdAndUpdate(id ,data, { new: true });

      await settingdata.save()
      console.log("72",settingdata)

      if (settingdata) {
        const ridetimeout = settingdata.ridetimeout;
        
        const existingEnvFile = fs.readFileSync('.env', 'utf-8');
        const updatedEnvFile = existingEnvFile.replace(/RIDETIMEOUT=\d+/, `RIDETIMEOUT=${ridetimeout}`);
        await writeFileAsync('.env', updatedEnvFile);
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

