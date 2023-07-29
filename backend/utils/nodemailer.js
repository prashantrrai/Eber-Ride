const nodemailer = require('nodemailer');
require('dotenv').config()
// console.log(process.env.EMAIL_USER);


// Nodemailer configuration using Gmail SMTP
const transporter = nodemailer.createTransport({
//   service: process.env.EMAIL_SERVICE,
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    // type: "OAuth2",
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});


//-------------------------------SEND WELCOME EMAIL--------------------------------//
function sendWelcomeEmail(userEmail) {
  const mailOptions = {
      from: "info@ethereal.email",
      to: userEmail,
      subject : "Account Created Successfully",
      text: `Welcome to Eber Ride! \n Your Account has been Successfully Created.` 
  };
  
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
}


//-------------------------------SEND RIDE STATUS EMAIL--------------------------------//
function sendRideStatus(userEmail, tripDetails) {
    const mailOptions = {
        from: "info@ethereal.email",
        to: userEmail,
        subject : "Eber Ride Status",
        text: `Your Ride Order has been successfully placed! \n Here is your trip invoice :\n ${tripDetails.ridedata} \n ${tripDetails.driverdata}` 
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
}

//-------------------------------SEND INVOICE DETAILS EMAIL--------------------------------//

// function sendInvoiceEmail(userEmail, tripDetails) {
//     const mailOptions = {
//         from: "info@ethereal.email",
//         to: userEmail,
//         subject : "Your Trip Invoice",
//         text: "Thank you for using our service.\n Here is your trip invoice :\n${JSON.stringify(tripDetails)}" 
//     };
    
//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//           console.log('Error sending email:', error);
//         } else {
//           console.log('Email sent:', info.response);
//         }
//       });
// }
  
  

module.exports = {transporter, sendWelcomeEmail, sendRideStatus};