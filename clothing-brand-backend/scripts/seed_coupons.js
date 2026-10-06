import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Coupon from '../models/Coupon.js';

dotenv.config();

const coupons = [
  { code: 'GUL100PC', discountPercent: 100, active: true },
  { code: 'FREELOOT', discountPercent: 100, active: true },
  { code: 'FESTIV20', discountPercent: 20, active: true },
  { code: 'SUMMER15', discountPercent: 15, active: true },
  { code: 'WINTER25', discountPercent: 25, active: true },
  { code: 'NEWGUL10', discountPercent: 10, active: true },
  { code: 'STYLE30X', discountPercent: 30, active: true },
  { code: 'TRENDZ50', discountPercent: 50, active: true },
  { code: 'EPICOFF5', discountPercent: 5, active: true },
  { code: 'DIWALI40', discountPercent: 40, active: true },
  { code: 'EIDGIFT8', discountPercent: 8, active: true },
  { code: 'SALE2026', discountPercent: 12, active: true },
  { code: 'GULPRO15', discountPercent: 15, active: true },
  { code: 'LUCKY777', discountPercent: 7, active: true },
  { code: 'MEGA60PC', discountPercent: 60, active: true },
];

const seedCoupons = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected.');

    // Clear existing coupons if we want a fresh start, or just insert new ones ignoring duplicates
    for (const couponData of coupons) {
      const exists = await Coupon.findOne({ code: couponData.code });
      if (!exists) {
        await Coupon.create(couponData);
        console.log(`Created coupon: ${couponData.code} (${couponData.discountPercent}%)`);
      } else {
        console.log(`Coupon already exists: ${couponData.code}`);
      }
    }
    
    console.log('Coupons seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding coupons:', error);
    process.exit(1);
  }
};

seedCoupons();
