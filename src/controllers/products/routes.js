import express from 'express';
import Product from '../../models/product';
import { authenticate } from '../auth/authentication';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  if(!req.decoded.admin) {
    return res.status(400).send({
      success: false,
      message: 'Insufficient permissions',
    });
  }

  try {
    const products = await Product.find().limit(25).exec();

    return res.status(200).send(products);
  } catch (e) {
    return res.status(500).send({
      success: false,
      message: 'Unable to fetch products. Try again later.',
    });
  }
});

router.post('/', async (req, res) => {
  if(!req.decoded.admin) {
    return res.status(400).send({
      success: false,
      message: 'Insufficient permissions',
    });
  }

  const newProduct = new Product(req.body);

  try {
    await newProduct.validate();
  } catch (e) {
    return res.status(400).send({
      success: false,
      message: 'Invalid payload'
    });
  }

  try {
    await newProduct.save();

    return res.status(200).send({
      success: true,
      message: 'Product saved.'
    });
  } catch (e) {
    return res.status(500).send({
      success: false,
      message: 'Failed to save product. Try again later.'
    });
  }
});

export default router;
