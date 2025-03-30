/**
 * errorHandler.js - Centralized error handling middleware
 */

/**
 * Global error handler middleware
 */
function errorHandler(err, req, res, next) {
  // Log the error
  console.error('=== Error Handler ===');
  console.error('Error message:', err.message);
  console.error('Error stack:', err.stack);
  
  // Handle OpenAI API specific errors
  if (err.response) {
    console.error('API Error Status:', err.response.status);
    console.error('API Error Data:', err.response.data);
    console.error('API Error Headers:', err.response.headers);
    
    // Send proper status code from the API response
    const statusCode = err.response.status || 500;
    return res.status(statusCode).json({ 
      error: 'API Error',
      message: err.message,
      details: err.response.data || 'Error communicating with external API'
    });
  }
  
  // Handle multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'File Too Large',
      message: 'The uploaded file exceeds the size limit (10MB)',
      details: err.message
    });
  }
  
  // Handle other errors
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    details: process.env.NODE_ENV === 'development' ? err.stack : 'An unexpected error occurred'
  });
}

/**
 * 404 Not Found middleware
 */
function notFoundHandler(req, res) {
  console.error(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Not Found',
    message: `The requested endpoint ${req.originalUrl} does not exist`,
    availableEndpoints: ['/api/health', '/api/config', '/api/chat', '/api-docs']
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};