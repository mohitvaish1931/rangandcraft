import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import Banner from '../models/Banner.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const items = await Banner.find().sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error('GET /api/banners error:', err);
    res.status(err.name === 'ValidationError' || err.name === 'CastError' ? 400 : 500).json({ error: 'Request failed', message: err.message });
  }
});

router.post('/', protect, admin, async (req, res) => {
  try {
    const b = new Banner({ text: req.body.text, type: req.body.type, order: req.body.order });
    await b.save();
    res.status(201).json(b);
  } catch (err) {
    console.error('POST /api/banners error:', err);
    res.status(err.name === 'ValidationError' || err.name === 'CastError' ? 400 : 500).json({ error: 'Request failed', message: err.message });
  }
});

router.put('/:id', protect, admin, async (req, res) => {
  try {
    const updated = await Banner.findByIdAndUpdate(req.params.id, { text: req.body.text, type: req.body.type, order: req.body.order }, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    console.error('PUT /api/banners/:id error:', err);
    res.status(err.name === 'ValidationError' || err.name === 'CastError' ? 400 : 500).json({ error: 'Request failed', message: err.message });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/banners/:id error:', err);
    res.status(err.name === 'ValidationError' || err.name === 'CastError' ? 400 : 500).json({ error: 'Request failed', message: err.message });
  }
});

export default router;
