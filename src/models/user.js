// get an instance of mongoose and mongoose.Schema
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
const model = mongoose.model('User', new Schema({
  first_name: String,
  last_name: String,
  email: String,
  password: String,
  admin: Boolean
}));

export default model;
