const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const redis = require('redis');
const cors = require('cors');

//const mailRoutes = require('./controllers/mail/routes');
import publicRoutes from './controllers/public/routes';
import authRoutes from './controllers/auth/routes';
import userRoutes from './controllers/users/routes';
import productRoutes from './controllers/products/routes';
import paymentRoutes from './controllers/payment/routes';
import keyRoutes from './controllers/keys';

const AUTH_KEY = process.env.API_AUTH_KEY || 'gang';

app.use(bodyParser.json());
app.use(cors());

app.use('/', publicRoutes);
//app.use('/', mailRoutes);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/payments', paymentRoutes);
app.use('/keys', keyRoutes);

const { REDIS_URL } = process.env;

export const redisClient = redis.createClient(REDIS_URL);

redisClient.on("error", err => {
  console.log("Error " + err);
});

redisClient.on('ready', () => {
  console.log('Redis connection established');
});


export default app;
