import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const model = mongoose.model('Product', new Schema({
  title: String,
  description: String,
  price_cents: Number,
  price_currency: String,
  digital_download: {
    resources: [{
      url: String,
      key: String
    }]
  },
}));

export default model;
