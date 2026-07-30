import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      console.log('🔴 [Auth] No token found in authorization headers');
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (jwtErr) {
      console.log('🔴 [Auth] JWT verify failed:', jwtErr.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }

    if (!req.user) {
      console.log('🔴 [Auth] User in token payload not found in DB');
      return res.status(401).json({ message: 'User not found' });
    }

    if (!req.user.isActive) {
      console.log('🔴 [Auth] User account is deactivated');
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    next();
  } catch (error) {
    console.log('🔴 [Auth] General authentication error:', error.message);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export default protect;

