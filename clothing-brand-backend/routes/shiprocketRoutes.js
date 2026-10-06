import express from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import Order from '../models/Order.js';

const router = express.Router();

/**
 * Shiprocket Webhook Handler
 * This endpoint should be configured in the Shiprocket Panel:
 * Settings > API > Webhooks
 */
// Shiprocket sends the token configured in its panel in the x-api-key header.
const isAuthorized = (req) => {
  const expected = process.env.SHIPROCKET_WEBHOOK_TOKEN;
  if (!expected) return process.env.NODE_ENV !== 'production';
  const received = Buffer.from(String(req.headers['x-api-key'] || ''));
  const wanted = Buffer.from(expected);
  return received.length === wanted.length && crypto.timingSafeEqual(received, wanted);
};

router.post('/webhook', async (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    // Log the incoming webhook for debugging
    // console.log('Shiprocket Webhook received:', JSON.stringify(req.body, null, 2));

    const { awb, shipment_id, status, current_status, order_id } = req.body;

    // Find the order by Shiprocket shipment ID or our Mongoose ID (order_id in sr)
    const conditions = [];
    if (shipment_id) conditions.push({ shiprocketShipmentId: String(shipment_id) });
    if (awb) conditions.push({ awbNumber: String(awb) });
    if (mongoose.isValidObjectId(order_id)) conditions.push({ _id: order_id });
    const order = conditions.length ? await Order.findOne({ $or: conditions }) : null;

    if (!order) {
      // console.warn('Order not found for Shiprocket webhook:', shipment_id);
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update tracking info
    if (awb) order.awbNumber = String(awb);
    if (current_status) order.trackingStatus = String(current_status);

    // Map Shiprocket status to our Order status
    const srStatus = (current_status || status || '').toLowerCase();
    
    if (srStatus.includes('delivered')) {
      order.status = 'Delivered';
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    } else if (srStatus.includes('shipped') || srStatus.includes('in transit') || srStatus.includes('out for delivery')) {
      order.status = 'Shipped';
    } else if (srStatus.includes('cancelled')) {
      order.status = 'Cancelled';
    }

    await order.save();

    res.json({ success: true });
  } catch (err) {
    console.error('Shiprocket Webhook Error:', err.message);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
