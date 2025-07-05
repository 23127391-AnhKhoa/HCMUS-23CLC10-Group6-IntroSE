// services/mail.service.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendOTPEmail = async (to, otp) => {
  const mailOptions = {
    from: `"FREELAND" <${process.env.MAIL_USER}>`,
    to: to,
    subject: 'Your OTP Code for FREELAND',
    html: `
      <h2>Welcome to FREELAND!</h2>
      <p>Your One-Time Password (OTP) for registration is:</p>
      <h1 style="color: blue;">${otp}</h1>
      <p>This code will expire in 5 minutes.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail };