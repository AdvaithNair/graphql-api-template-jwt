import nodemailer from "nodemailer";
import { PROJECT_NAME } from "../../constants";
import { SENDER_EMAIL } from "../../secrets";
import { EmailType, EmailMessage } from "../../types";

// Determines Message Depending on Email Type
const setMessage = (emailType: EmailType): EmailMessage => {
  switch (emailType) {
    case EmailType.ConfirmAccount:
      return {
        subject: `Confirm ${PROJECT_NAME} Account`,
        text: "Confirm Account Here: "
      };
    case EmailType.ForgotPassword:
      return {
        subject: `Forgot ${PROJECT_NAME} Password`,
        text: "Change Password Here: "
      };
    default:
      return {
        subject: `Unknown`,
        text: "Unknown"
      };
  }
};

// Function to Send Email
export default async function sendEmail(
  email: string,
  url: string,
  emailType: EmailType
) {
  // Generates Test Account to Email With
  const testAccount = await nodemailer.createTestAccount();

  // Transporter Object for Email Account
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });

  // Sets Message
  const message: EmailMessage = setMessage(emailType);

  // Send Email using Transporter
  const info = await transporter.sendMail({
    from: SENDER_EMAIL,
    to: email,
    subject: message.subject,
    text: message.text,
    html: `<a href="${url}">${url}</a>`
  });

  // Logs Message ID
  console.log("Message sent: %s", info.messageId);

  // Preview Email
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
