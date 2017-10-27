import express from 'express';
import _ from 'underscore';
import User from '../../models/user';
import { getToken, authenticate } from '../auth/authentication';

var router = express.Router();

router.use(authenticate);

export default router;
