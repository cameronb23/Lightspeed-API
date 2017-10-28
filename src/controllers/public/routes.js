import express from 'express';
import _ from 'underscore';
import User from '../../models/user';
import { getToken } from '../auth/authentication';

const router = express.Router();

router.post('/authenticate', function(req, res) {
  // find the user
  User.findOne({
    email: req.body.email
  }, async (err, user) => {
    if (err) {
      res.send(500).json({
        success: false,
        message: 'Internal error'
      });
      return console.log(err);
    }

    if (!user) {
      res.json({
        success: false,
        message: 'User not found'
      });
    }
    // TODO: plaintext???? wtf is this 1992
    if (user.password != req.body.password) {
      return res.status(403).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    const token = await getToken(user);

    // return the information including token as JSON
    res.json({
      success: true,
      message: 'Authentication successful',
      token: token
    });

  });
});

router.post('/register', (req, res) => {

  const requiredKeys = ['first_name', 'last_name', 'email', 'password', 'access_key'];

  const formKeys = _.keys(req.body);

  for(let keyIndex in requiredKeys) {
    const key = requiredKeys[keyIndex];
    if(!formKeys.includes(key) ||
        req.body[key] === '' ||
        req.body[key] === null) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request.'
      });
    }
  }

  if(req.body.access_key !== 'cameron_123') {
    return res.status(400).json({
      success: false,
      message: 'Incorrect access key'
    });
  }

  // TODO: plaintext???? wtf is this 1992

  var user = new User({
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    password: req.body.password,
    admin: (req.body.email.toLowerCase() === 'cbutler2018@gmail.com')
  });

  // save the sample user
  user.save(function(err) {
    if (err) throw err;

    console.log('User saved successfully');
    return res.json({ success: true, message: 'Successfully registered.' });
  });

});

export default router;
