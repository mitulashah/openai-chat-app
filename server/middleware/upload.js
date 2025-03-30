/**
 * upload.js - Middleware for handling file uploads
 */
const multer = require('multer');
const path = require('path');
const { ensureUploadDir } = require('../utils/fileUtils');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = ensureUploadDir('uploads');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Create multer instance with configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept image and audio files
    if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('audio/')) {
      return cb(new Error('Only image and audio files are allowed!'), false);
    }
    cb(null, true);
  }
});

module.exports = upload;