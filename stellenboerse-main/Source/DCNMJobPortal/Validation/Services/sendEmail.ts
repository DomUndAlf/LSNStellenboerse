import nodemailer from "nodemailer";
import path from "path";

require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

export const TRANSPORTER: nodemailer.Transporter = nodemailer.createTransport({
  service: "gmail",
  host: process.env.EMAIL_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates
  },
});

export let mailOptions: nodemailer.SendMailOptions = {
  from: process.env.EMAIL_USER,
};

/**
 * Send an email using the specified transporter and mail options.
 * Throws error, but it is handled in Controller
 *
 * @param transporter - The nodemailer transporter object.
 * @param mailOptions - The mail options containing email data.
 * @returns A promise that resolves when the email is sent.
 */
export async function sendMail(addresses: string[], subject: string, text: string): Promise<void> {
  mailOptions.to = addresses;
  mailOptions.subject = subject;
  mailOptions.text = text;

  await TRANSPORTER.sendMail(mailOptions);
}
