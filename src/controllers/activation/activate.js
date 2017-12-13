import express from 'express';
import request from 'request-promise';

import { verifyPassword } from '../auth/authentication';
import User from '../../models/user';

const { KEYGEN_ACCOUNT_ID } = process.env;

const KEYGEN_VALIDATION_TOKEN = process.env.VALIDATION_TOKEN;

const KEYGEN_REQUEST_BASEURL = `https://api.keygen.sh/v1/accounts/${KEYGEN_ACCOUNT_ID}`;
const KEYGEN_REQUEST_HEADERS = {
  Accept: 'application/vnd.api+json'
};

const router = express.Router();

async function validateMachine(fingerprint) {
  const opts = {
    url: `${KEYGEN_REQUEST_BASEURL}/machines?fingerprint=${fingerprint}`,
    method: 'GET',
    headers: Object.assign({}, KEYGEN_REQUEST_HEADERS, {
      Authorization: `Bearer ${KEYGEN_VALIDATION_TOKEN}`
    }),
    json: true
  }

  try {
    const res = await request(opts);

    if(res.data.length > 0) {
      return true;
    }

    return false;
  } catch(e) {
    return false;
  }
}

async function hasMachinesLeft(licenseId) {
  const opts = {
    url: `${KEYGEN_REQUEST_BASEURL}/machines?license=${licenseId}`,
    method: 'GET',
    headers: Object.assign({}, KEYGEN_REQUEST_HEADERS, {
      Authorization: `Bearer ${KEYGEN_VALIDATION_TOKEN}`
    }),
    json: true
  }

  try {
    const res = await request(opts);

    console.log(`Has ${5 - res.data.length} machine activations left.`);

    if(res.data.length >= 5) {
      console.log('Reached max');
      return false;
    }

    return true;
  } catch(e) {
    return false;
  }
}

async function createMachine(machine, license) {
  const opts = {
    url: `${KEYGEN_REQUEST_BASEURL}/machines`,
    method: 'POST',
    headers: Object.assign({}, KEYGEN_REQUEST_HEADERS, {
      Authorization: `Bearer ${KEYGEN_VALIDATION_TOKEN}`
    }),
    body: {
      data: {
        type: 'machines',
        attributes: {
          fingerprint: machine.fingerprint,
          platform: machine.platform,
          name: machine.displayName
        },
        relationships: {
          license: {
            data: {
              type: 'licenses',
              id: license.licenseId
            }
          }
        }
      }
    },
    json: true
  }

  const { data, errors } = await request(opts);

  if(data.id !== null) {
    return true;
  }
  return false;
}

router.post('/validate', async (req, res) => {
  console.log(req.body);
  try {
    const { email, productId, licenseKey, machine } = req.body;

    if(email == null || productId == null || licenseKey == null || machine == null) {
      return res.status(403).send({
        success: false,
        message: 'Failed to authenticate'
      });
    }

    const user = await User.findOne({email: email}).exec();

    if (user == null || user.licenses.filter(l => l.productId === productId).length < 1) {
      return res.status(403).send({
        success: false,
        message: 'Failed to authenticate'
      });
    }

    const license = user.licenses.filter(l => l.productId === productId)[0];

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

    console.log(meta.constant);

    if (meta.constant === 'VALID') {
      console.log('License key valid, validating machine.');
      // TODO: validate machine
      const validated = await validateMachine(machine.fingerprint);

      if(!validated) {
        // TODO: attempt to create new key
        console.log('Machine not found, creating new machine.');
        if(!hasMachinesLeft(license.licenseId)) {
          return res.status(400).send({
            success: false,
            message: 'Max machines reached.'
          });
        }

        const created = await createMachine(machine, license);

        if(!created) {
          return res.status(401).send({
            success: false,
            message: 'Failed to associate machine'
          });
        }
      }

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
    const { email, password, productId, licenseKey } = req.body;

    if(email == null || password == null || productId == null || licenseKey == null) {
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

    const prodSet = user.licenses.filter(l => l.productId === productId);

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
