import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { createShipmozoOrder } from '../utils/shipmozo.js';
import { notifyOrderPaid } from '../utils/mailer.js';
import { writeLimiter } from '../middleware/rateLimit.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

const razorpayConfigured = () => Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

// Mock payments mark orders as paid without charging anyone, so they are
// only allowed outside production (or when explicitly enabled for staging).
const mockPaymentsAllowed = () =>
  !razorpayConfigured() &&
  (process.env.NODE_ENV !== 'production' || process.env.ALLOW_MOCK_PAYMENTS === 'true');

const safeEqual = (a, b) => {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

const loadOrder = async (id) => {
  if (!mongoose.isValidObjectId(id)) return null;
  return Order.findById(id).populate('user', 'name email');
};

// Marks an order as paid exactly once: adjusts stock, counts the coupon use
// and books the shipment.
const finalizePaidOrder = async (order, payment = {}) => {
  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentStatus = 'Paid';
  if (order.status === 'Pending') order.status = 'Processing';
  Object.assign(order, payment);

  if (!order.stockAdjusted) {
    await Product.bulkWrite(
      order.orderItems.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { countInStock: -item.qty, stock: -item.qty } },
        },
      }))
    );
    // Never leave negative stock behind after a race between two buyers.
    await Product.updateMany(
      { _id: { $in: order.orderItems.map((i) => i.product) }, countInStock: { $lt: 0 } },
      { $set: { countInStock: 0, stock: 0 } }
    );
    order.stockAdjusted = true;

    if (order.couponCode) {
      await Coupon.updateOne({ code: order.couponCode }, { $inc: { used: 1 } });
    }
  }

  const recipient = order.user || { name: order.shippingAddress?.name, email: order.shippingAddress?.email };
  const shipment = await createShipmozoOrder(order, recipient);
  if (shipment) {
    order.awbNumber = shipment.awbNumber;
    order.courierName = shipment.courierName;
    order.trackingUrl = shipment.trackingUrl;
    order.labelPdf = shipment.labelPdf;
    order.orderStatus = 'packed';
  }

  const saved = await order.save();
  notifyOrderPaid(saved);
  return saved;
};

// @desc    Get Razorpay Key ID
// @route   GET /api/payment/razorpay/config
router.get('/razorpay/config', (req, res) => {
  res.json({
    keyId: process.env.RAZORPAY_KEY_ID || null,
    mock: mockPaymentsAllowed(),
    enabled: razorpayConfigured() || mockPaymentsAllowed(),
  });
});

// @desc    Create a Razorpay order for an existing (unpaid) order.
//          The amount always comes from the stored order, never the client.
// @route   POST /api/payment/razorpay
router.post('/razorpay', writeLimiter, asyncHandler(async (req, res) => {
  const order = await loadOrder(req.body.orderId || req.body.receipt);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.isPaid) return res.status(400).json({ message: 'This order has already been paid.' });
  if (order.totalPrice <= 0) return res.status(400).json({ message: 'Nothing to pay for this order.' });

  const amount = Math.round(order.totalPrice * 100);

  if (!razorpayConfigured()) {
    if (!mockPaymentsAllowed()) {
      return res.status(503).json({ message: 'Online payments are temporarily unavailable. Please contact us on WhatsApp to place your order.' });
    }
    const mockId = `order_mock_${order._id}_${Date.now()}`;
    order.razorpayOrderId = mockId;
    await order.save();
    return res.json({ id: mockId, currency: 'INR', amount, mock: true });
  }

  const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  const rzpOrder = await instance.orders.create({
    amount,
    currency: 'INR',
    receipt: String(order._id),
    notes: { mongo_order_id: String(order._id) },
  });

  order.razorpayOrderId = rzpOrder.id;
  await order.save();
  res.json(rzpOrder);
}));

// @desc    Verify Razorpay Payment
// @route   POST /api/payment/verify
router.post('/verify', writeLimiter, asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, mongo_order_id } = req.body;

  const order = await loadOrder(mongo_order_id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  // The payment must belong to the Razorpay order we created for this order.
  if (!razorpay_order_id || order.razorpayOrderId !== razorpay_order_id) {
    return res.status(400).json({ message: 'Payment does not match this order.' });
  }

  if (order.isPaid) {
    return res.json({ message: 'Payment already verified', order });
  }

  if (razorpayConfigured()) {
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    if (!safeEqual(razorpay_signature, expected)) {
      return res.status(400).json({ message: 'Payment verification failed.' });
    }
  } else if (!mockPaymentsAllowed() || !razorpay_order_id.startsWith('order_mock_')) {
    return res.status(400).json({ message: 'Payment verification failed.' });
  }

  const updatedOrder = await finalizePaidOrder(order, {
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: String(razorpay_payment_id || ''),
    razorpaySignature: String(razorpay_signature || ''),
  });

  res.json({ message: 'Payment verified and order processed successfully', order: updatedOrder });
}));

// @desc    Confirm an order whose server-computed total is zero (100% coupon)
// @route   POST /api/payment/bypass
router.post('/bypass', writeLimiter, asyncHandler(async (req, res) => {
  const order = await loadOrder(req.body.mongo_order_id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.totalPrice > 0) {
    return res.status(400).json({ message: 'Cannot bypass payment for non-zero amount' });
  }
  if (order.isPaid) return res.json({ success: true, order });

  const updatedOrder = await finalizePaidOrder(order);
  res.json({ success: true, order: updatedOrder });
}));

export default router;
