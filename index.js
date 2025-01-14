
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
// const { connectDB, getDbReport } = require('./connect');
const connectDB = require('./connect');
const cors = require('cors');
const EmployeeModel = require('./models/Employee');
const bcrypt = require('bcrypt')
const app = express();
const port = process.env.PORT || 3000;
connectDB();


// let report = 'test';
// connectDB().then(() => {
//    report = getDbReport();
// }
//body parser
// express.json() middleware is used to parse incoming JSON requests.


// Use CORS and specify your Vercel frontend domain
const corsOptions = {
   origin: 'http://localhost:5173'  //to be changed later to vercel url
 };

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

app.use(express.json());
  

//get 
app.get('/',(req,res)=>{
    console.log('hit api')
    res.send(`Hello world`)
})
app.post('/employees', async (req, res) => {
    const { email, password, username } = req.body;
    //validate input fields
    if(!email || !password || !username){
        res.json({success:true,msg:'All fields are required'});
        return
    }
    try {
        // Check if email already exists
        let exist = await EmployeeModel.findOne({ email })
        if (exist) {
            res.json({ success: false, msg: 'Email already exist' });
            return;
        }
         // Hash the password
         const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds
         console.log('Hashed Password:', hashedPassword);

        //save the user in the database
        let result = await EmployeeModel.create({ email, password:hashedPassword, username });
        console.log(result)
        
        //send response
        if (result.username) {
            res.json({ msg: 'Signed up Succesfully', success: true,data:result });
            console.log('Signed up Succesfully')
            return;
        }
        else {
            res.json({ msg: 'Not able to sign up', succes: false })
            return;
        }
    }
    catch (error) {
        console.error('Signup error:', error);
    }
})


//login
app.post('/login', async (req, res) => {
    // Extract user credentials from request body
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
        res.status(500).json({ success: false, msg: 'An error occurred during login',error:error });
    }
});

app.listen(port, console.log(`my server is running on localhost:${port}`));
