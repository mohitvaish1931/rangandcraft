import mongoose from 'mongoose';
import Product from '../models/Product.js';

// One-off price changes, applied once per database on startup. Each entry runs
// a single time (recorded in the `migrations` collection), so prices edited in
// the admin afterwards are never overwritten. Add a new id for a new change.
export const PRICE_UPDATES = [
  {
    id: 'prices-2026-11-short-kurta-749-shirts-599-699',
    prices: [
      { category: /^\s*short\s*kurtas?\s*$/i, price: 749 },
      { category: /^\s*half\s*sleeves?\s*shirts?\s*$/i, price: 599 },
      { category: /^\s*full\s*sleeves?\s*shirts?\s*$/i, price: 699 },
    ],
  },
];

/**
 * Sets the price for every product in a category. A crossed-out MRP is kept
 * only while it is still above the new price. Returns the number changed.
 */
export const setCategoryPrice = async (category, price) => {
  const res = await Product.updateMany({ category }, [
    {
      $set: {
        price,
        originalPrice: { $cond: [{ $gt: ['$originalPrice', price] }, '$originalPrice', 0] },
      },
    },
  ]);
  return res.modifiedCount;
};

export const applyPriceUpdates = async (updates = PRICE_UPDATES) => {
  const migrations = mongoose.connection.collection('migrations');
  for (const update of updates) {
    try {
      await migrations.insertOne({ _id: update.id, startedAt: new Date() });
    } catch (err) {
      if (err.code === 11000) continue; // already applied
      throw err;
    }
    const counts = [];
    try {
      for (const { category, price } of update.prices) {
        counts.push(`${category.source} → ₹${price}: ${await setCategoryPrice(category, price)}`);
      }
    } catch (err) {
      await migrations.deleteOne({ _id: update.id }); // retry on the next start
      throw err;
    }
    await migrations.updateOne({ _id: update.id }, { $set: { finishedAt: new Date(), counts } });
    console.log(`Price update ${update.id} applied (${counts.join('; ')}).`);
  }
};
