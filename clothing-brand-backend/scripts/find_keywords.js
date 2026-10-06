import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

const listProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const products = await Product.find().select('name category').sort({ category: 1 });
    products.forEach((p, i) => {
      console.log(`${i+1}. "${p.name}" | Cat: "${p.category}"`);
    });
    process.exit(0);
  } catch (err) {
    console.error("Failed:", err.message);
    process.exit(1);
  }
};

listProducts();
