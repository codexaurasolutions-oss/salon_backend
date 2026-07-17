import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

const cloudinaryEnabled =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET);

if (cloudinaryEnabled) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`);
  }
});

const upload = multer({
  storage: cloudinaryEnabled ? multer.memoryStorage() : localStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|avif|svg/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext || mime) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
}).single('file');

function getBackendPublicUrl() {
  if (process.env.BACKEND_PUBLIC_URL) return process.env.BACKEND_PUBLIC_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT || 5000}`;
}

function uploadToCloudinary(file: Express.Multer.File) {
  return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_UPLOAD_FOLDER || 'salon-uploads',
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Cloudinary upload failed'));
          return;
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    stream.end(file.buffer);
  });
}

export class UploadsController {
  static async uploadFile(req: Request, res: Response) {
    upload(req, res, async (err) => {
      if (err) {
        console.error('Upload error:', err.message);
        return res.status(400).json({ error: err.message || 'File upload error' });
      }
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

      try {
        if (cloudinaryEnabled) {
          const result = await uploadToCloudinary(req.file);
          return res.json({
            message: 'Upload successful',
            url: result.secure_url,
            public_id: result.public_id
          });
        }

        const fileUrl = `${getBackendPublicUrl()}/uploads/${req.file.filename}`;
        res.json({
          message: 'Upload successful',
          url: fileUrl,
          public_id: req.file.filename
        });
      } catch (error: any) {
        console.error('Upload processing error:', error);
        res.status(500).json({ error: 'Failed to process upload' });
      }
    });
  }
}
