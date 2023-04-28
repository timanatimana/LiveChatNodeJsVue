import nodemailer from "nodemailer";
import logger from "@server/utils/logger.util";
import SMTPTransport from "nodemailer/lib/smtp-transport";

interface Options {
  to: string;
  subject: string;
  text: string;
}

const sendEmail = async (options: Options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.text,
  };
  transporter.sendMail(
    mailOptions,
    function (err: Error | null, info: SMTPTransport.SentMessageInfo) {
      if (err) {
        if (err) logger.error(err);
      } else {
        logger.info(info);
      }
    }
  );
};

export default sendEmail;
