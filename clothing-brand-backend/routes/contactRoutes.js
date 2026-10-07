import express from 'express';
import Inquiry from '../models/Inquiry.js';
import Subscriber from '../models/Subscriber.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { writeLimiter } from '../middleware/rateLimit.js';
import asyncHandler from '../utils/asyncHandler.js';
import { notifyInquiry } from '../utils/mailer.js';

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

// @desc    Submit a contact / wholesale inquiry
// @route   POST /api/contact
router.post('/', writeLimiter, asyncHandler(async (req, res) => {
  const inquiry = {
    name: str(req.body.name, 80),
    email: str(req.body.email, 120).toLowerCase(),
    phone: str(req.body.phone, 20),
    subject: str(req.body.subject, 60) || 'general',
    message: str(req.body.message, 3000),
  };
  if (!inquiry.name) return res.status(400).json({ message: 'Please enter your name.' });
  if (!EMAIL_RE.test(inquiry.email)) return res.status(400).json({ message: 'Please enter a valid email address.' });
  if (inquiry.message.length < 5) return res.status(400).json({ message: 'Please tell us a little more in your message.' });

  await Inquiry.create(inquiry);
  notifyInquiry(inquiry);
  res.status(201).json({ message: 'Thank you — we usually reply within 24 hours.' });
}));

// @desc    Subscribe to the newsletter (idempotent)
// @route   POST /api/contact/newsletter
router.post('/newsletter', writeLimiter, asyncHandler(async (req, res) => {
  const email = str(req.body.email, 120).toLowerCase();
  if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'Please enter a valid email address.' });
  await Subscriber.updateOne({ email }, { $setOnInsert: { email, source: str(req.body.source, 40) || 'website' } }, { upsert: true });
  res.status(201).json({ message: 'Subscribed' });
}));

// @desc    Admin inbox
router.get('/', protect, admin, asyncHandler(async (req, res) => {
  const [inquiries, subscribers] = await Promise.all([
    Inquiry.find().sort({ createdAt: -1 }).limit(500),
    Subscriber.find().sort({ createdAt: -1 }).limit(2000),
  ]);
  res.json({ inquiries, subscribers });
}));

router.put('/:id', protect, admin, asyncHandler(async (req, res) => {
  const status = ['new', 'replied', 'closed'].includes(req.body.status) ? req.body.status : null;
  if (!status) return res.status(400).json({ message: 'Invalid status' });
  const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
  res.json(inquiry);
}));

router.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
  await Inquiry.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}));

export default router;
