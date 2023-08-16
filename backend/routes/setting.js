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
//     console.log("16", req.body)

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

  // const envData = {
  //   EMAIL_USER: process.env.EMAIL_USER,
  //   EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  //   accountSid: process.env.accountSid,
  //   authToken: process.env.authToken,
  //   twilioPhoneNumber: process.env.twilioPhoneNumber,
  //   STRIPE_Secret_key: process.env.STRIPE_Secret_key,
  //   STRIPE_Publishable_key: process.env.STRIPE_Publishable_key
  // };
  // res.json(envData);

  // console.log("51",envData)
    try {
        const settingData = await SettingModel.find();
        // console.log("54",settingData);
        
        res.status(200).json(settingData);
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error });
    }
})


// --------------------------------------------UPDATE SETTING DATA API---------------------------------------------//
settingRouter.put("/updatesetting", async (req, res) => {
    try {
      // const {ridetimeout, stop} = req.body;
      console.log("68",req.body);
      const id = req.body.id
      const STOP = +req.body.settingdata.stop
      const RIDE_TIMEOUT = +req.body.settingdata.ridetimeout
      const EMAIL_USER = req.body.settingdata.EMAIL_USER
      const EMAIL_PASSWORD = req.body.settingdata.EMAIL_PASSWORD
      const accountSid = req.body.settingdata.accountSid
      const authToken = req.body.settingdata.authToken
      const twilioPhoneNumber = req.body.settingdata.twilioPhoneNumber
      const STRIPE_Publishable_key = req.body.settingdata.STRIPE_Publishable_key
      const STRIPE_Secret_key = req.body.settingdata.STRIPE_Secret_key

      // if(STOP){
      //   data = {stop: STOP};
      // }else if(RIDE_TIMEOUT){
      //   data = {ridetimeout: RIDE_TIMEOUT};
      // }else if(EMAIL_USER){
      //   data = {EMAIL_USER: EMAIL_USER};
      // }else if(EMAIL_PASSWORD){
      //   data = {EMAIL_PASSWORD: EMAIL_PASSWORD};
      // }else if(accountSid){
      //   data = {accountSid: accountSid};
      // }else if(authToken){
      //   data = {authToken: authToken};
      // }else if(twilioPhoneNumber){
      //   data = {twilioPhoneNumber: twilioPhoneNumber};
      // }else if(STRIPE_Publishable_key){
      //   data = {STRIPE_Publishable_key: STRIPE_Publishable_key};
      // }else if(STRIPE_Secret_key){
      //   data = {STRIPE_Secret_key: STRIPE_Secret_key};
      // }else{
      //   data = {
      //     ridetimeout: RIDE_TIMEOUT, 
      //     stop: STOP,
      //     EMAIL_USER: EMAIL_USER,
      //     EMAIL_PASSWORD: EMAIL_PASSWORD,
      //     accountSid: accountSid,
      //     authToken: authToken,
      //     twilioPhoneNumber: twilioPhoneNumber,
      //     STRIPE_Publishable_key: STRIPE_Publishable_key,
      //     STRIPE_Secret_key:  STRIPE_Secret_key
      //   }
      // }
  
      data = {
        ridetimeout: RIDE_TIMEOUT, 
        stop: STOP,
        EMAIL_USER: EMAIL_USER,
        EMAIL_PASSWORD: EMAIL_PASSWORD,
        accountSid: accountSid,
        authToken: authToken,
        twilioPhoneNumber: twilioPhoneNumber,
        STRIPE_Publishable_key: STRIPE_Publishable_key,
        STRIPE_Secret_key:  STRIPE_Secret_key
      }

      let settingdata = await SettingModel.findByIdAndUpdate(id ,data, { new: true });

      // await settingdata.save()
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

