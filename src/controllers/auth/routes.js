const express = require('express');
const { authenticate } = require('./authentication');

var router = express.Router();

router.use(authenticate);


export default router;
