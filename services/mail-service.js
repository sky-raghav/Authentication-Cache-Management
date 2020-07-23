const nodemailer = require('nodemailer');

module.exports = emailer = (userEmail, orgId, resetCode) => {
  return nodemailer.createTestAccount()
  .then((testAccount) => {
    return nodemailer.createTransport({
      host:'smtp.mailtrap.io',//'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: '88e325d2cc63d7',//testAccount.user,
        pass: '75afa0209eb195',//testAccount.pass,
      },
    });
  })
  .then((transporter)=>{
    return transporter.sendMail({
      from: 'Codejudge', // sender address
      to: userEmail,  // list of receivers
      subject: orgId, // Subject line
      text: 'Here is your password Reset Code: "' + resetCode + '"', // plain text body
    });
  })
  .then((info)=>{
    //console.log('mail sent',info.messageId );
  })
  .catch((err) =>{
    throw err;
  })
}
