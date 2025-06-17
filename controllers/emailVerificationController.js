const {
  generateVerificationCode,
  sendVerificationEmail,
} = require("../utils/emailVerification");
const User = require("../models/Employee");

// Store verification codes temporarily (in production, use Redis or similar)
const verificationCodes = new Map();
console.log("verificationCodes", verificationCodes);
const sendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Request to send code to:", email);

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate verification code
    const code = generateVerificationCode();

    // Attempt to send email
    const sent = await sendVerificationEmail(email, code);

    if (!sent) {
      console.error(`Email sending failed for ${email}`);
      return res
        .status(500)
        .json({ message: "Failed to send verification email" });
    }
    const normalizedEmail = email.trim().toLowerCase();
    // Store code with expiration
    verificationCodes.set(normalizedEmail, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes in milliseconds,
    });
    console.log("verificationCodes...", verificationCodes);
    return res
      .status(200)
      .json({ message: "Verification code sent successfully" });
  } catch (error) {
    console.error("Error in sendVerificationCode:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    console.log("email", email, "code", code);
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required.",
      });
    }
    const normalizedEmail = email.toLowerCase();
    // verificationCodes.set(email, {
    //   code,
    //   expiresAt: Date.now() + 10 * 60 * 1000,
    // });
    const data = verificationCodes.get(normalizedEmail);
    console.log("data", data);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "No verification code found for this email.",
      });
    }

    if (Date.now() > data.expiresAt) {
      verificationCodes.delete(normalizedEmail);
      return res.status(400).json({
        success: false,
        message: "Verification code has expired.",
      });
    }

    if (code !== data.code) {
      return res.status(400).json({
        success: false,
        message: "Incorrect verification code.",
      });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { isEmailVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    verificationCodes.delete(normalizedEmail);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (error) {
    console.error("Error in verifyCode:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during verification.",
    });
  }
};

const resendCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Generate new code
    const code = generateVerificationCode();

    // Send email
    const sent = await sendVerificationEmail(normalizedEmail, code);
    if (!sent) {
      console.error(`Email sending failed for ${normalizedEmail}`);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email.",
      });
    }

    // Store new code
    verificationCodes.set(normalizedEmail, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 mins
    });

    return res.status(200).json({
      success: true,
      message: "Verification code resent successfully.",
    });
  } catch (error) {
    console.error("Error in resendCode:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during code resending.",
    });
  }
};

module.exports = {
  sendVerificationCode,
  verifyCode,
  resendCode,
};
