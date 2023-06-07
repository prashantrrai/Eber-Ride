const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 3000;

const cors = require('cors')

const path = require('path')
const img_path = path.join(__dirname, "/Public/Upload");
app.use(express.static(img_path))

require('./database/db');
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.use(cors())

const fetchAdmin = require('./routes/fetch-Admin')
const loginRoutes = require('./routes/login-Admin')
const registerRoutes = require('./routes/register-Admin')
const deleteRoutes = require('./routes/delete-Admin')
const updateRoutes = require('./routes/update-Admin')
const VehicleRoutes = require('./routes/vehicle')
const countryRoutes = require('./routes/country')
const cityRoutes = require('./routes/city')

app.use(fetchAdmin)
app.use(loginRoutes)
app.use(registerRoutes)
app.use(deleteRoutes)
app.use(updateRoutes)
app.use(VehicleRoutes)
app.use(countryRoutes)
app.use(cityRoutes)

// const signup_data = require('./models/login_signup');
// const vehicle_schema = require("./models/vehicle_model");
// const Country_schema = require('./models/country_model')
// const City_Schema = require('./models/city_model')
 

// To show API is Working in backend on http://localhost:4000.
app.get('/', async (req, res) => {
  res.json({Message: 'Hello Prashant, API is Working Fine!', "Login Data":`http:localhost:4000/logindata`,  "Vehicle Data":`http:localhost:4000/vehicledata`})
})



app.listen(PORT, () => {
  const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    const formattedToday = dd + '/' + mm + '/' + yyyy;

    console.log(`${formattedToday} is a Gift`)
  console.log(`Server is running on http://localhost:${PORT}`);
});
 