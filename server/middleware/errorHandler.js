/**
 * errorHandler — Global error handling middleware.
 * Catches unhandled errors and returns a consistent JSON response.
 */
const errorHandler = (err, req, res, next) => {
  console.error('💥 Error:', err.stack);

  const statusCode = err.code === 'LIMIT_FILE_SIZE'
    ? 413
    : err.status || err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
