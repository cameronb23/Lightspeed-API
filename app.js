const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

app.use(bodyParser.json());

// Create a SMTP transporter object
let transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 587,
  auth: {
      user: 'info@cameronb.me',
      pass: 'gj2EthN4bX2B'
  }
});

app.post('/sendUpdate', (req, res) => {
  try  {
    const jsonBody = req.body;

    if(jsonBody.target === null) {
      return res.status(500).send('Invalid email');
    }

    if(jsonBody.subject === null) {
      return res.status(500).send('Invalid subject');
    }

    if(jsonBody.message === null) {
      return res.status(500).send('Invalid message');
    }

    const message = {
      from: 'Lightspeed Development <info@cameronb.me>',
      to: jsonBody.target,
      subject: jsonBody.subject,
      text: jsonBody.message
    }

    transporter.sendMail(message, (err, info) => {
      if (err) {
        console.log('Error occurred. ' + err.message);
        return res.status(500).send('Error sending message');
      }

      console.log('Message sent: %s', info.messageId);
      res.status(200).send('Message sent');
    });
  } catch (e) {
    return res.status(500).send('Invalid body');
  }
});

app.listen(process.env.PORT || 3000, function () {
  console.log('Example app listening on port 3000!')
})
