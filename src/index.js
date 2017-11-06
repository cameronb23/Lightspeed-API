import mongoose from 'mongoose';
import app from './app';

const { MONGO_URL } = process.env;

mongoose.connect(MONGO_URL, { useMongoClient: true });
mongoose.Promise = global.Promise;

const { PORT = 3000 } = process.env;

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  app.listen(PORT, () => console.log(`Listening on port ${PORT}`)); // eslint-disable-line no-console
});
