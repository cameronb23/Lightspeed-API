import express from 'express';

import stripePackage from 'stripe';

import { createKey } from '../activation/manage';
import { authenticate } from '../auth/authentication';
import Product from '../../models/product';
import User from '../../models/user';

const router = express.Router();

const { STRIPE_KEY } = process.env;

console.log('Starting stripe with key: ' + STRIPE_KEY);

const stripe = stripePackage(STRIPE_KEY);

router.use(authenticate);

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

  if(!product.active) {
    return res.status(500).send({
      success: false,
      message: 'Product not available for purchase'
    });
  }

  stripe.charges.create({
    amount: product.price_cents,
    currency: "usd",
    description: product.title,
    source: req.body.stripeToken,
  }, async (err, charge) => {
    // asynchronously called
    if (err) {
      return res.status(500).send({
        success: false,
        message: 'Error creating payment.'
      });
    }

    // TODO: log charge to database
    const user = await User.findOne({_id: req.decoded.userId}).exec();

    const key = await createKey();

    if(key != null) {
      user.licenses.push({
        productName: product.title,
        productId: product._id,
        licenseKey: key
      });

      console.log(key);
      console.log(user);

      await user.save();
    }

    return res.status(200).send({
      success: true,
      message: 'Payment success'
    });
  });
});

export default router;
