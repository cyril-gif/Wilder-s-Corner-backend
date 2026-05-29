import jwt from 'jsonwebtoken';

/**
 * Generate Access Token (short lived)
 * @param {string} userId - User ID
 * @returns {string} JWT access token
 */
export const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '15m' // 15 minutes
  });
};

/**
 * Generate Refresh Token (long lived)
 * @param {string} userId - User ID
 * @returns {string} JWT refresh token
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d' // 7 days
  });
};

/**
 * Verify refresh token
 * @param {string} token - Refresh token
 * @returns {object|null} Decoded payload or null
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Verify access token
 * @param {string} token - Access token
 * @returns {object|null} Decoded payload or null
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

