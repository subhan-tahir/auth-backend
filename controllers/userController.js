const EmployeeModel = require("../models/Employee");
const bcrypt = require("bcrypt");
const sendEmail = require("../services/emailService");
const generateAuthToken = require("../utils/authToken");
const {
  generateVerificationCode,
  sendVerificationEmail,
} = require("../utils/emailVerification");

// Store verification codes temporarily (in production, use Redis or similar)
const verificationCodes = new Map();

const registerUser = async (req, res) => {
  console.log("email", process.env.EMAIL_USER, "pass", process.env.EMAIL_PASS);
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ success: false, msg: "All fields are required" });
  }

  try {
    const exist = await EmployeeModel.findOne({ email });
    if (exist) {
      return res
        .status(400)
        .json({ success: false, msg: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await EmployeeModel.create({
      username,
      email,
      password: hashedPassword,
      isEmailVerified: false,
    });

    // Generate verification code
    const code = generateVerificationCode();

    // Store code with expiration (10 minutes)
    verificationCodes.set(email, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    // Send verification email
    const sent = await sendVerificationEmail(email, code);

    if (!sent) {
      return res
        .status(500)
        .json({ success: false, msg: "Failed to send verification email" });
    }

    // Send success response
    return res.status(201).json({
      success: true,
      msg: "Registration successful. Please verify your email.",
      user: {
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, msg: "Server error during registration" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, msg: "All fields are required" });
  }

  try {
    const user = await EmployeeModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, msg: "Email not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, msg: "Invalid credentials" });
    }

    if (!user.isEmailVerified) {
      return res
        .status(400)
        .json({ success: false, msg: "Please verify your email first" });
    }
    // if (user) {
    // return  res.status(200).json({
    //     success: true,
    //     msg: "Login successful",
    //     data: {
    //       username: user.username,
    //       email: user.email,
    //     },
    //   });

    // }
    const token = generateAuthToken(user._id);
    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
        sameSite: "Lax",
      })
      .status(200)
      .json({
        success: true,
        msg: "Login successful",
        data: {
          username: user.username,
          email: user.email,
        },
        token: {
          token,
          exptime: Date.now() + 7 * 24 * 60 * 60 * 1000,
        },
      });
  } catch (error) {
    console.error(error);
   return res.status(500).json({ success: false, msg: "Server error during login" });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
