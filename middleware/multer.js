const multer = require("multer");

// Use memory storage instead of disk storage since files are immediately uploaded to GCS
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

module.exports = upload;