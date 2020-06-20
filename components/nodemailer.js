const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');

async function mailer(to,subject,message,template) {
  if (template) {
    message = getTemplate(message, template);
  }
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: process.env.MAIL_SERVER,
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USER, // generated ethereal user
      pass: process.env.MAIL_PASS, // generated ethereal password
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
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}


const getTemplate = (message, template) => {
  if (template=='passwordRecover'){
    return `<span style="color: #6D9EEB; font-size:18px;" >
      chapar<span style="color: #6AA84F">.tech</span>
      </span><br><br>Recovery Link:<br>Please use the following link to recover your password:<br>
      <a href="${process.env.APP_PATH}/recover-password/${message}" target="_blank">
      http://chapar.tech/recover-password/${message}</a>`
      ;
  }
}

module.exports = mailer;
//main().catch(console.error);