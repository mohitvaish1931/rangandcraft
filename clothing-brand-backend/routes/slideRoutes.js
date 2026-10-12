import express from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary, { withUploadErrors } from '../config/cloudinary.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import asyncHandler from '../utils/asyncHandler.js';
import Slide from '../models/Slide.js';

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'rangandcraft-slides',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});
const upload = withUploadErrors(multer({ storage, limits: { fileSize: 10 * 1024 * 1024, files: 1 } }).single('image'));

const TEXT_FIELDS = ['eyebrow', 'title', 'text', 'ctaLabel', 'ctaLink'];

// Picks the editable fields from a (multipart) body; booleans and numbers arrive as strings.
const fieldsFrom = (body) => {
  const out = {};
  for (const key of TEXT_FIELDS) if (typeof body[key] === 'string') out[key] = body[key];
  if (body.active !== undefined) out.active = body.active === true || body.active === 'true';
  if (body.order !== undefined && Number.isFinite(Number(body.order))) out.order = Number(body.order);
  return out;
};

// Best effort: a stale image left in Cloudinary is harmless, so never fail the request over it.
const removeImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn('Could not delete slide image:', err.message);
  }
};

const badRequest = (err) => err.name === 'ValidationError' || err.name === 'CastError';

// @desc    Active slides for the storefront hero
// @route   GET /api/slides
router.get('/', asyncHandler(async (req, res) => {
  const slides = await Slide.find({ active: true }).sort({ order: 1, createdAt: -1 }).select('-publicId').lean();
  res.json(slides);
}));

// @desc    Every slide, including hidden ones
// @route   GET /api/slides/all
router.get('/all', protect, admin, asyncHandler(async (req, res) => {
  res.json(await Slide.find().sort({ order: 1, createdAt: -1 }).lean());
}));

// @route   POST /api/slides
router.post('/', protect, admin, upload, async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Choose a photo for the slide.' });
  try {
    const order = await Slide.countDocuments();
    const slide = await Slide.create({
      order,
      ...fieldsFrom(req.body),
      image: req.file.secure_url || req.file.path,
      publicId: req.file.filename || '',
    });
    res.status(201).json(slide);
  } catch (err) {
    await removeImage(req.file.filename);
    res.status(badRequest(err) ? 400 : 500).json({ message: `Unable to save the slide: ${err.message}` });
  }
});

// @route   PUT /api/slides/:id   (a new image is optional)
router.put('/:id', protect, admin, upload, async (req, res) => {
  try {
    const slide = await Slide.findById(req.params.id);
    if (!slide) {
      await removeImage(req.file?.filename);
      return res.status(404).json({ message: 'Slide not found' });
    }
    const previousImage = req.file ? slide.publicId : '';
    slide.set(fieldsFrom(req.body));
    if (req.file) {
      slide.image = req.file.secure_url || req.file.path;
      slide.publicId = req.file.filename || '';
    }
    await slide.save();
    await removeImage(previousImage);
    res.json(slide);
  } catch (err) {
    await removeImage(req.file?.filename);
    res.status(badRequest(err) ? 400 : 500).json({ message: `Unable to update the slide: ${err.message}` });
  }
});

// @route   DELETE /api/slides/:id
router.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
  const slide = await Slide.findByIdAndDelete(req.params.id);
  if (!slide) return res.status(404).json({ message: 'Slide not found' });
  await removeImage(slide.publicId);
  res.json({ ok: true });
}));

export default router;
