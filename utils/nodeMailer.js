const nodemailer = require("nodemailer");

const sendVerificationEmail = async (email, verificationCode) => {
  console.log(email);
  let testAccount = await nodemailer.createTestAccount();
  const transporter = await nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "cortez36@ethereal.email",
      pass: "QDYsYZFTVaRFRRNdr2",
    },
  });
  const info = await transporter.sendMail({
    from: '"Shakhawat Hossain 👻" <tanner61@ethereal.email>', // sender address
    to: `${email}`,
    subject: "Signup verification ✔",
    text: `Thank you for the signing up.This is your verification code ${verificationCode}`,
  });
  console.log(info);
};

module.exports = sendVerificationEmail;
