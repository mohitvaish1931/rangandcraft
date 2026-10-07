import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { protect, admin, optionalAuth } from '../middleware/authMiddleware.js';
import { writeLimiter } from '../middleware/rateLimit.js';
import { HttpError } from '../middleware/errorMiddleware.js';
import asyncHandler from '../utils/asyncHandler.js';
import { buildOrderLines, couponUnavailableReason, priceOrder, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '../utils/pricing.js';

const router = express.Router();

const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const PHONE_RE = /^[0-9+\-\s]{10,15}$/;
const PINCODE_RE = /^[1-9][0-9]{5}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const str = (value, max = 200) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

const validateShippingAddress = (raw = {}) => {
  const address = {
    name: str(raw.name, 80),
    email: str(raw.email, 120).toLowerCase(),
    phoneNumber: str(raw.phoneNumber, 20),
    address: str(raw.address, 300),
    city: str(raw.city, 80),
    postalCode: str(raw.postalCode, 10),
    country: str(raw.country, 60) || 'India',
  };
  if (!address.name) throw new HttpError(400, 'Please enter your full name.');
  if (!EMAIL_RE.test(address.email)) throw new HttpError(400, 'Please enter a valid email address.');
  if (!PHONE_RE.test(address.phoneNumber)) throw new HttpError(400, 'Please enter a valid 10-digit phone number.');
  if (!address.address) throw new HttpError(400, 'Please enter your delivery address.');
  if (!address.city) throw new HttpError(400, 'Please enter your city.');
  if (address.country === 'India' && !PINCODE_RE.test(address.postalCode)) {
    throw new HttpError(400, 'Please enter a valid 6-digit pincode.');
  }
  return address;
};

const loadProducts = async (rawItems) => {
  const ids = (Array.isArray(rawItems) ? rawItems : [])
    .map((item) => String(item?.product || item?._id || item?.id || ''))
    .filter((id) => mongoose.isValidObjectId(id));
  const products = await Product.find({ _id: { $in: ids } }).lean();
  return new Map(products.map((p) => [String(p._id), p]));
};

// @desc    Preview server-side pricing for a cart (used by checkout)
// @route   POST /api/orders/quote
router.post('/quote', asyncHandler(async (req, res) => {
  const lines = buildOrderLines(req.body.orderItems, await loadProducts(req.body.orderItems));
  let coupon = null;
  let couponError = null;
  if (req.body.couponCode) {
    coupon = await Coupon.findOne({ code: str(req.body.couponCode, 40).toUpperCase() }).lean();
    couponError = couponUnavailableReason(coupon);
    if (couponError) coupon = null;
  }
  const pricing = priceOrder(lines, coupon);
  if (coupon && pricing.discountAmount === 0) {
    couponError = pricing.offerDiscount > 0
      ? 'Coupons can’t be combined with the bundle offer on these items'
      : 'This coupon does not apply to any item in your cart';
  }
  res.json({
    ...pricing,
    couponCode: coupon && !couponError ? coupon.code : null,
    couponError,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    shippingFee: SHIPPING_FEE,
  });
}));

// @desc    Create new order. Prices are always computed on the server.
// @route   POST /api/orders
router.post('/', writeLimiter, optionalAuth, asyncHandler(async (req, res) => {
  const shippingAddress = validateShippingAddress(req.body.shippingAddress);
  const lines = buildOrderLines(req.body.orderItems, await loadProducts(req.body.orderItems));

  let coupon = null;
  if (req.body.couponCode) {
    coupon = await Coupon.findOne({ code: str(req.body.couponCode, 40).toUpperCase() }).lean();
    const reason = couponUnavailableReason(coupon);
    if (reason) throw new HttpError(400, reason);
  }

  const pricing = priceOrder(lines, coupon);
  if (coupon && pricing.discountAmount === 0) {
    throw new HttpError(400, pricing.offerDiscount > 0
      ? 'Coupons can’t be combined with the bundle offer on these items'
      : 'This coupon does not apply to any item in your cart');
  }

  const order = await Order.create({
    user: req.user?._id,
    orderItems: lines,
    shippingAddress,
    paymentMethod: 'Razorpay',
    couponCode: coupon ? coupon.code : undefined,
    status: 'Pending',
    ...pricing,
  });

  res.status(201).json(order);
}));

// @desc    Get all orders (Admin)
// @route   GET /api/orders
router.get('/', protect, admin, asyncHandler(async (req, res) => {
  const orders = await Order.find({}).sort({ createdAt: -1 });
  res.json(orders);
}));

// @desc    Get the signed-in user's orders
// @route   GET /api/orders/my
router.get('/my', protect, asyncHandler(async (req, res) => {
  const orders = await Order.find({
    $or: [{ user: req.user._id }, { user: null, 'shippingAddress.email': req.user.email }],
  }).sort({ createdAt: -1 });
  res.json(orders);
}));

// @desc    Public order tracking by order number + email
// @route   POST /api/orders/track
router.post('/track', writeLimiter, asyncHandler(async (req, res) => {
  const orderNumber = str(req.body.orderNumber, 40).replace(/^#/, '').toLowerCase();
  const email = str(req.body.email, 120).toLowerCase();
  if (orderNumber.length < 6 || !email) {
    return res.status(400).json({ success: false, message: 'Please enter your order number and email.' });
  }

  const candidates = await Order.find({ 'shippingAddress.email': email }).sort({ createdAt: -1 }).limit(100);
  const order = candidates.find((o) => {
    const id = String(o._id).toLowerCase();
    return id === orderNumber || id.endsWith(orderNumber) || id.startsWith(orderNumber);
  });

  if (!order) {
    return res.status(404).json({ success: false, message: 'We could not find an order with those details.' });
  }

  res.json({
    success: true,
    order: {
      _id: order._id,
      orderNumber: String(order._id).slice(-8).toUpperCase(),
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      totalAmount: order.totalPrice,
      shippingAddress: {
        name: order.shippingAddress.name,
        address: order.shippingAddress.address,
        city: order.shippingAddress.city,
        state: '',
        pincode: order.shippingAddress.postalCode,
      },
      items: order.orderItems.map((i) => ({ name: i.name, quantity: i.qty, price: i.price, image: i.image })),
      courierName: order.courierName,
      awbNumber: order.awbNumber,
      trackingUrl: order.trackingUrl,
    },
  });
}));

// @desc    Get order by ID (owner or admin)
// @route   GET /api/orders/:id
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  const isOwner = order && (
    (order.user && String(order.user) === String(req.user._id)) ||
    (!order.user && order.shippingAddress?.email === req.user.email)
  );
  if (!order || (!isOwner && !req.user.isAdmin)) {
    return res.status(404).json({ message: 'Order not found' });
  }
  res.json(order);
}));

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
router.put('/:id/status', protect, admin, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  if (req.body.status !== undefined) {
    if (!ORDER_STATUSES.includes(req.body.status)) {
      return res.status(400).json({ message: `Status must be one of: ${ORDER_STATUSES.join(', ')}` });
    }
    order.status = req.body.status;
    if (order.status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
  }
  if (req.body.paymentStatus) {
    order.paymentStatus = String(req.body.paymentStatus);
    if (order.paymentStatus === 'Paid' && !order.isPaid) {
      order.isPaid = true;
      order.paidAt = Date.now();
    }
  }

  res.json(await order.save());
}));

// @desc    Delete an order (Admin)
// @route   DELETE /api/orders/:id
router.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json({ message: 'Order removed' });
}));

export default router;
