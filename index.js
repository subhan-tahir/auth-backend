require('dotenv').config();
const express = require('express');
const connectDB = require('./connect');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const emailVerificationRoutes = require('./routes/emailVerification');

// dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json()); // for parsing application/json
app.use(cookieParser()); // to read cookies from the request

// CORS setup
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // Your frontend URL
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Routes
app.use(userRoutes);
app.use(emailVerificationRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
