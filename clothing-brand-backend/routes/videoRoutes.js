import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import Video from '../models/Video.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'rangandcraft-videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'webm', 'mov', 'avi', 'mkv'],
  },
});

const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024, files: 1 } });

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const items = await Video.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error('GET /api/videos error:', err);
    res.status(err.name === 'ValidationError' || err.name === 'CastError' ? 400 : 500).json({ error: 'Request failed', message: err.message });
  }
});

// Accept multipart form with optional file field 'file' or JSON body { title, url }
router.post('/', protect, admin, upload.single('file'), async (req, res) => {
  try {
    const body = { title: req.body?.title, url: req.body?.url };
    if (req.file) {
      body.url = req.file.secure_url || req.file.url || req.file.path;
      body.title = body.title || req.file.originalname;
    }
    const v = new Video(body);
    await v.save();
    res.status(201).json(v);
  } catch (err) {
    console.error('POST /api/videos error:', err);
    res.status(err.name === 'ValidationError' || err.name === 'CastError' ? 400 : 500).json({ error: 'Request failed', message: err.message });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Video.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/videos/:id error:', err);
    res.status(err.name === 'ValidationError' || err.name === 'CastError' ? 400 : 500).json({ error: 'Request failed', message: err.message });
  }
});

export default router;
