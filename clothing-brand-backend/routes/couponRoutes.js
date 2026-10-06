import express from 'express';
import Coupon from '../models/Coupon.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { writeLimiter } from '../middleware/rateLimit.js';
import asyncHandler from '../utils/asyncHandler.js';
import { couponUnavailableReason } from '../utils/pricing.js';

const router = express.Router();

const EDITABLE_FIELDS = ['code', 'discountPercent', 'active', 'productId', 'expiresAt', 'usageLimit', 'applicableCategories', 'maxPriceThreshold'];
const pick = (body) => Object.fromEntries(EDITABLE_FIELDS.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));

// @route GET /api/coupons (Admin) — coupon codes must not be publicly listable.
router.get('/', protect, admin, asyncHandler(async (req, res) => {
  const items = await Coupon.find().sort({ createdAt: -1 }).populate('productId');
  res.json(items);
}));

router.post('/', protect, admin, asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(pick(req.body));
  res.status(201).json(coupon);
}));

// @route GET /api/coupons/validate/:code (Public)
router.get('/validate/:code', writeLimiter, asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOne({ code: String(req.params.code).trim().toUpperCase() });
  const reason = couponUnavailableReason(coupon);
  if (reason) {
    return res.status(coupon ? 400 : 404).json({ error: reason, message: reason });
  }

  res.json({
    code: coupon.code,
    discountPercent: coupon.discountPercent,
    applicableCategories: coupon.applicableCategories,
    maxPriceThreshold: coupon.maxPriceThreshold,
    productId: coupon.productId,
  });
}));

router.put('/:code', protect, admin, asyncHandler(async (req, res) => {
  const updated = await Coupon.findOneAndUpdate(
    { code: String(req.params.code).toUpperCase() },
    pick(req.body),
    { new: true, runValidators: true }
  );
  if (!updated) return res.status(404).json({ error: 'Not found', message: 'Coupon not found' });
  res.json(updated);
}));

router.delete('/:code', protect, admin, asyncHandler(async (req, res) => {
  await Coupon.findOneAndDelete({ code: String(req.params.code).toUpperCase() });
  res.json({ ok: true });
}));

export default router;
