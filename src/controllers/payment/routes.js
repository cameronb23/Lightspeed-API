import express from 'express';

import stripePackage from 'stripe';

import Product from '../../models/product';

const router = express.Router();
const stripe = stripePackage('sk_test_0MNTf884MCmC930BkoQQ3rBI');



router.post('/create', async (req, res) => {
  if (!req.body.stripeToken || !req.body.productId) {
    return res.status(400).send({
      success: false,
      message: 'Invalid payload'
    });
  }

  const product = await Product.findOne({_id: req.body.productId}).exec();

  if(product === null) {
    return res.status(404).send({
      success: false,
      message: 'Invalid pid'
    });
  }

  stripe.charges.create({
    amount: product.price_cents,
    currency: "usd",
    description: product.title,
    source: req.body.stripeToken,
  }, function(err, charge) {
    // asynchronously called
    if (err) {
      return res.status(500).send({
        success: false,
        message: 'Error creating payment.'
      });
    }

    // TODO: log charge to database

    return res.status(200).send({
      success: true,
      message: 'Payment success'
    });
  });
});

export default router;
