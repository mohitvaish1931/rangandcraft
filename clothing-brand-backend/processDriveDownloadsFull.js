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

// Helper to parse "WhatsApp Image 2026-07-09 at 3.22.27 PM (1).jpeg" to a timestamp
const parseTimestamp = (filename) => {
    const match = filename.match(/WhatsApp Image (\d{4}-\d{2}-\d{2}) at (\d+)\.(\d+)\.(\d+) (AM|PM)/i);
    if (match) {
        let [_, date, h, m, s, ampm] = match;
        h = parseInt(h);
        if (ampm.toUpperCase() === 'PM' && h !== 12) h += 12;
        if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
        return new Date(`${date}T${h.toString().padStart(2, '0')}:${m}:${s}Z`).getTime();
    }
    return 0;
};

const getGroupedImages = (folderPath) => {
  if (!fs.existsSync(folderPath)) return [];
  
  let targetPath = folderPath;
  const innerDirs = fs.readdirSync(folderPath).filter(f => fs.statSync(path.join(folderPath, f)).isDirectory());
  if (innerDirs.length === 1 && innerDirs[0].includes('Folder')) {
      targetPath = path.join(folderPath, innerDirs[0]);
  }
  
  const files = fs.readdirSync(targetPath).filter(file => file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png'));
  
  const fileData = files.map(f => ({
      path: path.join(targetPath, f),
      time: parseTimestamp(f)
  })).sort((a, b) => a.time - b.time);

  const groups = [];
  let currentGroup = [];
  
  for (let i = 0; i < fileData.length; i++) {
      if (currentGroup.length === 0) {
          currentGroup.push(fileData[i]);
      } else {
          const prevTime = currentGroup[currentGroup.length - 1].time;
          const currTime = fileData[i].time;
          // If within 30 seconds of the last image, group them
          if ((currTime - prevTime) <= 30000) {
              currentGroup.push(fileData[i]);
          } else {
              groups.push(currentGroup.map(x => x.path));
              currentGroup = [fileData[i]];
          }
      }
  }
  if (currentGroup.length > 0) {
      groups.push(currentGroup.map(x => x.path));
  }
  
  return groups;
};

const runSeed = async () => {
  await connectDB();
  
  const adminUser = await User.findOne({ isAdmin: true });
  if (!adminUser) {
    console.error('No admin user found!');
    process.exit(1);
  }

  // Clean up products created in the previous step
  const namesToDelete = [
      'Aisha Floral Print One Piece Kurta Set',
      'Kiara Maroon Cotton Floral Print Top',
      'Myra Black Cotton Floral Print Top',
      'Zoya Elegant Daily Wear Top'
  ];
  await Product.deleteMany({ name: { $in: namesToDelete }});
  console.log('Cleaned up previous grouped products.');

  const baseDir = path.join('..', 'drive_downloads');
  console.log('Looking in base dir:', baseDir);
  
  let folders = [];
  if (fs.existsSync(baseDir)) {
      folders = fs.readdirSync(baseDir);
  }

  const targetFolders = folders.filter(f => f.includes('Folder 7') || f.includes('Folder 8') || f.includes('Folder 9') || f.includes('Folder 10'));
  console.log('Target folders found:', targetFolders);

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

  for (const folderName of targetFolders) {
      let folderNum = 7;
      if (folderName.includes('Folder 8')) folderNum = 8;
      else if (folderName.includes('Folder 9')) folderNum = 9;
      else if (folderName.includes('Folder 10')) folderNum = 10;

      console.log(`\nProcessing ${folderName} (Num: ${folderNum})`);
      
      const folderPath = path.join(baseDir, folderName);
      const groups = getGroupedImages(folderPath);
      console.log(`Found ${groups.length} distinct products in this folder based on photo timestamps.`);
      
      for (let i = 0; i < groups.length; i++) {
          const imagePaths = groups[i];
          console.log(`Product ${i + 1} has ${imagePaths.length} photos. Uploading...`);
          
          let uploadedUrls = [];
          // Upload all images for this product variant
          for (const img of imagePaths) {
              const url = await uploadToCloudinary(img);
              if (url) uploadedUrls.push(url);
          }

          if (uploadedUrls.length > 0) {
              const productName = `${productNames[folderNum]} - Style ${i + 1}`;
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

  console.log('\nAll products successfully grouped and uploaded!');
  process.exit();
};

runSeed();
