import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|avif|svg/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext || mime) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
}).single('file');

export class UploadsController {
  
  static async uploadFile(req: Request, res: Response) {
    upload(req, res, async (err) => {
      if (err) {
        console.error('Upload error:', err.message);
        return res.status(400).json({ error: err.message || 'File upload error' });
      }
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

      try {
        const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
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
