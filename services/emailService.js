const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});


async function sendEmail(to, subject, html, cc) {
  const mailOptions = {
    from: process.env.EMAIL,
    to: to,
    cc: cc,
    subject: subject,
    html: html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

module.exports = sendEmail;