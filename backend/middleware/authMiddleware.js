const jwt = require('jsonwebtoken');
const User = require('../models/User');
const cacheService = require('../services/cacheService');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.auth_token) {
    token = req.cookies.auth_token;
  } else if (req.headers.cookie) {
    const match = req.headers.cookie.match(/(?:^|;\s*)auth_token=([^;]+)/);
    if (match) token = match[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (token) {
    try {
      if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const cacheKey = `sakthi:auth:user:${decoded.id}`;
      let user = cacheService._memGet(cacheKey);
      if (!user) {
        user = await User.findById(decoded.id).select('-password').lean();
        if (user) {
          cacheService._memSet(cacheKey, user, 60); // 60-second micro-cache
        }
      }

      if (!user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
      }
      if (Number(decoded.sessionVersion || 0) !== Number(user.sessionVersion || 0)) {
        cacheService.del(cacheKey);
        return res.status(401).json({ success: false, message: 'Session expired, please sign in again' });
      }
      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  return res.status(401).json({ success: false, message: 'Not authorized, no token' });
};

const optionalProtect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (process.env.JWT_SECRET && token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const cacheKey = `sakthi:auth:user:${decoded.id}`;
        let user = cacheService._memGet(cacheKey);
        if (!user) {
          user = await User.findById(decoded.id).select('-password').lean();
          if (user) cacheService._memSet(cacheKey, user, 60);
        }
        if (user && Number(decoded.sessionVersion || 0) === Number(user.sessionVersion || 0)) {
          req.user = user;
        }
      }
    } catch (error) {
      // Token expired or invalid - proceed as unauthenticated without erroring
    }
  }
  next();
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, optionalProtect, admin };
