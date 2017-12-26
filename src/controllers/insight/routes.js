import express from 'express';
import Joi from 'joi';
import validate from 'express-validation';
import { authenticate } from '../auth/authentication';
import { query } from './queries';

const router = express.Router();

router.use(authenticate);

const queryValidate = {
  body: {
    query: Joi.string().required(),
    stockX: Joi.boolean().required(),
    goat: Joi.boolean().required(),
  },
};

router.post('/query', validate(queryValidate), async (req, res) => {
  try {
    const data = await query(req.body.query);

    return res.status(200).send(data);
  } catch (e) {
    return res.status(500).send({
      success: false,
      message: 'Unable to fetch products. Try again later.',
    });
  }
});

export default router;
