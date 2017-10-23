const express = require('express');
const app = express();
const nodemailer = require('nodemailer');

// Create a SMTP transporter object
let transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 587,
  auth: {
      user: 'info@cameronb.me',
      pass: 'gj2EthN4bX2B'
  }
});

// Message object
const message = {
  from: 'Lightspeed Info <info@cameronb.me>',
  subject: 'Lightspeed Beta Information ✔',
  text: 'Hello!\nThank you for signing up for the Lightspeed beta! Information on the selection process and how to access your account if selected will be provided soon!\n\nRegards,\nCameron',
};

app.post('/emailInfo', (req, res) => {
  const email = req.query.target;
  
  if(email === null) {
    return res.status(500);
  }

  message.to = email;

  transporter.sendMail(message, (err, info) => {
    if (err) {
        console.log('Error occurred. ' + err.message);
    }
  
    console.log('Message sent: %s', info.messageId);
    res.status(200).send('Message sent');
  });
});

app.listen(process.env.PORT || 3000, function () {
  console.log('Example app listening on port 3000!')
})