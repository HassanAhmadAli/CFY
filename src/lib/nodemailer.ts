//importing modules
import nodemailer from "nodemailer";
import { Address, AttachmentLike } from "nodemailer/lib/mailer/index.js";
import { Readable } from "nodemailer/lib/xoauth2/index.js";
const Transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.email,
    pass: 'bgys gezm epji cfzk'
  },
});
export const sendingMail = async ({
  from,
  to,
  subject,
  text,
}: {
  from: string | Address | undefined;
  to: string | Address | (string | Address)[];
  subject: string;
  text: string; // | Buffer<ArrayBufferLike> | Readable | AttachmentLike
}) => {
  try {
    //return the Transporter variable which has the sendMail method to send the mail
    //which is within the mailOptions
    return await Transporter.sendMail({
      from,
      to,
      subject,
      text,
    });
  } catch (error) {
    console.log(error);
  }
};
const x = async () => {
  const from = process.env.email;
  const to = "hassan.ali.36900@outlook.com";
  const subject = "i am happy this succeeded";
  const text = "ok";
  try {
    const x = sendingMail({ from, to, subject, text });
    console.log(x);
  } catch (e) {
    console.error(e);
  }
};
x();
