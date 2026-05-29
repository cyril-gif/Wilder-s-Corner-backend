import { verifyAccessToken } from '../utils/generateToken.js';
import User from '../models/User.js';

/**
 * Protect routes - verifies JWT from httpOnly cookie
 * Expects cookie named 'accessToken'
 */
export const protect = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.accessToken;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }
    
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token invalid or expired'
      });
    }
    
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }
};

/**
 * Optional auth - doesn't fail if no token, just sets req.user if valid
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        const user = await User.findById(decoded.userId).select('-password');
        if (user) req.user = user;
      }
    }
    next();
  } catch (error) {
    next();
  }
};



