/**
 * index.js - Route registry
 * Exports all routes for the application
 */

const healthRoutes = require('./healthRoutes');
const configRoutes = require('./configRoutes');
const chatRoutes = require('./chatRoutes');

module.exports = {
  healthRoutes,
  configRoutes,
  chatRoutes
};