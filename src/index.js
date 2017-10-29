import mongoose from 'mongoose';
import app from './app';

mongoose.connect('mongodb://admin:lightspeed@ds237735.mlab.com:37735/lightspeed', { useMongoClient: true });
mongoose.Promise = global.Promise;

const { PORT = 8080 } = process.env;

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  app.listen(PORT, () => console.log(`Listening on port ${PORT}`)); // eslint-disable-line no-console
});
