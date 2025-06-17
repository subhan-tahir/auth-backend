const nodemailer = require('nodemailer');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Gmail's SMTP server
    port: 465, // SSL port for Gmail
      secure: true,
      auth: {
          user: process.env.EMAIL_USER, 
          pass: process.env.EMAIL_PASS, 
      },
  });

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('Email configuration error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Generate a 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
const sendVerificationEmail = async (email, code) => {
    console.log('user-email',email, 'code',code);
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Email credentials not configured');
    return false;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Email Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Your verification code is:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
          <strong>${code}</strong>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification code sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

module.exports = {
  generateVerificationCode,
  sendVerificationEmail
}; 