import nodemailer from "nodemailer";
import nodemailer from "nodemailer";
import fs from "fs";
import handlebars from "handlebars";
import path from "path";
import { fileURLToPath } from "url";

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

export const sendOtpEmail = (otp, email, token) => {
  const emailTemplateSource = fs.readFileSync(
    path.join(_dirname, "template.hbs"),
    "utf-8",
  );
  const template = handlebars.compile(emailTemplateSource);
  const htmlToSend = template({ token: encodeURIComponent(token)});
  const transport =  nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.USER_EMAIL,
        pass:process.env.USER_EMAIL_PASS
    },
  })
    const mailOption = {
    from:process.env.USER_MAIL,
    to:email,
    subject:"OTP(ONE TIME PASSWORD)",
    html: htmlToSend
  }
  transport.sendMail(mailOption,(err,res) => {
    if(err) throw new Error(err);
    console.log("Email has been sent successFully!");
  })
};