import request from 'request-promise';
import User from '../../models/user';
import { authenticate } from '../auth/authentication';

const { KEYGEN_ACCOUNT_ID } = process.env;

const KEYGEN_VALIDATION_TOKEN = process.env.VALIDATION_TOKEN;

const KEYGEN_REQUEST_BASEURL = `https://api.keygen.sh/v1/accounts/${KEYGEN_ACCOUNT_ID}`;
const KEYGEN_REQUEST_HEADERS = {
  Accept: 'application/vnd.api+json'
};

function generateKeyString(len, bits) {
  bits = bits || 36;
  var outStr = '', newStr;
  while (outStr.length < len)
  {
      newStr = Math.random().toString(bits).slice(2);
      outStr += newStr.slice(0, Math.min(newStr.length, (len - outStr.length)));
  }

  outStr = outStr.toUpperCase().replace(/(.{4})/g,"$1-").substring(0, outStr.length);
  return outStr;
}

export async function createKey(policy) {
  console.log('Creating new credentials for policy ' + policy);
  const key = generateKeyString(24);

  const validationOpts = {
    url: `${KEYGEN_REQUEST_BASEURL}/licenses/actions/validate-key`,
    method: 'GET',
    json: true,
    body: {
      meta: {
        key: key
      }
    },
    simple: false,
    resolveWithFullResponse: true
  };

  try {
    const res = await request(validationOpts);
    const { errors } = res.body;

    if (errors.length > 0) {
      if (errors[0].detail === 'has already been taken') {
        return createKey();
      } else if (errors[0].title === 'Not found') {
        // we good
      }
    }
  } catch (e) {
    console.log(e);
    return null;
  }

  const opts = {
    url: `${KEYGEN_REQUEST_BASEURL}/keys`,
    method: 'POST',
    headers: Object.assign({}, KEYGEN_REQUEST_HEADERS, {
      Authorization: `Bearer ${KEYGEN_VALIDATION_TOKEN}`
    }),
    body: {
      data: {
        type: 'keys',
        attributes: {
          key
        },
        relationships: {
          policy: {
            data: {
              type: 'policies',
              id: policy
            }
          }
        }
      }
    },
    json: true
  };

  try {
    const r = await request(opts);

    const licenseId = await createLicense(key, policy);

    if(licenseId) {
      return {
        key,
        licenseId
      };
    }

    return null;
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function createLicense(key, policy) {
  const opts = {
    url: `${KEYGEN_REQUEST_BASEURL}/licenses`,
    method: 'POST',
    headers: Object.assign({}, KEYGEN_REQUEST_HEADERS, {
      Authorization: `Bearer ${KEYGEN_VALIDATION_TOKEN}`
    }),
    body: {
      data: {
        type: 'licenses',
        attributes: {
          key
        },
        relationships: {
          policy: {
            data: {
              type: 'policies',
              id: policy
            }
          }
        }
      }
    },
    json: true
  };

  try {
    const res = await request(opts);

    if(res.data.id) {
      return res.data.id;
    }

    return null;
  } catch (e) {
    console.log(e);
    return null;
  }
}
