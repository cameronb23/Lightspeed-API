const promisify = require('promisify-node');
const jwebtoken = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const jwt = promisify(jwebtoken);

const { JWT_SECRET } = process.env;

export async function verifyPassword(password, user) {
  const hash = user.password;

  try {
    const verified = await bcrypt.compare(password, hash);

    if (!verified) {
      return false;
    }

    return true;
  } catch (e) {
    return false
  }
}

export async function getToken(user) {
  return jwt.sign({ userId: user._id, admin: user.admin }, JWT_SECRET, {
    expiresIn: "7d"
  });
}

export async function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    throw e;
  }
}


export async function authenticate(req, res, next) {
  // check header or url parameters or post parameters for token
  const token = req.headers['x-access-token'];

  if (token != null) {
    try {
      const decoded = await verifyToken(token);

      req.decoded = decoded;
      return next();
    } catch (e) {
      return res.status(401).json({
        success: false,
        message: 'Failed to authenticate'
      });
    }
  }

  // if there is no token
  // return an error
  return res.status(401).json({
      success: false,
      message: 'Access denied'
  });
}
