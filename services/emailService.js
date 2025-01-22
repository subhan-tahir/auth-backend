const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, html) => {
    try {
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com', // Gmail's SMTP server
          port: 465, // SSL port for Gmail
            secure: true,
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS, 
            },
        });

        const mailOptions = {
            to,
            subject,
            text,
            html,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to: ${to}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = sendEmail;
