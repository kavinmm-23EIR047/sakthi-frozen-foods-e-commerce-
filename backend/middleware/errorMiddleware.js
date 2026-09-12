const mongoose = require('mongoose');

function notFound(req, res) {
  res.status(404).json({ success: false, error: 'Route not found' });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ success: false, error: 'Invalid request data' });
  }

  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ success: false, error: 'Invalid resource identifier' });
  }

  if (error.code === 11000) {
    return res.status(409).json({ success: false, error: 'A record with these details already exists' });
  }

  console.error('Unhandled request error:', error.message);
  return res.status(error.statusCode || 500).json({
    success: false,
    error: error.statusCode ? error.message : 'An unexpected server error occurred',
  });
}

module.exports = { notFound, errorHandler };