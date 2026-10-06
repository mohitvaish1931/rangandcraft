import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountPercent: { type: Number, required: true, min: 0, max: 100 },
  active: { type: Boolean, default: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  expiresAt: Date,
  usageLimit: Number,
  used: { type: Number, default: 0 },
  applicableCategories: { type: [String], default: [] },
  maxPriceThreshold: { type: Number, default: null }
}, { timestamps: true });

const Coupon = mongoose.model('Coupon', CouponSchema);
export default Coupon;
