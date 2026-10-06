import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const runUpdate = async () => {
  await connectDB();
  
  const newDescription = '🌸 TRENDY FLORAL PRINT TOP 🌸\n✨ Stylish Top with Full Sleeves ✨\n🌿 Fabric: Rayon printed\n⭐ Size: S To xxL\n⭐ Sleeves: Full Sleeves\n⭐ Type: Fully Stitched\n🎨 Colors: Maroon & Black\n😍 Perfect for Daily Wear, College Wear & Casual Outings\n🤩 *Price :-250/- No Less*\n✈️ Ready to Dispatch\n💯 Best Quality Guaranteed';

  // Folder 10 products all contain the core name "Elegant Daily Wear Top"
  const result = await Product.updateMany(
      { name: /Elegant Daily Wear Top/i },
      { $set: { description: newDescription } }
  );

  console.log(`Successfully updated ${result.modifiedCount} products from Folder 10.`);
  process.exit(0);
};

runUpdate();
