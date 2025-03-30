/**
 * logging.js - Middleware for request logging
 */

/**
 * Enhanced logging middleware for HTTP requests
 */
function loggingMiddleware(req, res, next) {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Request received`);
  
  // Log response after it's sent
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Response: ${res.statusCode} ${res.statusMessage} (${duration}ms)`);
  });
  
  next();
}

module.exports = loggingMiddleware;