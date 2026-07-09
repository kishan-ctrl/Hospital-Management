import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { verifyToken } from '../utils/tokenUtils.js';

/**
 * Middleware to protect routes: verifies access tokens and injects the User document into req.user
 */
export const protect = async (req, res, next) => {
  try {
    let token;
    
    // 1. Get token from authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to gain access.', 401));
    }

    // 2. Verify token signature and integrity
    let decoded;
    try {
      decoded = verifyToken(token, process.env.JWT_ACCESS_SECRET || 'fallback_access_secret_8877665544');
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Your login token has expired. Please log in again or refresh your session.', 401));
      }
      return next(new AppError('Invalid security token. Access denied.', 401));
    }

    // 3. Check if user still exists in the database
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // 4. Check if user is active
    if (!currentUser.isActive) {
      return next(new AppError('This user account has been deactivated.', 403));
    }

    // 5. Grant access: store user reference in request context
    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to restrict route access to specific roles
 * @param {...string} roles - Authorized roles (e.g. 'admin', 'doctor')
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user is injected by the protect middleware
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Access denied. You do not have the required permissions to perform this action.', 403));
    }
    next();
  };
};
