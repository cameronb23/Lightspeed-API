import express from 'express';

const AUTH_KEY = process.env.MAIL_API_KEY;

const SUBSCRIPTION_LIST_NAME = process.env.EMAIL_LIST_KEY;

const BASE_URL = process.env.MAILGUN_URL;
const API_KEY = process.env.MAILGUN_API_KEY;

const mailgun = require('mailgun-js')({apiKey: API_KEY, domain: BASE_URL});

const list = mailgun.lists(SUBSCRIPTION_LIST_NAME);

const router = express.Router();

router.post('/sendUpdate', (req, res) => {
  try {
    const headers = req.headers;
    if(!headers['X-API-Key'] || headers['X-API-Key'] !== AUTH_KEY) {
      return res.status(401).send('Unauthorized');
    }

    const jsonBody = req.body;

    console.log(JSON.stringify(jsonBody));

    if(jsonBody.target === null) {
      return res.status(400).send('Invalid email');
    }

    if(jsonBody.subject === null) {
      return res.status(400).send('Invalid subject');
    }

    if(jsonBody.message === null) {
      return res.status(400).send('Invalid message');
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

      console.log(body);
      console.log('Message sent: %s', body);
      res.status(200).send('Message sent');
    });
  } catch (e) {
    return res.status(400).send('Invalid body');
  }
});

router.post('/subscribe', (req, res) => {

  const jsonBody = req.body;

  if(jsonBody.email === null || jsonBody.name === null) {
    return res.status(400).send('Invalid request');
  }

  const member = {
    subscribed: true,
    address: jsonBody.email,
    name: jsonBody.name
  };


  list.members().create(member, function (error, data) {
    if(error) {
      console.log(error);
      return res.status(500).send('Error processing');
    }

    return res.status(200).send(data);
  });
});

router.post('/unsubscribe', (req, res) => {
  if(req.body.email === null) {
    return res.status(400).send('Invalid request');
  }

  list.members(req.body.email).update({ subscribed: false }, function (error, data) {
    if(error) {
      console.log(error);
      return res.status(500).send('Error processing');
    }

    return res.status(200).send(data);
  });
});

export default router;
