const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');

const { Email } = require('../models/email');

async function mailer(to,subject,message,template) {
  if (template) message = useEmailTemplate(message, template);
  
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: process.env.MAIL_SERVER,
    port: 465,
    secure: true, 
    auth: {
      user: process.env.MAIL_USER, 
      pass: process.env.MAIL_PASS, 
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"noreply chapar.tech" <noreply@chapar.tech>', // sender address
    to: to, //"ebi@chapar.tech", // list of receivers
    subject: subject, //"Hello ✔", // Subject line
    text: htmlToText.fromString(message),//"Hello world?", // plain text body
    html: message//"<b>Hello world?</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  //TODO: messageId can be logged
  const email = new Email({
    messageId: info.messageId,
    email: to,
    subject: subject,
    message: htmlToText.fromString(message)
  })
  try {
    await email.save();
  } catch(err) {
    console.log(err.message)
    return err;
    ;
  }

  // Preview only available when sending through an Ethereal account
  // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}


const useEmailTemplate = (message, template) => {
  if (template =='passwordRecoverTemplate' ){
    return `<span style="color: #6D9EEB; font-size:18px;" >
      chapar<span style="color: #6AA84F">.tech</span>
      </span><br><br>
      Recovery Link:<br>Please use the following link to recover your password <br>
      <a href="${process.env.APP_PATH}/recover-password/${message}" target="_blank">
        ${process.env.APP_PATH}/recover-password/${message}
      </a>`
      ;
  }
  if (template =='userRegisterTemplate' ){
    return `<span style="color: #6D9EEB; font-size:18px;" >
      chapar<span style="color: #6AA84F">.tech</span>
      </span><br><br>
      Dear ${message.name},<br>Welcome, thank you for registering at ${process.env.APP_PATH}, please verify your email address by click at the following link:<br>
      <a href="${process.env.APP_PATH}/verify-password/${message.emailVerify}" target="_blank">
        ${process.env.APP_PATH}/verify-password/${message.emailVerify}
      </a><br><br>You can also copy and paste the link to your browser:<br>
      ${process.env.APP_PATH}/verify-password/${message.emailVerify}`
      ;
  }
}

module.exports = mailer;
