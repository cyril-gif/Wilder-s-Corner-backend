/**
 * Global error handler for Express
 * Formats all errors to consistent { success, message, stack (dev only) }
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';
  
  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists. Please use another value.`;
  }
  
  // Handle Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please login again.';
  }
  
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please login again.';
  }
  
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

export default errorHandler;

