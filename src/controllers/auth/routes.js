const express = require('express');
const User = require('../../models/user');
const { getToken, authenticate } = require('./authentication');

var router = express.Router();

router.use(authenticate);


export default router;
