/**
 * fileUtils.js - Utility functions for file handling
 */
const fs = require('fs');
const path = require('path');

/**
 * Convert a file to base64 encoding
 * @param {string} filePath - Path to the file
 * @returns {string} Base64 encoded file content
 */
function fileToBase64(filePath) {
  return fs.readFileSync(filePath, { encoding: 'base64' });
}

/**
 * Get the MIME type based on file extension
 * @param {string} filePath - Path to the file
 * @returns {string} MIME type
 */
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Clean up old files
 * @param {string} directory - Directory to clean
 * @param {number} maxAgeHours - Maximum age in hours
 */
function cleanupOldFiles(directory = 'uploads', maxAgeHours = 24) {
  if (fs.existsSync(directory)) {
    fs.readdir(directory, (err, files) => {
      if (err) return console.error(err);

      const now = Date.now();
      files.forEach(file => {
        const filePath = path.join(directory, file);
        fs.stat(filePath, (err, stats) => {
          if (err) return console.error(err);

          // Delete files older than maxAgeHours
          if (now - stats.mtime.getTime() > maxAgeHours * 60 * 60 * 1000) {
            fs.unlink(filePath, err => {
              if (err) console.error(err);
              else console.log(`Cleaned up old file: ${file}`);
            });
          }
        });
      });
    });
  }
}

/**
 * Ensure upload directory exists
 * @param {string} directory - Directory to check/create
 * @returns {string} The directory path
 */
function ensureUploadDir(directory = 'uploads') {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }
  return directory;
}

module.exports = {
  fileToBase64,
  getMimeType,
  cleanupOldFiles,
  ensureUploadDir
};