const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mailgunApi = require('mailgun-js');

app.use(bodyParser.json());


const BASE_URL = process.env.MAILGUN_URL;
const API_KEY = process.env.MAILGUN_API_KEY;

const mailgun = mailgunApi({apiKey: API_KEY, domain: BASE_URL});

app.post('/sendUpdate', (req, res) => {
  try {
    const jsonBody = req.body;

    console.log(JSON.stringify(jsonBody));

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

    mailgun.messages().send(message, function (error, body) {
      if (error) {
        console.log('Error occurred. ' + error.message);
        return res.status(500).send('Error sending message');
      }

      console.log('Message sent: %s', body);
      res.status(200).send('Message sent');
    });
  } catch (e) {
    return res.status(500).send('Invalid body');
  }
});

app.listen(process.env.PORT || 3000, function () {
  console.log('Example app listening on port 3000!')
})
