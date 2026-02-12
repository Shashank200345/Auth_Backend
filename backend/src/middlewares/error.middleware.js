const { NODE_ENV } = require('../config/env');

const errorHandler = (err, req, res, next) => {
  if (NODE_ENV === 'development') {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Prisma: unique constraint violation (e.g. duplicate email)
  if (err.code === 'P2002') {
    statusCode = 409;
    const field = err.meta?.target?.[0] || 'field';
    message = `A record with this ${field} already exists.`;
  }

  // Prisma: record not found
  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'The requested record was not found.';
  }

  if (NODE_ENV === 'production' && !err.isOperational) {
    message = 'Internal Server Error';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
