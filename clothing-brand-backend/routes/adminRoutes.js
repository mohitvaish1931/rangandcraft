import express from 'express';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Inquiry from '../models/Inquiry.js';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import asyncHandler from '../utils/asyncHandler.js';
import { checkUploads } from '../config/cloudinary.js';

const router = express.Router();

// @desc    Counts for the admin sidebar badges
// @route   GET /api/admin/summary
router.get('/summary', protect, admin, asyncHandler(async (req, res) => {
  const [toShip, pendingReviews, newMessages, lowStock] = await Promise.all([
    Order.countDocuments({ isPaid: true, status: { $in: ['Pending', 'Processing'] } }),
    Review.countDocuments({ status: 'pending' }),
    Inquiry.countDocuments({ status: 'new' }),
    Product.countDocuments({ countInStock: { $lte: 3 } }),
  ]);
  res.json({ toShip, pendingReviews, newMessages, lowStock });
}));

// @desc    Test that product photo uploads work, with Cloudinary's own reason if not
// @route   GET /api/admin/uploads-check
router.get('/uploads-check', protect, admin, asyncHandler(async (req, res) => {
  res.json(await checkUploads());
}));

export default router;
