/**
 * This file is a legacy entry point that now forwards to the main server implementation
 * located at server/index.js to maintain backward compatibility.
 * 
 * For new development, please use server/index.js directly.
 */

// Simply require and execute the actual server file
console.log('Forwarding to server/index.js - please update any references to use that file directly.');
require('./server/index');