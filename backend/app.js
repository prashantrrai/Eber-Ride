const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 8080;
const SettingModel = require('./models/setting');

const http = require('http').Server(app);
const initializeSocket = require("./utils/socket")

const cors = require("cors");
app.use(cors());

const path = require("path");

app.use(express.static(path.join(__dirname, 'dist/frontend')));

const img_path = path.join(__dirname, "/Public/Vehicle");
app.use(express.static(img_path));

const profile_path = path.join(__dirname, "/Public/Profile");
app.use(express.static(profile_path));



require("./database/db");

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const fs = require('fs');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);

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
const credentials = require('./routes/credentials')
const feedbackRoutes = require('./routes/feedback')


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
app.use(credentials)
app.use(feedbackRoutes)


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/frontend/index.html'));
});

// app.get("/", async (req, res) => {
//   res.json({
//     Message: "Hello Prashant, API is Working Fine!",
//     "Login Data": `http:localhost:4000/logindata`,
//     "Vehicle Data": `http:localhost:4000/vehicledata`,
//   });
// });

initializeSocket(http)
http.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
