import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

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

const prefixes = [
    "Trendy", "Classic", "Elegant", "Stylish", "Beautiful", "Premium", 
    "Comfortable", "Chic", "Graceful", "Vibrant", "Exquisite", "Casual", 
    "Boho", "Gorgeous", "Modern", "Exclusive", "Designer", "Authentic"
];

const suffixes = [
    "for Men", "with Full Sleeves", "for Daily Wear", "for College Wear", 
    "Summer Collection", "Office Wear", "Casual Wear", "- Premium Quality",
    "for Girls & Men", "Ethnic Wear", "Western Wear", "Party Wear",
    "with Beautiful Print", "Comfort Fit", "Regular Fit"
];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

const runUpdate = async () => {
  await connectDB();
  
  // Find products that have " - Design " in their name
  const products = await Product.find({ name: / - Design \d+/i });
  console.log(`Found ${products.length} products to update.`);

  let updatedCount = 0;
  
  // Keep track of used names to ensure absolute uniqueness
  const usedNames = new Set();

  for (const product of products) {
      // Extract the core name by removing " - Design X"
      const coreNameMatch = product.name.match(/(.+) - Design \d+/i);
      if (coreNameMatch) {
          const coreName = coreNameMatch[1];
          
          let newName = "";
          let attempts = 0;
          let isUnique = false;
          
          while (!isUnique && attempts < 100) {
              const prefix = getRandomItem(prefixes);
              const suffix = getRandomItem(suffixes);
              
              // Randomly decide format: 
              // 0: Prefix + Core + Suffix
              // 1: Prefix + Core
              // 2: Core + Suffix
              const formatType = Math.floor(Math.random() * 3);
              
              if (formatType === 0) {
                  newName = `${prefix} ${coreName} ${suffix}`;
              } else if (formatType === 1) {
                  newName = `${prefix} ${coreName}`;
              } else {
                  newName = `${coreName} ${suffix}`;
              }
              
              if (!usedNames.has(newName)) {
                  isUnique = true;
                  usedNames.add(newName);
              }
              attempts++;
          }
          
          // Fallback if we couldn't find a unique one
          if (!isUnique) {
              newName = `${getRandomItem(prefixes)} ${coreName} ${getRandomItem(suffixes)} - Special Edition ${Math.floor(Math.random() * 1000)}`;
          }
          
          product.name = newName;
          await product.save();
          updatedCount++;
          console.log(`Updated: ${newName}`);
      }
  }

  console.log(`Successfully updated ${updatedCount} products with SEO ready names!`);
  process.exit(0);
};

runUpdate();
