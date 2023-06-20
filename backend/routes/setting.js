const express = require('express');
const settingRouter = express.Router();
const SettingModel = require('../models/setting');



// --------------------------------------------POST SETTING DATA API---------------------------------------------
settingRouter.post('/setting', async (req, res) => {

    const {ridetimeout, stop} = req.body;

    try {
        const settingData = new SettingModel({
            ridetimeout: ridetimeout,
            stop: stop,
        })

        await settingData.save();
        console.log(settingData);
        res.status(200).json({
            success: true,
            message: "Setting Data Added Successfully",
            settingData,
          });

    } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error });
    }
})

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
  
// // --------------------------------------------UPDATE SETTING DATA API---------------------------------------------
// settingRouter.put("/updatepricing/:id", async (req, res) => {
//     try {
//       const id = req.params.id;
//       const {ridetimeout, stop} = req.body;
  
//       const settingdata = {ridetimeout: ridetimeout, stop: stop};
  
//       await SettingModel.findByIdAndUpdate(id, settingdata, { new: true });

//       res.status(200).json({
//           success: true,
//           message: "Setting Data Updated Successfully",
//           settingdata,
//         });
//     } catch (error) {
//       console.log(error);
//       res.status(500).json({ success: false, message: error });
//     }
//   });
  