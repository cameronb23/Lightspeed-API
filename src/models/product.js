import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const model = mongoose.model('Product', new Schema({
  title: {
    type: String,
    required: true
  },
  media: {
    type: [String],
    required: false
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
  },
  licensable: {
    type: Boolean,
    default: false
  },
  policyId: {
    type: String,
    required: false
  }
}));

export default model;
