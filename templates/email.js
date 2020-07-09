const logoLiteral = `<span style="color: #6D9EEB; font-size:18px;" >
chapar<span style="color: #6AA84F">.tech</span>
</span>`;

const emailTemplates = (message, template) => {
  if (template =='passwordRecoverTemplate' ){
    return `${logoLiteral}<br><br>
      Recovery Link:<br>Please use the following link to recover your password <br>
      <a href="${process.env.APP_PATH}/recover-password/${message}" target="_blank">
        ${process.env.APP_PATH}/recover-password/${message}
      </a>`
      ;
  }
  if (template =='userRegisterTemplate' ){
    return `${logoLiteral}<br><br>
      Dear ${message.name},<br>Welcome, thank you for registering at ${process.env.APP_PATH}, please verify your email address by click at the following link:<br>
      <a href="${process.env.APP_PATH}/verify-email/${message.emailVerify}" target="_blank">
        ${process.env.APP_PATH}/verify-email/${message.emailVerify}
      </a><br><br>You can also copy and paste the link to your web browser:<br>
      ${process.env.APP_PATH}/verify-email/${message.emailVerify}`
      ;
  }
  if (template =='emailChangeWarningTemplate' ){
    return `${logoLiteral}<br><br>
      Dear ${message.name},<br>Your 'user email' has been changed at ${process.env.APP_PATH}.<br>
      If you did not send this request, please contact our support. 
      Otherwise you can ignore this email.<br>`
      ;
  }
  if (template =='emailChangeVerifyTemplate' ){
    return `${logoLiteral}<br><br>
      Dear ${message.name},<br>This 'user email' has been set as your new email account at ${process.env.APP_PATH}, please verify your email address by click at the following link:<br>
      <a href="${process.env.APP_PATH}/verify-email/${message.emailVerify}" target="_blank">
        ${process.env.APP_PATH}/verify-email/${message.emailVerify}
      </a><br><br>You can also copy and paste the link to your web browser:<br>
      ${process.env.APP_PATH}/verify-email/${message.emailVerify}`
      ;
  }

  if (template =='passwordChangeTemplate' ){
    return `${logoLiteral}<br><br>
      Dear ${message.name},<br>You have changed your password at ${process.env.APP_PATH}.<br>
      If you did not send this request, please contact our support. 
      Otherwise you can ignore this email.<br>`
      ;
  }

  if (template =='userEmailVerifyTemplate' ){
    return `${logoLiteral}<br><br>
      Dear ${message.name},<br>You are required to confirm your email address. Please verify your email address by click at the following link:<br>
      <a href="${process.env.APP_PATH}/verify-email/${message.emailVerify}" target="_blank">
        ${process.env.APP_PATH}/verify-email/${message.emailVerify}
      </a><br><br>You can also copy and paste the link to your web browser:<br>
      ${process.env.APP_PATH}/verify-email/${message.emailVerify}`
      ;
  }
  
}

exports.emailTemplates = emailTemplates;