import express from 'express';

const router = express.Router();

router.post('/create', (req, res) => {
  if (!req.body.stripeToken || !req.body.productId) {
    return res.status(400).send({
      success: false,
      message: 'Invalid payload'
    });
  }

})
