import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const model = mongoose.model('Product', new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  price_cents: {
    type: Number,
    required: true
  },
  price_currency: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  }
}));

export default model;
