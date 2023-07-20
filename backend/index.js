const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 8080;

const http = require('http').Server(app);
const initializeSocket = require("./utils/socket")

// const cronJob = require('./utils/cron');
// cronJob.start();

// console.log(Date.now());
// console.log(new Date().getTime());

const cors = require("cors");
app.use(cors());

const path = require("path");
const img_path = path.join(__dirname, "/Public/Vehicle");
app.use(express.static(img_path));

const profile_path = path.join(__dirname, "/Public/Profile");
app.use(express.static(profile_path));

require("./database/db");

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const fetchAdmin = require("./routes/adminfetch");
const loginRoutes = require("./routes/adminlogin");
const registerRoutes = require("./routes/adminsignup");
const deleteRoutes = require("./routes/admindelete");
const updateRoutes = require("./routes/adminupdate");
const VehicleRoutes = require("./routes/vehicle");
const countryRoutes = require("./routes/country");
const cityRoutes = require("./routes/city");
const userRoutes = require("./routes/users");
const driverRoutes = require("./routes/driver");
const pricingRoutes = require("./routes/pricing");
const settingRouter = require("./routes/setting");
const createRideRoutes = require("./routes/createride");
const confirmRideRouter = require("./routes/confirmride");
const ridehistoryRouter = require("./routes/ridehistory")

app.use(fetchAdmin);
app.use(loginRoutes);
app.use(registerRoutes);
app.use(deleteRoutes);
app.use(updateRoutes);
app.use(VehicleRoutes);
app.use(countryRoutes);
app.use(cityRoutes);
app.use(userRoutes);
app.use(driverRoutes);
app.use(pricingRoutes);
app.use(settingRouter)
app.use(createRideRoutes);
app.use(confirmRideRouter);
app.use(ridehistoryRouter)

app.get("/", async (req, res) => {
  res.json({
    Message: "Hello Prashant, API is Working Fine!",
    "Login Data": `http:localhost:4000/logindata`,
    "Vehicle Data": `http:localhost:4000/vehicledata`,
  });
});

// io.on('connection', (socket) => {
//   console.log('a user connected');
//   socket.on('disconnect', () => {
//     console.log('user disconnected');
//   }); 
// });

initializeSocket(http)
http.listen(PORT, () => {
  // const today = new Date();
  //   const yyyy = today.getFullYear();
  //   let mm = today.getMonth() + 1; // Months start at 0!
  //   let dd = today.getDate();

  //   if (dd < 10) dd = '0' + dd;
  //   if (mm < 10) mm = '0' + mm;

  //   const formattedToday = dd + '/' + mm + '/' + yyyy;

  //   console.log(`${formattedToday} is a Gift`)
  console.log(`Server is running on http://localhost:${PORT}`);
});
