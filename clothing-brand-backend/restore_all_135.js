import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import Product from './models/Product.js';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ==========================================
// NAME ARRAYS - 40 Half Sleeves Shirts, 20 Gowns, 20 Kurta4, 25 Kurta5, 14 Suits = 119 names
// We need 135 unique products, so we add Vol suffix for overflow
// ==========================================
const topsNames = [
  "Aura Floral Print Peplum Top", "Miraya Smocked Cotton Top", "Ziva Indigo Tunic", "Nisha Cotton Peplum Top", "Ananya Boho Chic Top",
  "Rhea Meadow Floral Top", "Ira Indigo Printed Top", "Siya Crimson Cotton Top", "Zoya Classic Tunic Top", "Kriti Elegant Peplum Top",
  "Ishita Pastel Comfort Top", "Zara Urban Cotton Top", "Sanvi Smocked Peplum", "Kiara Vintage Print Top", "Diya Everyday Cotton Top",
  "Kavya Indigo Peplum", "Tanya Floral Cotton Top", "Shanaya Pastel Daily Top", "Ahana Meadow Print Top", "Aditi Graceful Tunic",
  "Kashvi Boho Peplum Top", "Vaidehi Floral Tunic", "Fiza Summer Cotton Top", "Meera Flared Peplum", "Riya Block Print Top",
  "Tanu Classic Daily Top", "Pia Modern Ethnic Top", "Dia Crimson Daily Top", "Suhana Indigo Peplum", "Divya Pastel Meadow Top",
  "Pari Boho Cotton Top", "Aarohi Floral Smocked Top", "Siya Indigo Tunic", "Prisha Vintage Print Top", "Sanya Cotton Peplum",
  "Sneha Meadow Daily Top", "Maya Indigo Floral Top", "Tanya Grace Tunic", "Siya Smocked Floral Top", "Neha Elegant Peplum Top",
  "Tanvi Royal Printed Top", "Nandini Classic Cotton Top", "Jhanvi Ethnic Floral Top", "Swara Paisley Cotton Top", "Radhika Charm Top",
  "Anvi Embroidered Daily Top"
];

const gownNames = [
  "Rooh Cotton Flared Gown", "Jaipur Heritage Anarkali Gown", "Desert Rose Tiered Gown", "Miraya Flared Maxi Gown", "Radhika Cotton Gown Kurta",
  "Vaidehi Traditional Anarkali", "Nisha Cotton Gown Kurta", "Saira Festive Anarkali Gown", "Maya Indigo Flared Gown", "Tara Ethnic Gown Kurta",
  "Aisha Tiered Maxi Gown", "Heera Royal Cotton Gown", "Gitanjali Embroidered Gown", "Bahaar Flared Cotton Gown", "Aarohi Indigo Gown Kurta",
  "Zoya Crimson Anarkali Gown", "Sia Tiered Cotton Gown", "Avani Flared Gown", "Charu Printed Gown Kurta", "Esha Indigo Gown"
];

const kurtaSet4Names = [
  "Mehrunisa Embroidered Angrakha Set", "Zeenat Festive Angrakha Set", "Kashida Heritage Kurta Set", "Noor Floral Angrakha Set", "Fiza Pastel Kurta Set",
  "Gulnaz Cotton Kurta Set", "Afreen Traditional Kurta Set", "Zara Embroidered Suit Set", "Sabrina Angrakha Kurta Set", "Pakeezah Royal Kurta Set",
  "Komal Daily Kurta Set", "Jasmine Pastel Angrakha Set", "Ruhi Embroidered Set", "Nisha Cotton Kurta Set", "Shreya Angrakha Kurta Set",
  "Ritu Daily Wear Set", "Prisha Embroidered Kurta Set", "Sia Cotton Kurta Set", "Myra Festive Kurta Set", "Zoya Traditional Angrakha Set",
  "Laila Royal Angrakha Set", "Inaya Embroidered Kurta Set", "Naira Festive Angrakha Set", "Hina Cotton Kurta Set", "Ayesha Classic Angrakha Set",
  "Mahira Premium Kurta Set"
];

const kurtaSet5Names = [
  "Simple Elegance Cotton Angrakha Set", "Rooh Daily Wear Kurta Set", "Meera Cotton Angrakha Set", "Aura Pastel Kurta Set", "Siya Everyday Kurta Set",
  "Dia Crimson Angrakha Set", "Zoya Daily Comfort Set", "Kriti Pastel Kurta Set", "Zara Everyday Angrakha Set", "Sanvi Daily Kurta Set",
  "Kiara Pastel Kurta Set", "Diya Cotton Kurta Set", "Kavya Simple Angrakha Set", "Tanya Daily Cotton Set", "Shanaya Pastel Kurta Set",
  "Ahana Comfort Kurta Set", "Aditi Daily Angrakha Set", "Kashvi Cotton Kurta Set", "Vaidehi Daily Wear Set", "Fiza Simple Angrakha Set",
  "Riya Cotton Angrakha Set", "Tanu Comfort Kurta Set", "Pia Pastel Angrakha Set", "Suhana Daily Kurta Set", "Divya Comfort Kurta Set",
  "Nidhi Classic Angrakha Set", "Pooja Everyday Kurta Set", "Mansi Comfort Angrakha Set", "Roshni Pastel Kurta Set", "Sonali Cotton Angrakha Set",
  "Drishti Daily Kurta Set", "Gauri Everyday Angrakha Set", "Paridhi Comfort Kurta Set"
];

const suitNames = [
  "Bahaar Premium Angrakha Suit Set", "Rehana Royal Cotton Suit Set", "Zoya Festive Suit Set", "Rukhsar Embroidered Suit Set", "Shama Traditional Suit Set",
  "Nazia Cotton Suit Set", "Dilruba Premium Suit Set", "Shehnaz Designer Suit Set", "Parveen Graceful Suit Set", "Kiran Royal Suit Set",
  "Saira Luxury Suit Set", "Tara Premium Suit Set", "Aisha Royal Suit Set", "Gulnaz Heritage Suit Set"
];

// Index counters for unique names
let topsIdx = 0, gownIdx = 0, kurta4Idx = 0, kurta5Idx = 0, suitIdx = 0;

function getName(folder) {
  let arr, idx;
  if (folder.includes("Folder 1") || folder.includes("Folder 2")) {
    arr = topsNames; idx = topsIdx++;
  } else if (folder.includes("Folder 3")) {
    arr = gownNames; idx = gownIdx++;
  } else if (folder.includes("Folder 4")) {
    arr = kurtaSet4Names; idx = kurta4Idx++;
  } else if (folder.includes("Folder 5")) {
    arr = kurtaSet5Names; idx = kurta5Idx++;
  } else if (folder.includes("Folder 6")) {
    arr = suitNames; idx = suitIdx++;
  } else {
    return "Beautiful Ethnic Wear";
  }
  const base = arr[idx % arr.length];
  const cycle = Math.floor(idx / arr.length);
  return cycle > 0 ? `${base} Vol ${cycle + 1}` : base;
}

// SEO Name builder
function getSeoName(baseName, folder) {
  if (folder.includes("Folder 1")) {
    return `${baseName} 3-Piece Cotton Top Set`;
  } else if (folder.includes("Folder 2")) {
    if (baseName.toLowerCase().includes("peplum")) return `${baseName} Cotton Peplum Top`;
    if (baseName.toLowerCase().includes("tunic")) return `${baseName} Cotton Tunic Top`;
    return `${baseName} Casual Printed Cotton Top`;
  } else if (folder.includes("Folder 3")) {
    return `${baseName} Cotton Flared Anarkali Gown Kurta`;
  } else if (folder.includes("Folder 4")) {
    return `${baseName} Premium Embroidered Cotton Angrakha Kurta Pant Set`;
  } else if (folder.includes("Folder 5")) {
    return `${baseName} Daily Wear Cotton Angrakha Kurta Pant Set`;
  } else if (folder.includes("Folder 6")) {
    return `${baseName} Premium Cotton Angrakha Suit Set with Dupatta`;
  }
  return baseName;
}

const folderConfig = {
  "Folder 1(Three Piece Top)": {
    category: "Three Piece Half Sleeves Shirts",
    subcategory: "Daily Wear",
    price: 250,
    originalPrice: 499,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    materials: ['Cotton'],
    specifications: ['Length: 30 inches', 'Premium 60x60 Cotton Fabric', 'Comfortable Daily Wear fit'],
    description: "Enhance your daily wardrobe with this beautiful three-piece cotton top. Made from premium 60x60 cotton fabric, it features a comfortable fit with a length of 30 inches. Perfect for everyday casual outings."
  },
  "Folder 2 (Top": {
    category: "Half Sleeves Shirts",
    subcategory: "Daily Wear",
    price: 250,
    originalPrice: 499,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    materials: ['Cotton'],
    specifications: ['Length: 30 inches', 'Premium 60x60 Cotton Fabric', 'Comfortable Daily Wear fit'],
    description: "Enhance your daily wardrobe with this beautiful daily wear cotton top. Made from premium 60x60 cotton fabric, it features a comfortable fit with a length of 30 inches. Perfect for everyday casual outings."
  },
  "Folder 3 (Long single piece kurta)": {
    category: "Kurtas",
    subcategory: "Gowns",
    price: 550,
    originalPrice: 999,
    sizes: ['M', 'L', 'XL', 'XXL'],
    materials: ['Cotton'],
    specifications: ['Gown Length: 46 inches', 'Premium 60/60 Cotton Fabric', 'Elegant Flared Fit'],
    description: "An elegant single-piece flared cotton gown kurta, measuring 46 inches in length. Crafted from high-quality 60/60 cotton fabric, it is designed for a graceful ethnic look and all-day comfort."
  },
  "Folder 4 (Two Piece Kurta Set)": {
    category: "Short Kurtas",
    subcategory: "Angrakha Sets",
    price: 590,
    originalPrice: 1199,
    sizes: ['M', 'L', 'XL', 'XXL', '4XL', '5XL'],
    colors: ['Purple', 'Red', 'Blue'],
    materials: ['Cotton'],
    specifications: ['Detailed Embroidery Work', 'Kurta Length: 48 inches', 'Pant Length: 38 inches', '3/4 Sleeves'],
    description: "A stunning Angrakha Kurta Set featuring detailed embroidery work. This two-piece set includes a kurta (48\" length) and matching pants (38\" length) with 3/4 sleeves. Made from breathable cotton, it's perfect for both festive occasions and casual get-togethers."
  },
  "Folder 5 (Two Piece Kurta Set)": {
    category: "Short Kurtas",
    subcategory: "Angrakha Sets",
    price: 450,
    originalPrice: 899,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Purple', 'Red', 'Blue'],
    materials: ['Cotton'],
    specifications: ['Kurta Length: 48 inches', 'Pant Length: 38 inches', '3/4 Sleeves'],
    description: "A classic cotton Angrakha Kurta Set designed for style and comfort. The set features a kurta of 48 inches length and pants of 38 inches length with elegant 3/4 sleeves."
  },
  "Folder 6 (Two Piece Kurta Set)": {
    category: "Suits",
    subcategory: "Angrakha Suits",
    price: 690,
    originalPrice: 1399,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Purple', 'Red', 'Blue'],
    materials: ['Cotton'],
    specifications: ['Kurta Length: 48 inches', 'Pant Length: 38 inches', '3/4 Sleeves'],
    description: "A premium Cotton Angrakha Suit Set, featuring beautiful traditional cuts. It includes a 48-inch long kurta, a 38-inch matching pant, and 3/4 sleeves, offering a sophisticated look."
  }
};

// ==========================================
// MAIN RESTORATION
// ==========================================
const run = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected!');

    const adminUser = await User.findOne({ email: 'admin@rangandcraft.store' });
    if (!adminUser) throw new Error("Admin user admin@rangandcraft.store not found.");
    const adminId = adminUser._id;

    // 1. Collect ALL existing Cloudinary URLs from current DB products
    const existingProducts = await Product.find().select('images');
    const existingUrls = new Set();
    existingProducts.forEach(p => {
      if (p.images) p.images.forEach(url => existingUrls.add(url));
    });
    console.log(`Found ${existingUrls.size} existing Cloudinary URLs in DB to potentially reuse.`);

    // 2. Load drive contents and group into 135 products
    const jsonPath = path.join(__dirname, '../drive_contents.json');
    const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    const grouped = {};
    rawData.forEach(item => {
      if (item.path === 'Rate List For Kurtas.pdf') return;
      const parts = item.path.split('/');
      const folder = parts[0];
      const filename = parts[1];
      
      let baseName = filename;
      const match = filename.match(/(WhatsApp Image\s+\d{4}-\d{2}-\d{2}\s+at\s+\d+\.\d+\.\d+\s+[AP]M)(?:\s+\(\d+\))?\.jpe?g/i);
      if (match) baseName = match[1];
      
      const key = `${folder}/${baseName}`;
      if (!grouped[key]) {
        grouped[key] = { folder, baseName, files: [] };
      }
      grouped[key].files.push(item);
    });

    const productsList = Object.values(grouped);
    console.log(`\nGrouped into ${productsList.length} unique products from drive_contents.json.`);

    // 3. Upload images to Cloudinary (reuse existing URLs where possible)
    const uploadBase = path.join(__dirname, '../drive_downloads');
    
    // Build a cache: filename -> URL (from existing Cloudinary resources if possible)
    // We can't easily match old URLs to files, so we'll upload all and let Cloudinary handle it
    const uploadToCloudinary = async (fileItem) => {
      const localPath = path.join(uploadBase, ...fileItem.path.split('/'));
      if (!fs.existsSync(localPath)) {
        throw new Error(`File does not exist locally: ${localPath}`);
      }
      const result = await cloudinary.uploader.upload(localPath, {
        folder: 'gul_products_all',
        resource_type: 'image',
      });
      return result.secure_url;
    };

    // 4. Clear existing products
    console.log('\nClearing existing products...');
    const deleteResult = await Product.deleteMany({});
    console.log(`Cleared ${deleteResult.deletedCount} products.`);

    // 5. Process products in batches
    let processedCount = 0;
    let successCount = 0;
    let failCount = 0;
    const batchSize = 5;

    for (let i = 0; i < productsList.length; i += batchSize) {
      const batch = productsList.slice(i, i + batchSize);
      console.log(`\n--- Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(productsList.length / batchSize)} (Products ${i + 1}-${Math.min(i + batchSize, productsList.length)}) ---`);

      await Promise.all(batch.map(async (p) => {
        const config = folderConfig[p.folder];
        if (!config) {
          console.warn(`  ⚠️ No config for folder "${p.folder}". Skipping.`);
          return;
        }

        const rawName = getName(p.folder);
        const finalName = getSeoName(rawName, p.folder);

        try {
          // Upload all images for this product
          const imageUrls = [];
          for (const fileItem of p.files) {
            const url = await uploadToCloudinary(fileItem);
            imageUrls.push(url);
          }

          if (imageUrls.length === 0) {
            throw new Error('No images uploaded.');
          }

          const productData = {
            user: adminId,
            name: finalName,
            image: imageUrls[0],
            images: imageUrls,
            brand: 'RANG AND CRAFT',
            category: config.category,
            subcategory: config.subcategory || '',
            description: config.description,
            price: config.price,
            originalPrice: config.originalPrice,
            countInStock: Math.floor(Math.random() * 15) + 5,
            stock: Math.floor(Math.random() * 15) + 5,
            sizes: config.sizes || [],
            colors: config.colors || [],
            materials: config.materials || [],
            specifications: config.specifications || [],
            careInstructions: ['Dry clean or gentle hand wash', 'Iron at low temperature'],
            soldOut: false,
            displayOrder: ++processedCount,
          };

          await Product.create(productData);
          console.log(`  [✓] "${finalName}" (${imageUrls.length} images)`);
          successCount++;
        } catch (err) {
          console.error(`  [✗] Failed "${finalName}": ${err.message}`);
          failCount++;
        }
      }));
    }

    // 6. Verification
    console.log('\n\n========================================');
    console.log('       RESTORATION COMPLETE');
    console.log('========================================');
    console.log(`Total Products Attempted: ${productsList.length}`);
    console.log(`Successfully Created:     ${successCount}`);
    console.log(`Failed:                   ${failCount}`);

    const categories = ["Three Piece Half Sleeves Shirts", "Half Sleeves Shirts", "Kurtas", "Short Kurtas", "Suits"];
    console.log('\nCategory Breakdown:');
    for (const cat of categories) {
      const count = await Product.countDocuments({ category: cat });
      console.log(`  ${cat}: ${count}`);
    }

    // Check for duplicate names
    const dupes = await Product.aggregate([
      { $group: { _id: "$name", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    if (dupes.length > 0) {
      console.log('\n⚠️ DUPLICATE NAMES:');
      dupes.forEach(d => console.log(`  "${d._id}" x${d.count}`));
    } else {
      console.log('\n✅ All product names are unique!');
    }

    const totalInDB = await Product.countDocuments();
    console.log(`\n✅ Total Products in Database: ${totalInDB}`);

    process.exit(0);
  } catch (error) {
    console.error(`\nCritical Error: ${error.message}`);
    process.exit(1);
  }
};

run();
