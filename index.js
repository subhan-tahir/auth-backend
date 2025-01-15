const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./connect');
const cors = require("cors");
const EmployeeModel = require('./models/Employee');
const bcrypt = require('bcrypt');
const app = express();
const port = process.env.PORT || 3000;
// Connect to the database
connectDB();
// Middleware to parse JSON bodies
app.use(express.json());
app.use((req, res, next) => { console.log(`Incoming request: ${req.method} ${req.path}`); console.log(`Origin: ${req.headers.origin}`); next(); });
// Enhanced CORS configuration
const allowedOrigins = ['https://auth-frontened.vercel.app']; // Add your frontend's Vercel URL
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true); // Allow the request
        } else {
            callback(new Error('Not allowed by CORS')); // Block the request
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true, // Allow cookies or credentials
};
// Use CORS middleware globally
app.use(cors(corsOptions));
// Explicitly handle OPTIONS preflight requests for all routes
app.options('*', cors(corsOptions));
// Root endpoint
app.get('/', (req, res) => {
    console.log('hit api');
    res.send('Hello world');
});
// Employee registration endpoint
app.post('/employees', async (req, res) => {
    const { email, password, username } = req.body;
    // Validate input fields
    if (!email || !password || !username) {
        return res.json({ success: false, msg: 'All fields are required' });
    }
    try {
        // Check if email already exists
        const exist = await EmployeeModel.findOne({ email });
        if (exist) {
            return res.json({ success: false, msg: 'Email already exists' });
        }
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed Password:', hashedPassword);
        // Save the user in the database
        const result = await EmployeeModel.create({ email, password: hashedPassword, username });
        console.log(result);
        // Send response
        if (result.username) {
            return res.json({ msg: 'Signed up successfully', success: true, data: result });
        } else {
            return res.json({ msg: 'Not able to sign up', success: false });
        }
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ success: false, msg: 'Server error during signup', error });
    }
});
// Login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log({ email, password });
    try {
        // Find user by email
        const user = await EmployeeModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, msg: 'Invalid email or password' });
        }
        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.json({ success: false, msg: 'Invalid email or password' });
        }
        // If the password matches, send a success response
        res.json({ success: true, msg: 'Logged in successfully', data: user });
        console.log('Logged in successfully');
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, msg: 'An error occurred during login', error });
    }
});
// Start the server
app.listen(port, () => console.log(`My server is running on localhost:${port}`));
