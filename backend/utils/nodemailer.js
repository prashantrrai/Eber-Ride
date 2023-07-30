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
        text: `Hi ${tripDetails.userdata.username},\n \n Your Ride Order has been successfully placed! \n Driver ${tripDetails.driverdata.drivername} will reach at your location shortly \n\n Regards, \n Team Eber` 
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
        <p>Address: 123 Main Street, Rajkot, India</p>
        <p>Email: support@eberride.com</p>
      </div>
      <div class="client-info">
        <h2>${tripDetails.userdata.username}</h2>
        <p>Address: ${tripDetails.ridedata.endLocation}</p>
        <p>Email: ${tripDetails.userdata.useremail}</p>
      </div>
      <table class="invoice-items">
        <thead>
          <tr>
            <th>Item</th>
            <th>Description</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Item 1</td>
            <td>Item 1 Description</td>
            <td>2</td>
            <td>$50.00</td>
            <td>$100.00</td>
          </tr>
          <tr>
            <td>Item 2</td>
            <td>Item 2 Description</td>
            <td>1</td>
            <td>$75.00</td>
            <td>$75.00</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" class="text-right">Subtotal:</td>
            <td>$175.00</td>
          </tr>
          <tr>
            <td colspan="4" class="text-right">Tax (18%):</td>
            <td>$17.50</td>
          </tr>
          <tr>
            <td colspan="4" class="text-right">Total:</td>
            <td>$ ${tripDetails.ridedata.estimateFare}</td>
          </tr>
        </tfoot>
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