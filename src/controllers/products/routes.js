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

router.get('/:productId', async (req, res) => {
  if(!req.decoded.admin) {
    return res.status(400).send({
      success: false,
      message: 'Insufficient permissions',
    });
  }

  if (!req.params.productId) {
    return res.status(400).send({
      success: false,
      message: 'Invalid request'
    });
  }

  try {
    const product = await Product.findOne({_id: req.params.productId}).exec();

    console.log(product);

    return res.status(200).send(product);
  } catch (e) {
    return res.status(404).send({
      success: false,
      message: 'Product not found',
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

router.put('/:productId', async (req, res) => {
  if(!req.decoded.admin) {
    return res.status(400).send({
      success: false,
      message: 'Insufficient permissions',
    });
  }

  if (!req.params.productId) {
    return res.status(400).send({
      success: false,
      message: 'Invalid request'
    });
  }

  try {
    const product = await Product.findOne({_id: req.params.productId}).exec();

    product.set(req.body);

    await product.save();

    return res.status(200).send({
      success: true,
      message: 'Successfully saved product details'
    });
  } catch (e) {
    return res.status(500).send({
      success: false,
      message: 'Unable to save product. Try again later.',
    });
  }
});

router.delete('/', async (req, res) => {
  if(!req.decoded.admin) {
    return res.status(400).send({
      success: false,
      message: 'Insufficient permissions',
    });
  }

  if (!req.body || !req.body.length < 1) {
    return res.status(400).send({
      success: false,
      message: 'Invalid request'
    });
  }

  try {

    console.log(req.body);

    await Product.remove({_id: { $in: req.body.ids }}).exec();

    return res.status(200).send({
      success: true,
      message: 'Successfully removed products'
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send({
      success: false,
      message: 'Unable to remove products. Try again later.',
    });
  }
});

router.delete('/:productId', async (req, res) => {
  if(!req.decoded.admin) {
    return res.status(400).send({
      success: false,
      message: 'Insufficient permissions',
    });
  }

  if (!req.params.productId) {
    return res.status(400).send({
      success: false,
      message: 'Invalid request'
    });
  }

  try {
    await Product.remove({_id: req.params.productId}).exec();

    return res.status(200).send({
      success: true,
      message: 'Successfully removed product'
    });
  } catch (e) {
    return res.status(500).send({
      success: false,
      message: 'Unable to remove product. Try again later.',
    });
  }
});

export default router;
