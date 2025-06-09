import nodemailer from "nodemailer";

const Transporter = nodemailer.createTransport({
  service: "Yandex",
  auth: {
    user: process.env.email,
    pass: process.env.emailpassword,
  },
});
export const sendingMail = async ({
  from,
  to,
  subject,
  text,
}: {
  from: string;
  to: string;
  subject: string;
  text: string;
}) => {
  try {
    return await Transporter.sendMail({ from, to, subject, text });
  } catch (error) {
    console.log(error);
  } finally {
    console.log("here");
  }
};

