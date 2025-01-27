
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./connect');
const cors = require("cors");
const EmployeeModel = require('./models/Employee');
const bcrypt = require('bcrypt')
const app = express();
const sendEmail = require('./services/emailService');
// const generateAuthToken = require('./utils/authtoken');
const port = process.env.PORT || 3000;
// const generateAuthToken = require('./utils/auth');
connectDB();

//body parser
// express.json() middleware is used to parse incoming JSON requests.
app.use(express.json());

// // Use CORS and specify your Vercel frontend domain

//Production
const corsOptions = {
  origin: 'https://auth-frontened.vercel.app', // Your frontend's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allowed HTTP methods
  // allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true,
};

app.use(cors(corsOptions));
// app.options('*',cors()); // Enable preflight requests for all routes

//Development
// app.use(cors());

//get   
app.get('/', (req, res) => {
    console.log('hit api')
    res.send('Hello world')
})
//register 
app.post('/employees', async (req, res) => {
    // Extract data from the request
    const { username, email, password } = req.body;

    // Validate input fields
    if (!email || !password || !username) {
        return res.status(400).json({ success: false, msg: 'All fields are required' }); // Use proper HTTP status codes
    }

    try {
        // Check if email already exists
        let exist = await EmployeeModel.findOne({ email });
        if (exist) {
            return res.status(400).json({ success: false, msg: 'Email already exists Please login to continue' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds
        console.log('Hashed Password:', hashedPassword);

        // Save the user in the database
        let result = await EmployeeModel.create({ username, email, password: hashedPassword });

        // Generate the token
        const token = generateAuthToken(result._id);

        // Send a welcome email
        const subject = 'Welcome to my Auth App!';
        const text = `Hello ${username},\n\nThank you for creating an account!`;
        const html = `<p>Hello <strong>${username}</strong>,</p><p>Thank you for creating an account!</p>`;

        try {
            await sendEmail(email, subject, text, html);
            console.log(`Welcome email sent to ${email}`);
            console.log(text)
        } catch (emailError) {
            console.error(`Failed to send welcome email:`, emailError);

        }

        // Respond with success
        return res.status(201).json({ success: true, msg: 'Signed up successfully', data: result, token });

    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ success: false, msg: 'Server error during sign-up' });
    }
});


//login
app.post('/login', async (req, res) => {
    // Extract user credentials from request body
    const { email, password } = req.body;
    console.log({ email, password });

    try {
        // Find user by email
        const user = await EmployeeModel.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, msg: "Email does not exist Please create an account." });
        }

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, msg: 'Invalid email or password' });
        }

        // Send a login notification email
        const subject = `Welcome to ${user.username}! Account Created Successfully`;
        const text = `
       
           Hello ${user.username}  Welcome to my auth-app! We're excited to have you join me.
            Your account has been successfully created with the email: ${email}.
            You can now log in to your account and start exploring all the features we have to offer.
            If you have any questions or need assistance, feel free to reach out to us.
            Thank you for joining!`

        const html = `  <p>Hello <strong>${user.username}</strong>,</p>
            <p>Welcome to my <strong>auth-app</strong>! </p>
            <img src="https://cdn-icons-png.freepik.com/512/8634/8634230.png" alt="Your App Logo" width='200px' height="200px"/>
            <p>Your account has been successfully created with the email: <strong>${email}</strong>.</p>
           `

        try {
            await sendEmail(email, subject, text, html);
            console.log(`Welcome email sent to ${email}`);
            console.log(user.username)
        }
        catch (emailError) {
            console.log(console.error(`Failed to send welcome email:`, emailError));
        }


        // Generate authentication token
        const token = generateAuthToken();

        // If the password matches, send a success response
        res.json({ success: true, msg: 'Logged in successfully', data: user, token });
        console.log('Logged in successfully');
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, msg: 'An error occurred during login', error: error });
    }
});

app.listen(port, console.log(`my server is running on localhost:${port}`));
