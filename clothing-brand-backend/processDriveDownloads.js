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
  // For zip extractions, there might be a subfolder with the same name
  let targetPath = folderPath;
  const innerDirs = fs.readdirSync(folderPath).filter(f => fs.statSync(path.join(folderPath, f)).isDirectory());
  if (innerDirs.length === 1 && innerDirs[0].includes('Folder')) {
      targetPath = path.join(folderPath, innerDirs[0]);
  }
  
  const files = fs.readdirSync(targetPath);
  return files
    .filter(file => file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png'))
    .map(file => path.join(targetPath, file));
};

const runSeed = async () => {
  await connectDB();
  
  const adminUser = await User.findOne({ isAdmin: true });
  if (!adminUser) {
    console.error('No admin user found!');
    process.exit(1);
  }

  // Delete the previous dummy products
  await Product.deleteMany({ name: { $in: [
      'Aisha Maroon Cotton Floral Print Top', 
      'Kiara Black Cotton Floral Print Top', 
      'Myra Stylish Cotton Floral Print Top'
  ]}});
  console.log('Deleted previous dummy products');

  const baseDir = path.join('..', 'drive_downloads');
  console.log('Looking in base dir:', baseDir);
  
  let folders = [];
  if (fs.existsSync(baseDir)) {
      folders = fs.readdirSync(baseDir);
  }

  const targetFolders = folders.filter(f => f.includes('Folder 7') || f.includes('Folder 8') || f.includes('Folder 9') || f.includes('Folder 10'));
  console.log('Target folders found:', targetFolders);

  const productNames = {
      7: 'Aisha Floral Print One Piece Kurta Set',
      8: 'Kiara Maroon Cotton Floral Print Top',
      9: 'Myra Black Cotton Floral Print Top',
      10: 'Zoya Elegant Daily Wear Top'
  };

  const productCategories = {
      7: 'Short Kurtas',
      8: 'Half Sleeves Shirts & Co-ord Sets',
      9: 'Half Sleeves Shirts & Co-ord Sets',
      10: 'Half Sleeves Shirts & Co-ord Sets'
  };

  for (const folderName of targetFolders) {
      let folderNum = 7;
      if (folderName.includes('Folder 8')) folderNum = 8;
      else if (folderName.includes('Folder 9')) folderNum = 9;
      else if (folderName.includes('Folder 10')) folderNum = 10;

      console.log(`Processing ${folderName} (Num: ${folderNum})`);
      
      const folderPath = path.join(baseDir, folderName);
      let imagePaths = getImagesFromFolder(folderPath);
      
      // Limit to 4 images to save time
      imagePaths = imagePaths.slice(0, 4);

      let uploadedUrls = [];
      for (const img of imagePaths) {
          console.log(`Uploading ${img}...`);
          const url = await uploadToCloudinary(img);
          if (url) uploadedUrls.push(url);
      }

      if (uploadedUrls.length > 0) {
          const product = new Product({
            user: adminUser._id,
            name: productNames[folderNum],
            image: uploadedUrls[0],
            images: uploadedUrls,
            brand: 'RANG AND CRAFT',
            category: productCategories[folderNum],
            description: '✨ Stylish Top with Full Sleeves ✨\n🌿 Fabric: cotton printed\n⭐ Size: S To xxL\n⭐ Sleeves: Full Sleeves\n⭐ Type: Fully Stitched\n🎨 Colors: Maroon & Black\n😍 Perfect for Daily Wear, College Wear & Casual Outings\n🤩 Price :-250/- No Less\n✈️ Ready to Dispatch\n💯 Best Quality Guaranteed',
            price: 250,
            originalPrice: 250,
            countInStock: 50,
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            colors: ['Maroon', 'Black']
          });
          await product.save();
          console.log(`Product created for ${folderName} with ${uploadedUrls.length} images.`);
      } else {
          console.log(`No images found or uploaded for ${folderName}`);
      }
  }

  console.log('Seeding complete.');
  process.exit();
};

runSeed();
