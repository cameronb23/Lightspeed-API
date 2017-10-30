import express from 'express';

import stripeSetup from 'stripe';

const router = express.Router();
const stripe = stripeSetup('sk_test_0MNTf884MCmC930BkoQQ3rBI');



router.post('/create', (req, res) => {
  if (!req.body.stripeToken) {
    return res.status(400).send({
      success: false,
      message: 'Invalid payload'
    });
  }

  stripe.charges.create({
    amount: 1000,
    currency: "usd",
    description: "Test charge",
    source: req.body.stripeToken,
  }, function(err, charge) {
    // asynchronously called
    console.log(charge);
    if (err) {
      return res.status(500).send({
        success: false,
        message: 'Error charging card.'
      });
    }

    return res.status(200).send({
      success: true,
      message: 'Payment success'
    });
  });
})
