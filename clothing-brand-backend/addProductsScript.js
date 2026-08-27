import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import Product from './models/Product.js';
import User from './models/User.js';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'gul_fashion/products',
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return null;
  }
};

const getImagesFromFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) return [];
  const files = fs.readdirSync(folderPath);
  return files
    .filter(file => file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png'))
    .map(file => path.join(folderPath, file));
};

const runSeed = async () => {
  await connectDB();
  
  const adminUser = await User.findOne({ isAdmin: true });
  if (!adminUser) {
    console.error('No admin user found!');
    process.exit(1);
  }

  const baseDir = path.join('..', 'Rang and Craft');
  console.log('Looking in base dir:', baseDir);
  
  let folders = [];
  if (fs.existsSync(baseDir)) {
      folders = fs.readdirSync(baseDir);
  }

  // Find folders that match 7, 8, or 9
  const targetFolders = folders.filter(f => f.includes('Folder 7') || f.includes('Folder 8') || f.includes('Folder 9') || f.includes('7') || f.includes('8') || f.includes('9'));
  console.log('Target folders found:', targetFolders);

  if (targetFolders.length === 0) {
      console.log('No folders 7, 8, 9 found yet. Creating dummy product without images.');
      const product = new Product({
        user: adminUser._id,
        name: 'TRENDY FLORAL PRINT TOP',
        image: '/images/placeholder.png', // placeholder
        images: ['/images/placeholder.png'],
        brand: 'RANG AND CRAFT',
        category: 'Half Sleeves Shirts & Co-ord Sets',
        description: '✨ Stylish Top with Full Sleeves ✨\\n🌿 Fabric: cotton printed\\n⭐ Size: S To xxL\\n⭐ Sleeves: Full Sleeves\\n⭐ Type: Fully Stitched\\n🎨 Colors: Maroon & Black\\n😍 Perfect for Daily Wear, College Wear & Casual Outings\\n🤩 Price :-250/- No Less\\n✈️ Ready to Dispatch\\n💯 Best Quality Guaranteed',
        price: 250,
        originalPrice: 250,
        countInStock: 50,
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['Maroon', 'Black']
      });
      await product.save();
      console.log('Product created without images.');
  } else {
      for (const folderName of targetFolders) {
          console.log(`Processing folder: ${folderName}`);
          const folderPath = path.join(baseDir, folderName);
          const imagePaths = getImagesFromFolder(folderPath);
          
          let uploadedUrls = [];
          for (const img of imagePaths) {
              console.log(`Uploading ${img}...`);
              const url = await uploadToCloudinary(img);
              if (url) uploadedUrls.push(url);
          }

          if (uploadedUrls.length > 0) {
              const product = new Product({
                user: adminUser._id,
                name: 'TRENDY FLORAL PRINT TOP',
                image: uploadedUrls[0],
                images: uploadedUrls,
                brand: 'RANG AND CRAFT',
                category: 'Half Sleeves Shirts & Co-ord Sets',
                description: '✨ Stylish Top with Full Sleeves ✨\\n🌿 Fabric: cotton printed\\n⭐ Size: S To xxL\\n⭐ Sleeves: Full Sleeves\\n⭐ Type: Fully Stitched\\n🎨 Colors: Maroon & Black\\n😍 Perfect for Daily Wear, College Wear & Casual Outings\\n🤩 Price :-250/- No Less\\n✈️ Ready to Dispatch\\n💯 Best Quality Guaranteed',
                price: 250,
                originalPrice: 250,
                countInStock: 50,
                sizes: ['S', 'M', 'L', 'XL', 'XXL'],
                colors: ['Maroon', 'Black']
              });
              await product.save();
              console.log(`Product created for ${folderName} with ${uploadedUrls.length} images.`);
          } else {
              console.log(`No images uploaded for ${folderName}`);
          }
      }
  }

  console.log('Seeding complete.');
  process.exit();
};

runSeed();
