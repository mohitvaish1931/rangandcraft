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

const runSeed = async () => {
  await connectDB();
  
  const adminUser = await User.findOne({ isAdmin: true });
  if (!adminUser) {
    console.error('No admin user found!');
    process.exit(1);
  }

  // Delete previous test products generated manually and with bad timestamps
  await Product.deleteMany({ name: { $regex: /Style \d+|Floral Print One Piece Kurta|Cotton Floral Print Top|Daily Wear Top/i }});
  console.log('Cleaned up previous grouped products.');

  const groupsFile = 'local_groups.json';
  if (!fs.existsSync(groupsFile)) {
      console.error('local_groups.json not found!');
      process.exit(1);
  }

  const allGroups = JSON.parse(fs.readFileSync(groupsFile, 'utf-8'));
  
  const productNames = {
      7: 'Floral Print One Piece Kurta',
      8: 'Maroon Cotton Floral Print Top',
      9: 'Black Cotton Floral Print Top',
      10: 'Elegant Daily Wear Top'
  };

  const productCategories = {
      7: 'Short Kurtas',
      8: 'Half Sleeves Shirts & Co-ord Sets',
      9: 'Half Sleeves Shirts & Co-ord Sets',
      10: 'Half Sleeves Shirts & Co-ord Sets'
  };

  for (const [folderName, groups] of Object.entries(allGroups)) {
      let folderNum = 7;
      if (folderName.includes('Folder 8')) folderNum = 8;
      else if (folderName.includes('Folder 9')) folderNum = 9;
      else if (folderName.includes('Folder 10')) folderNum = 10;

      console.log(`\nProcessing ${folderName} (Num: ${folderNum}) - ${groups.length} distinct products found`);
      
      for (let i = 0; i < groups.length; i++) {
          const imagePaths = groups[i];
          console.log(`Product ${i + 1} has ${imagePaths.length} photos. Uploading...`);
          
          let uploadedUrls = [];
          for (const img of imagePaths) {
              const url = await uploadToCloudinary(img);
              if (url) uploadedUrls.push(url);
          }

          if (uploadedUrls.length > 0) {
              const productName = `${productNames[folderNum]} - Design ${i + 1}`;
              const product = new Product({
                user: adminUser._id,
                name: productName,
                image: uploadedUrls[0],
                images: uploadedUrls,
                brand: 'RANG AND CRAFT',
                category: productCategories[folderNum],
                description: '✨ Stylish Top with Full Sleeves ✨\n🌿 Fabric: cotton printed\n⭐ Size: S To xxL\n⭐ Sleeves: Full Sleeves\n⭐ Type: Fully Stitched\n😍 Perfect for Daily Wear, College Wear & Casual Outings\n🤩 Price :-250/- No Less\n✈️ Ready to Dispatch\n💯 Best Quality Guaranteed',
                price: 250,
                originalPrice: 250,
                countInStock: 50,
                sizes: ['S', 'M', 'L', 'XL', 'XXL'],
                colors: [] 
              });
              await product.save();
              console.log(`✅ Saved: ${productName} (${uploadedUrls.length} images)`);
          }
      }
  }

  console.log('\nAll visually grouped products successfully uploaded!');
  process.exit();
};

runSeed();
