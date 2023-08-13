const nodemailer = require('nodemailer');
require('dotenv').config()
// console.log(process.env.EMAIL_USER);
const fs = require('fs');


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
        text: `Dear ${tripDetails.userdata.username},\n \n Your Ride Order has been successfully placed! \n Driver ${tripDetails.driverdata.drivername} will reach at your location shortly \n\n Regards, \n Team Eber` 
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
function sendInvoiceEmail(userEmail, tripDetails) {

  // const cssContent = fs.readFileSync('../Public/css/style.css', 'utf8');

  // const htmlContent = fs.readFileSync('../views/invoice_template.html', 'utf8');

  const invoiceHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Invoice Template</title>
    <style>
    body {
      font-family: Arial, sans-serif;
      margin: 30px auto;
      max-width: 600px;
    }
    
    .invoice {
      border: 1px solid #ccc;
      padding: 20px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 20px;
    }
    
    .company-info, .client-info {
      margin-bottom: 20px;
    }
    
    .invoice-items {
      width: 100%;
      border-collapse: collapse;
    }
    
    .invoice-items th, .invoice-items td {
      border: 1px solid #ccc;
      padding: 8px;
    }
    
    .invoice-items th {
      background-color: #f2f2f2;
    }
    
    .text-right {
      text-align: right;
    }
    
  </style>
  </head>
  <body>
    <div class="invoice">
      <div class="header">
        <h1>Invoice</h1>
        <div class="invoice-info">
          <p>Invoice #INV001</p>
          <p>Date: ${tripDetails.ridedata.rideDate}</p>
        </div>
      </div>
      <div class="company-info">
        <h2>Eber Ride</h2>
        <p>Address: Nana Mava, Cosmoplex Cinema, Rajkot, India</p>
        <p>Email: technicalsupport@eberride.com</p>
      </div>
      <div class="client-info">
        <h2>${tripDetails.userdata.username}</h2>
        <p>Phone:  +91 ${tripDetails.userdata.userphone}</p>
        <p>Email:  ${tripDetails.userdata.useremail}</p>
        <p>Address:  ${tripDetails.ridedata.endLocation}</p>
      </div>
      <table class="invoice-items">
        <thead>
          <tr>
            <th>Sr. No</th>
            <th>Ride Details</th>
            <th>GST</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1.</td>
            <td>
              Ride Id: ${tripDetails.ridedata._id}<br> 
              Start Location: ${tripDetails.ridedata.startLocation} <br>
              End Location: ${tripDetails.ridedata.endLocation} <br>
              Total Distance: ${tripDetails.ridedata.totalDistance} Km <br>
              Total Time: ${tripDetails.ridedata.estimateTime}
            </td>
            <td>18%</td>
            <td>₹ ${tripDetails.ridedata.estimateFare.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </body>
  </html>
  
  `

    const mailOptions = {
        from: "info@ethereal.email",
        to: userEmail,
        subject : "Your Trip Invoice",
        html: invoiceHTML,
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
}
  
  

module.exports = {transporter, sendWelcomeEmail, sendRideStatus, sendInvoiceEmail};