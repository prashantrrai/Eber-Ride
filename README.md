# Eber Ride - Taxi Booking Web App

## Description
Eber Ride is a Taxi Booking Web App built using the MEAN stack technology (MongoDB, Express.js, Angular, and Node.js). This project aims to provide a convenient and efficient solution for users to book taxis online and for drivers to manage their bookings effectively.

## Features

- **User Registration and Authentication**: Users can create accounts and log in securely to access the booking functionality.
- **Search and Book Taxis**: Users can search for available taxis based on their location, view details such as driver information, ratings, and choose to book the taxi that suits their needs.
- **Real-time Tracking**: Once a booking is confirmed, users can track their taxi in real-time on a map, allowing them to know the driver's location and estimated time of arrival.
- **Multiple Payment Options**: The application supports multiple payment methods, providing users with flexibility and convenience.
- **Driver Management**: Drivers can create profiles, manage their availability, view assigned bookings, and update their status.
- **Rating and Feedback**: Users can rate their ride experience and provide feedback, helping to maintain a quality service.
- **Admin Dashboard**: An admin dashboard is available to manage users, drivers, bookings, and monitor system statistics.

## Technologies Used

- **MongoDB**: A NoSQL database used for storing user and driver information, bookings, and other relevant data.
- **Express.js**: A web application framework for Node.js used to build the server-side application logic and handle API requests.
- **Angular**: A powerful front-end framework used to develop the user interface, providing a seamless and responsive user experience.
- **Node.js**: A JavaScript runtime used for server-side development and handling server operations.
- **Socket.IO**: A library enabling real-time, bidirectional communication between the server and clients, facilitating live tracking and updates.
- **Bootstrap**: A popular CSS framework used for responsive design and styling the web application.

## Installation

1. Clone the repository: `git clone https://github.com/your-username/eber-ride.git`
2. Navigate to the project directory: `cd eber-ride`
3. Install the required dependencies:
   - Backend: `cd backend && npm install`
   - Frontend: `cd frontend && npm install`
4. Configure the application:
   - Set up the MongoDB connection string in the backend configuration file.
   - Customize other settings as required, such as payment gateway integration.
5. Start the application:
   - Backend: `cd backend && npm start`
   - Frontend: `cd frontend && npm start`
6. Access the web app in your browser: `http://localhost:4200`

## Contributing

Contributions are welcome! If you would like to contribute to the project, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix: `git checkout -b feature/your-feature`.
3. Commit your changes: `git commit -am 'Add some feature'`.
4. Push to the branch: `git push origin feature/your-feature`.
5. Submit a pull request detailing your changes.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

- The developers of the MEAN stack and other open-source technologies used in this project.
- Any additional acknowledgments or credits.

Feel free to update the sections as per your project requirements. Good luck with your Eber Ride project!

## Deployment Links

- The Backend is Hosted in AWS Elastic Beanstalk http://eberride-env.eba-83w3w3ik.ap-south-1.elasticbeanstalk.com/.
- The Frontend is Hosted in Netlify https://eberride.netlify.app.
