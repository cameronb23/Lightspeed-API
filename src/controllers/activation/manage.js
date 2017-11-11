import request from 'request-promise';
import User from '../../models/user';
import { authenticate } from '../auth/authentication';

const KEYGEN_ACCOUNT_ID = '23924206-776c-4b65-8809-d582882f8e9e';

const KEYGEN_VALIDATION_TOKEN = process.env.VALIDATION_TOKEN;

const KEYGEN_REQUEST_BASEURL = `https://api.keygen.sh/v1/accounts/${KEYGEN_ACCOUNT_ID}`;
const KEYGEN_REQUEST_HEADERS = {
  Accept: 'application/vnd.api+json'
};

const POLICY_ID = '22e45b06-4d49-4b12-8f50-b37102232671';

function generateKeyString(len, bits) {
    bits = bits || 36;
    var outStr = '', newStr;
    while (outStr.length < len)
    {
        newStr = Math.random().toString(bits).slice(2);
        outStr += newStr.slice(0, Math.min(newStr.length, (len - outStr.length)));
    }

    outStr = outStr.toUpperCase().replace(/(.{4})/g,"$1-").toUpperCase().substring(0, outStr.length - 1);
    return outStr;
}

export async function createKey() {
  console.log('Creating new credentials.');
  const key = generateKeyString();
  console.log('Generated key: ' + key);

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
    console.log(JSON.stringify(res.body));
    const { errors } = res.body;

    if (errors.length > 0) {
      if (errors[0].detail === 'has already been taken') {
        return createKey();
      }
      return null;
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
              id: POLICY_ID
            }
          }
        }
      }
    },
    json: true
  };

  try {
    const r = await request(opts);
    console.log(JSON.stringify(r));

    const res = await createLicense(key);

    if(res) {
      return key;
    }

    return null;
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function createLicense(key) {
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
              id: POLICY_ID
            }
          }
        }
      }
    },
    json: true
  };

  try {
    const res = await request(opts);

    console.log(res);

    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}
