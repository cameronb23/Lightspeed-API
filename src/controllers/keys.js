import express from 'express';
import { authenticate } from './auth/authentication';
import { redisClient } from '../app';

const router = express.Router();

router.use(authenticate);


function getNewToken() {
  return new Promise((resolve, reject) => {
    const number = Math.floor(Math.random() * 89999 + 10000);

    redisClient.get(number, (err, reply) => {
      if (err) {
        console.log(err);
        return reject();
      }

      if(reply) {
        return resolve(getNewToken());
      }

      redisClient.set(number, 0, 'EX', 86400, err => {
        if (err) {
          console.log(err);
          return reject();
        }

        return resolve(number);
      });
    });
  })
}

function deleteKey(key) {
  return new Promise((resolve, reject) => {
    redisClient.del(key, err => {
      if (err) {
        console.log(err);
        return reject();
      }

      return resolve();
    });
  })
}

router.post('/', async (req, res) => {
  if(!req.decoded.admin) {
    return res.status(400).send({
      success: false,
      message: 'Insufficient permissions',
    });
  }

  try {
    const accessCode = await getNewToken();

    return res.status(201).send({
      success: true,
      message: 'Access code created.',
      code: accessCode
    });
  } catch (e) {
    return res.status(500).send({
      success: false,
      message: 'Unable to generate token at current time'
    });
  }

});

router.delete('/:key', async (req, res) => {
  if(!req.decoded.admin) {
    return res.status(400).send({
      success: false,
      message: 'Insufficient permissions',
    });
  }

  if (!req.params.key) {
    return res.status(400).send({
      success: false,
      message: 'Invalid request'
    });
  }

  try {
    await deleteKey(req.params.key);
  } catch (e) {
    return res.status(500).send({
      success: false,
      message: 'Unable to remove key. Try again later.',
    });
  }
});

export default router;
