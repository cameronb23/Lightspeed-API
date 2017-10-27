const promisify = require('promisify-node');
const jwebtoken = require('jsonwebtoken');
const jwt = promisify(jwebtoken);


export async function getToken(user) {
  return jwt.sign({ userId: user._id, admin: user.admin }, 'abc', {
    expiresIn: 1440
  });
}

export async function verifyToken(token) {
  try {
    return jwt.verify(token, 'abc');
  } catch (e) {
    throw e;
  }
}


export async function authenticate(req, res, next) {
  // check header or url parameters or post parameters for token
  const token = req.body.token ||
                req.query.token ||
                req.headers['x-access-token'];

  if (token) {
    try {
      const decoded = await verifyToken(token);

      req.decoded = decoded;
      next();
    } catch (e) {
      return res.status(403).json({
        success: false,
        message: 'Failed to authenticate'
      });
    }
  }

  // if there is no token
  // return an error
  return res.status(403).json({
      success: false,
      message: 'Access denied'
  });
}
