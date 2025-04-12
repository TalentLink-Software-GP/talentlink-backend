const { Storage } = require('@google-cloud/storage');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Initialize GCS
const storage = new Storage({
  keyFilename: path.join(__dirname, '../talentlink-456012-085abb34dcc0.json'), // Your JSON key file here
});
const bucket = storage.bucket('talent_link');

const uploadToGCS = (file, folder = "avatars") => {
  return new Promise((resolve, reject) => {
    const ext = path.extname(file.originalname);
    const gcsFileName = `${folder}/${crypto.randomUUID()}${ext}`;
    const blob = bucket.file(gcsFileName);
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
      public: true, // Public access
    });

    blobStream.on('error', (err) => reject(err));

    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      fs.unlinkSync(file.path); // Clean up local file
      resolve(publicUrl);
    });

    fs.createReadStream(file.path).pipe(blobStream);
  });
};


module.exports = {uploadToGCS, bucket};
