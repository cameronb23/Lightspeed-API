import express from 'express';

import stripeSetup from 'stripe';

const router = express.Router();
const stripe = stripeSetup('sk_test_0MNTf884MCmC930BkoQQ3rBI');



router.post('/create', (req, res) => {
  if (!req.body.stripeToken || !req.body.productId) {
    return res.status(400).send({
      success: false,
      message: 'Invalid payload'
    });
  }

})
