import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const migrateCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for category migration!");

    // 1. Rename Suits to Long Kurtas
    const resSuits = await Product.updateMany({ category: 'Suits' }, { $set: { category: 'Long Kurtas' } });
    console.log(`Updated ${resSuits.modifiedCount} products from 'Suits' to 'Long Kurtas'.`);

    // 2. Rename Half Sleeves Shirts to Half Sleeves Shirts & Co-ord Sets
    const resTops = await Product.updateMany({ category: 'Half Sleeves Shirts' }, { $set: { category: 'Half Sleeves Shirts & Co-ord Sets' } });
    console.log(`Updated ${resTops.modifiedCount} products from 'Half Sleeves Shirts' to 'Half Sleeves Shirts & Co-ord Sets'.`);

    // 3. Rename Three Piece Half Sleeves Shirts to Shrug Sets
    const resThree = await Product.updateMany({ category: 'Three Piece Half Sleeves Shirts' }, { $set: { category: 'Shrug Sets' } });
    console.log(`Updated ${resThree.modifiedCount} products from 'Three Piece Half Sleeves Shirts' to 'Shrug Sets'.`);

    // 4. Rename Kurtas to Full Sleeves Shirts
    const resKurtis = await Product.updateMany({ category: 'Kurtas' }, { $set: { category: 'Full Sleeves Shirts' } });
    console.log(`Updated ${resKurtis.modifiedCount} products from 'Kurtas' to 'Full Sleeves Shirts'.`);

    console.log("\nMigration completed successfully!");

    // Verify current category counts
    const categories = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    console.log("\nUpdated Products by Category:");
    categories.forEach(cat => {
      console.log(`- ${cat._id || 'No Category'}: ${cat.count} products`);
    });

    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  }
};

migrateCategories();
