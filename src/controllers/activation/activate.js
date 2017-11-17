import express from 'express';
import request from 'request-promise';

import { verifyPassword } from '../auth/authentication';
import User from '../../models/user';

const KEYGEN_ACCOUNT_ID = '23924206-776c-4b65-8809-d582882f8e9e';

const KEYGEN_VALIDATION_TOKEN = process.env.VALIDATION_TOKEN || '23924206776c4b658809d582882f8e9e.ec0dc93a288e4bf6bb66fd5a501f8bb5.0a1771b7f6e29eb27fe78dcff4748e8461781a9bec9b3dbced69e3bfb3caa29d7074e31af7304d4ee366a5136c8c3a8faecd6cf409203f48965337797e97ddv1';

const KEYGEN_REQUEST_BASEURL = `https://api.keygen.sh/v1/accounts/${KEYGEN_ACCOUNT_ID}`;
const KEYGEN_REQUEST_HEADERS = {
  Accept: 'application/vnd.api+json'
};

const router = express.Router();

router.post('/validate', async (req, res) => {
  try {
    const { productName, licenseKey } = req.body;

    if(productName == null || licenseKey == null) {
      return res.status(403).send({
        success: false,
        message: 'Failed to authenticate'
      });
    }

    const validationOpts = {
      url: `${KEYGEN_REQUEST_BASEURL}/licenses/actions/validate-key`,
      method: 'POST',
      json: true,
      body: {
        meta: {
          key: licenseKey
        }
      }
    };

    const { meta, errors } = await request(validationOpts);

    if (errors) {
      return res.status(403).send({
        success: false,
        message: 'Invalid key'
      });
    }

    if (meta.constant === 'VALID') {
      return res.status(200).send({
        success: true
      });
    }

    return res.status(401).send({
      success: false,
      message: 'Failed to validate license'
    });
  } catch (e) {
    return res.status(500).send({
      success: false,
      message: 'Unable to get credential details. Try again later.',
    });
  }
});

router.post('/activate', async (req, res) => {
  try {
    const { email, password, productName, licenseKey } = req.body;

    if(email == null || password == null || productName == null || licenseKey == null) {
      res.status(403).send({
        success: false,
        message: 'Failed to authenticate'
      });
    }

    const user = await User.findOne({email: email}).exec();

    if (user === null) {
      return res.status(403).send({
        success: false,
        message: 'No user found'
      });
    }

    const verified = await verifyPassword(password, user);

    if (!verified) {
      return res.status(403).send({
        success: false,
        message: 'Authenticated failed'
      });
    }

    const prodSet = user.licenses.filter(l => l.productName === productName);

    if(prodSet.length === 0) {
      return res.status(404).send({
        success: false,
        message: 'No license found'
      });
    }

    const prod = prodSet[0];

    if (!prod.productId || !prod.licenseKey) {
      return res.status(404).send({
        success: false,
        message: 'No license found'
      });
    }

    const validationOpts = {
      url: `${KEYGEN_REQUEST_BASEURL}/licenses/actions/validate-key`,
      method: 'POST',
      json: true,
      body: {
        meta: {
          key: licenseKey
        }
      }
    };

    const { meta, data, errors } = await request(validationOpts);

    if (errors) {
      return res.status(403).send({
        success: false,
        message: 'Invalid key'
      });
    }

    if (meta.constant === 'VALID') {
      return res.status(200).send({
        success: true,
        id: data.id,
        token: data.attributes.key,
        expiry: data.attributes.expiry
      });
    }

    return res.status(401).send({
      success: false,
      message: 'Failed to validate license'
    });
  } catch (e) {
    console.log(e.error);
    return res.status(500).send({
      success: false,
      message: 'Unable to get credential details. Try again later.',
    });
  }
});

export default router;
