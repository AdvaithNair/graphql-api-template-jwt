import nodemailer from "nodemailer";

export default async function sendConfirmationEmail(email: string, url: string) {
    // Generates Test Account to Email With
  const testAccount = await nodemailer.createTestAccount();

  // Transporter Object for Email Account
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass, 
    },
  });

  // Send Email using Transporter
  const info = await transporter.sendMail({
    from: '"Advaith Nair" <advaithnair2@gmail.com>',
    to: email,
    subject: "Confirm PROJECT_NAME Account",
    text: "Confirm Account Here:",
    html: `<a href="${url}">${url}</a>`,
  });

  // Logs Message ID
  console.log("Message sent: %s", info.messageId);

  // Preview Email
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
