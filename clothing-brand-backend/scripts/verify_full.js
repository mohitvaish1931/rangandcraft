import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

const verify = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB!");

    const count = await Product.countDocuments();
    console.log(`\nTotal Products in DB: ${count}`);

    // Category breakdown
    const categories = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    console.log("\n=== Products by Category ===");
    categories.forEach(cat => {
      console.log(`  ${cat._id}: ${cat.count}`);
    });

    // Check for duplicate names
    const dupes = await Product.aggregate([
      { $group: { _id: "$name", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    if (dupes.length > 0) {
      console.log("\n⚠️  DUPLICATE NAMES FOUND:");
      dupes.forEach(d => console.log(`  "${d._id}" appears ${d.count} times`));
    } else {
      console.log("\n✅ No duplicate product names found.");
    }

    // Check for missing images
    const missingImages = await Product.find({
      $or: [
        { image: { $exists: false } },
        { image: '' },
        { image: null },
        { images: { $size: 0 } },
        { images: { $exists: false } }
      ]
    }).select('name');
    
    if (missingImages.length > 0) {
      console.log("\n⚠️  PRODUCTS WITH MISSING IMAGES:");
      missingImages.forEach(p => console.log(`  "${p.name}"`));
    } else {
      console.log("✅ All products have images.");
    }

    // Image count distribution
    const imageCounts = await Product.aggregate([
      { $project: { imageCount: { $size: { $ifNull: ["$images", []] } } } },
      { $group: { _id: "$imageCount", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    console.log("\n=== Image count distribution ===");
    imageCounts.forEach(ic => {
      console.log(`  ${ic._id} image(s): ${ic.count} products`);
    });

    // Products with most images (merged products)
    const topImages = await Product.find().sort({ 'images': -1 }).limit(10).select('name category images');
    console.log("\n=== Products with most images (top 10) ===");
    topImages
      .sort((a, b) => (b.images?.length || 0) - (a.images?.length || 0))
      .forEach(p => {
        console.log(`  [${p.images?.length || 0} imgs] "${p.name}" (${p.category})`);
      });

    // List ALL products with their category
    console.log("\n=== ALL PRODUCTS ===");
    const allProducts = await Product.find().sort({ displayOrder: 1 }).select('name category price images displayOrder');
    allProducts.forEach((p, i) => {
      console.log(`  ${i+1}. [${p.category}] ${p.name} (₹${p.price}) - ${p.images?.length || 0} images`);
    });

    process.exit(0);
  } catch (err) {
    console.error("Verification failed:", err.message);
    process.exit(1);
  }
};

verify();
