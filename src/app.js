const express = require('express');
const app = express();
const bodyParser = require('body-parser');

import mongoose from 'mongoose';

mongoose.connect('mongodb://admin:lightspeed@ds237735.mlab.com:37735/lightspeed', { useMongoClient: true });
mongoose.Promise = global.Promise;


//const mailRoutes = require('./controllers/mail/routes');
import publicRoutes from './controllers/public/routes';
import authRoutes from './controllers/auth/routes';
import userRoutes from './controllers/users/routes';

const AUTH_KEY = process.env.API_AUTH_KEY || 'gang';

app.use(bodyParser.json());

app.use('/', publicRoutes);
//app.use('/', mailRoutes);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

export default app;
