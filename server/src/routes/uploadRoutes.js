import express from 'express';
import fs from 'fs';
import path from 'path';
import { uploadSignature } from '../middleware/upload.js';
import { authenticate } from '../middleware/auth.js';
import { config } from '../config/index.js';

const router = express.Router();

router.use(authenticate);

// 1. Multipart file upload
router.post('/signature', uploadSignature.single('signature'), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No signature file was uploaded.'
      });
    }

    const relativeUrl = `/uploads/signatures/${req.file.filename}`;
    res.status(200).json({
      success: true,
      message: 'Signature uploaded successfully.',
      data: {
        url: relativeUrl,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (err) {
    next(err);
  }
});

// 2. Base64 signature upload (for Canvas drawing pad)
router.post('/signature-base64', (req, res, next) => {
  try {
    const { base64Data } = req.body;
    if (!base64Data || !base64Data.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        message: 'Valid base64 image data is required.'
      });
    }

    // Extract mime type and raw data
    const matches = base64Data.match(/^data:image\/([a-zA-Z0-9\+\-\.]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'Malformed base64 image string.'
      });
    }

    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const buffer = Buffer.from(matches[2], 'base64');

    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'Signature image exceeds 5MB size limit.'
      });
    }

    const uniqueFilename = `${req.user.role}-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
    const filePath = path.join(config.uploadDir, uniqueFilename);

    fs.writeFileSync(filePath, buffer);

    const relativeUrl = `/uploads/signatures/${uniqueFilename}`;
    res.status(200).json({
      success: true,
      message: 'Signature drawing saved successfully.',
      data: {
        url: relativeUrl,
        filename: uniqueFilename,
        size: buffer.length
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
