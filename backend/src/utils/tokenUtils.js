import jwt from 'jsonwebtoken';

/**
 * Generate a short-lived access JWT token
 * @param {object} user - The mongoose user document
 * @returns {string} Signed access token
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_ACCESS_SECRET || 'fallback_access_secret_8877665544',
    { expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m' }
  );
};

/**
 * Generate a long-lived refresh JWT token
 * @param {object} user - The mongoose user document
 * @returns {string} Signed refresh token
 */
export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_1122334455',
    { expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d' }
  );
};

/**
 * Verify a given JWT token
 * @param {string} token - The signed token string
 * @param {string} secret - Secret signature key
 * @returns {object} Decoded token payload
 */
export const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};
