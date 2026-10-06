import express from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { writeLimiter } from '../middleware/rateLimit.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

const str = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

// Recomputes the cached rating fields on the product from approved reviews.
const refreshProductRating = async (productId) => {
  const [stats] = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(String(productId)), status: 'approved' } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const rating = stats ? Math.round(stats.avg * 10) / 10 : 0;
  const count = stats ? stats.count : 0;
  await Product.findByIdAndUpdate(productId, {
    rating,
    averageRating: rating,
    numReviews: count,
    reviewCount: count,
  });
};

const SORTS = {
  helpful: { helpful: -1, createdAt: -1 },
  highest: { rating: -1, createdAt: -1 },
  lowest: { rating: 1, createdAt: -1 },
  newest: { createdAt: -1 },
};

// Get approved reviews for a product
router.get('/product/:productId', asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.productId)) {
    return res.json({ reviews: [], totalReviews: 0, averageRating: 0, ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  }
  const productId = new mongoose.Types.ObjectId(req.params.productId);
  const query = { productId, status: 'approved' };
  const rating = parseInt(req.query.rating, 10);
  if (rating >= 1 && rating <= 5) query.rating = rating;

  const reviews = await Review.find(query)
    .select('-updatedAt -userEmail')
    .sort(SORTS[req.query.sort] || SORTS.newest)
    .limit(200);

  const counts = await Review.aggregate([
    { $match: { productId, status: 'approved' } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
  ]);
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  counts.forEach((c) => { ratingDistribution[c._id] = c.count; });
  const totalReviews = counts.reduce((sum, c) => sum + c.count, 0);
  const averageRating = totalReviews
    ? Math.round((counts.reduce((sum, c) => sum + c._id * c.count, 0) / totalReviews) * 10) / 10
    : 0;

  res.json({ reviews, totalReviews, averageRating, ratingDistribution });
}));

// Get all reviews for moderation (admin only)
router.get('/admin/all', protect, admin, asyncHandler(async (req, res) => {
  const filter = ['pending', 'approved', 'rejected'].includes(req.query.status) ? { status: req.query.status } : {};
  const reviews = await Review.find(filter).populate('productId', 'name image').sort({ createdAt: -1 }).limit(500);
  res.json({ count: reviews.length, reviews });
}));

// Get pending reviews (admin only)
router.get('/admin/pending', protect, admin, asyncHandler(async (req, res) => {
  const reviews = await Review.find({ status: 'pending' }).populate('productId', 'name image').sort({ createdAt: -1 });
  res.json({ count: reviews.length, reviews });
}));

const setStatus = (status) => asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!review) return res.status(404).json({ error: 'Review not found', message: 'Review not found' });
  await refreshProductRating(review.productId);
  res.json({ message: `Review ${status}`, review });
});

router.put('/admin/:id/approve', protect, admin, setStatus('approved'));
router.put('/admin/:id/reject', protect, admin, setStatus('rejected'));

// Get single review
router.get('/:id', asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id).select('-userEmail');
  if (!review || review.status !== 'approved') {
    return res.status(404).json({ error: 'Review not found', message: 'Review not found' });
  }
  res.json(review);
}));

// Create a review (signed-in users)
router.post('/', protect, writeLimiter, asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const rating = Number(req.body.rating);
  const title = str(req.body.title, 120);
  const comment = str(req.body.comment, 2000);

  if (!mongoose.isValidObjectId(productId) || !title || !comment) {
    return res.status(400).json({ error: 'All fields are required', message: 'Please add a title and your review.' });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5', message: 'Rating must be between 1 and 5' });
  }

  const product = await Product.findById(productId).select('_id');
  if (!product) return res.status(404).json({ error: 'Product not found', message: 'Product not found' });

  const existingReview = await Review.findOne({ productId, userId: req.user._id });
  if (existingReview) {
    return res.status(400).json({ error: 'You have already reviewed this product', message: 'You have already reviewed this product' });
  }

  const verified = Boolean(await Order.exists({
    isPaid: true,
    'orderItems.product': product._id,
    $or: [{ user: req.user._id }, { 'shippingAddress.email': req.user.email }],
  }));

  const review = await Review.create({
    productId,
    userId: req.user._id,
    userName: req.user.name,
    userEmail: req.user.email,
    rating,
    title,
    comment,
    verified,
    status: 'pending',
  });

  res.status(201).json({ message: 'Review submitted successfully. Awaiting approval.', review });
}));

const loadOwnedReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404).json({ error: 'Review not found', message: 'Review not found' });
    return null;
  }
  if (String(review.userId) !== String(req.user._id) && !req.user.isAdmin) {
    res.status(403).json({ error: 'Forbidden', message: 'You can only change your own review.' });
    return null;
  }
  return review;
};

// Update a review (author only); goes back to moderation
router.put('/:id', protect, asyncHandler(async (req, res) => {
  const review = await loadOwnedReview(req, res);
  if (!review) return;

  const rating = req.body.rating !== undefined ? Number(req.body.rating) : undefined;
  if (rating !== undefined && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5', message: 'Rating must be between 1 and 5' });
  }
  if (rating !== undefined) review.rating = rating;
  if (str(req.body.title, 120)) review.title = str(req.body.title, 120);
  if (str(req.body.comment, 2000)) review.comment = str(req.body.comment, 2000);
  review.status = 'pending';

  await review.save();
  await refreshProductRating(review.productId);
  res.json({ message: 'Review updated successfully', review });
}));

// Delete a review (author or admin)
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const review = await loadOwnedReview(req, res);
  if (!review) return;
  await review.deleteOne();
  await refreshProductRating(review.productId);
  res.json({ message: 'Review deleted successfully' });
}));

// Mark review as helpful
router.put('/:id/helpful', writeLimiter, asyncHandler(async (req, res) => {
  const review = await Review.findOneAndUpdate(
    { _id: req.params.id, status: 'approved' },
    { $inc: { helpful: 1 } },
    { new: true }
  );
  if (!review) return res.status(404).json({ error: 'Review not found', message: 'Review not found' });
  res.json({ message: 'Thank you for your feedback', helpful: review.helpful });
}));

export default router;
