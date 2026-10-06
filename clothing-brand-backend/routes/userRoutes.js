import express from 'express';
import User from '../models/User.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimit.js';
import asyncHandler from '../utils/asyncHandler.js';
import generateToken from '../utils/generateToken.js';

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const authResponse = (user) => ({ ...user.toPublicJSON(), token: generateToken(user._id) });

// Older accounts may have been stored with mixed-case emails.
const findByEmail = async (email) =>
  (await User.findOne({ email })) ||
  User.findOne({ email: { $regex: `^${escapeRegex(email)}$`, $options: 'i' } });

// @desc    Auth user & get token
// @route   POST /api/users/login
router.post('/login', authLimiter, asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await findByEmail(email);
  if (user && (await user.matchPassword(password))) {
    return res.json(authResponse(user));
  }
  res.status(401).json({ message: 'Invalid email or password' });
}));

// @desc    Register a new user
// @route   POST /api/users
router.post('/', authLimiter, asyncHandler(async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!name) return res.status(400).json({ message: 'Please enter your name.' });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'Please enter a valid email address.' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });

  if (await findByEmail(email)) {
    return res.status(400).json({ message: 'An account with this email already exists.' });
  }

  // isAdmin is never accepted from the request body.
  const user = await User.create({ name, email, password });
  res.status(201).json(authResponse(user));
}));

// @desc    Logout user (tokens are stateless; the client discards its copy)
// @route   POST /api/users/logout
router.post('/logout', (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
});

// @desc    Get the signed-in user's profile
// @route   GET /api/users/profile
router.get('/profile', protect, (req, res) => {
  res.json(req.user.toPublicJSON());
});

// @desc    Update the signed-in user's profile
// @route   PUT /api/users/profile
router.put('/profile', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (req.body.name !== undefined) {
    const name = String(req.body.name).trim();
    if (!name) return res.status(400).json({ message: 'Name cannot be empty.' });
    user.name = name;
  }
  if (req.body.phone !== undefined) user.phone = String(req.body.phone).trim().slice(0, 20);
  if (req.body.password) {
    const password = String(req.body.password);
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    user.password = password;
  }

  await user.save();
  res.json(authResponse(user));
}));

// @desc    Get all users
// @route   GET /api/users
router.get('/', protect, admin, asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  res.json(users);
}));

export default router;
