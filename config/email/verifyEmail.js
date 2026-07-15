import fs from "fs";
import handlebars from "handlebars";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

  const emailTemplateSource = fs.readFileSync(
    path.join(_dirname, "template.hbs"),
    "utf-8",
  );
  const template = handlebars.compile(emailTemplateSource);
  const htmlToSend = template({ token: encodeURIComponent(token) });

export const verifyEmail = async (token,email) => {
  const transport = nodemailer.createTransport({
    service:"gmail",
    auth:{
      user:process.env.USER_EMAIL,
      pass:process.env.USER_EMAIL_PASSWORD
    },
  })
  const mailOptions = {
    from:process.env.USER_EMAIL,
    to:email,
    subject:"Email Verfication.",
    html:htmlToSend 
  }
transport.sendMail(mailOptions,(err,res)=>{
  if(error) throw new Error(error);
    console.log("Email has been sent successfully");
})
};