const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const acceptedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

// The file exists in memory only until it is transferred to Cloudinary.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (acceptedTypes.has(file.mimetype)) return cb(null, true);
    cb(new Error('Only JPG, PNG, WebP, and AVIF images are allowed.'));
  },
});

function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'sakthi-frozen-foods/products',
        resource_type: 'image',
        // Caps very large originals without cropping or changing the aspect ratio.
        transformation: [{ width: 2000, height: 2000, crop: 'limit' }],
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });
}

// POST /api/upload
router.post('/', (req, res) => {
  upload.single('image')(req, res, async (uploadError) => {
    if (uploadError) {
      const error = uploadError.code === 'LIMIT_FILE_SIZE'
        ? 'Image must be 10 MB or smaller.'
        : uploadError.message || 'Unable to process image upload.';
      return res.status(400).json({ success: false, error });
    }

    if (!req.file) return res.status(400).json({ success: false, error: 'No image was uploaded.' });

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ success: false, error: 'Cloudinary credentials are not configured on the server.' });
    }

    try {
      const result = await uploadToCloudinary(req.file.buffer);
      // Cloudinary delivers the smallest supported format (AVIF/WebP/JPEG) at a
      // visually high-quality automatic setting, reducing bandwidth safely.
      const imageUrl = cloudinary.url(result.public_id, {
        secure: true,
        transformation: [{ fetch_format: 'auto', quality: 'auto:good' }],
      });
      return res.status(201).json({ success: true, data: imageUrl });
    } catch (error) {
      console.error('Cloudinary upload failed:', error.message);
      return res.status(502).json({ success: false, error: 'The image could not be stored. Please try again.' });
    }
  });
});

module.exports = router;
