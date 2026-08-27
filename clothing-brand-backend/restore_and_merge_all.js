import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from './models/Product.js';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Name arrays from upload_and_seed.js
const topsNames = [
  "Aura Floral Print Peplum Top", "Miraya Smocked Cotton Top", "Ziva Indigo Tunic", "Nisha Cotton Peplum Top", "Ananya Boho Chic Top",
  "Rhea Meadow Floral Top", "Ira Indigo Printed Top", "Siya Crimson Cotton Top", "Zoya Classic Tunic Top", "Kriti Elegant Peplum Top",
  "Ishita Pastel Comfort Top", "Zara Urban Cotton Top", "Sanvi Smocked Peplum", "Kiara Vintage Print Top", "Diya Everyday Cotton Top",
  "Kavya Indigo Peplum", "Tanya Floral Cotton Top", "Shanaya Pastel Daily Top", "Ahana Meadow Print Top", "Aditi Graceful Tunic",
  "Kashvi Boho Peplum Top", "Vaidehi Floral Tunic", "Fiza Summer Cotton Top", "Meera Flared Peplum", "Riya Block Print Top",
  "Tanu Classic Daily Top", "Pia Modern Ethnic Top", "Dia Crimson Daily Top", "Suhana Indigo Peplum", "Divya Pastel Meadow Top",
  "Pari Boho Cotton Top", "Aarohi Floral Smocked Top", "Siya Indigo Tunic", "Prisha Vintage Print Top", "Sanya Cotton Peplum",
  "Sneha Meadow Daily Top", "Maya Indigo Floral Top", "Tanya Grace Tunic", "Siya Smocked Floral Top", "Neha Elegant Peplum Top"
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
  "Ritu Daily Wear Set", "Prisha Embroidered Kurta Set", "Sia Cotton Kurta Set", "Myra Festive Kurta Set", "Zoya Traditional Angrakha Set"
];

const kurtaSet5Names = [
  "Simple Elegance Cotton Angrakha Set", "Rooh Daily Wear Kurta Set", "Meera Cotton Angrakha Set", "Aura Pastel Kurta Set", "Siya Everyday Kurta Set",
  "Dia Crimson Angrakha Set", "Zoya Daily Comfort Set", "Kriti Pastel Kurta Set", "Zara Everyday Angrakha Set", "Sanvi Daily Kurta Set",
  "Kiara Pastel Kurta Set", "Diya Cotton Kurta Set", "Kavya Simple Angrakha Set", "Tanya Daily Cotton Set", "Shanaya Pastel Kurta Set",
  "Ahana Comfort Kurta Set", "Aditi Daily Angrakha Set", "Kashvi Cotton Kurta Set", "Vaidehi Daily Wear Set", "Fiza Simple Angrakha Set",
  "Riya Cotton Angrakha Set", "Tanu Comfort Kurta Set", "Pia Pastel Angrakha Set", "Suhana Daily Kurta Set", "Divya Comfort Kurta Set"
];

const suitNames = [
  "Bahaar Premium Angrakha Suit Set", "Rehana Royal Cotton Suit Set", "Zoya Festive Suit Set", "Rukhsar Embroidered Suit Set", "Shama Traditional Suit Set",
  "Nazia Cotton Suit Set", "Dilruba Premium Suit Set", "Shehnaz Designer Suit Set", "Parveen Graceful Suit Set", "Kiran Royal Suit Set",
  "Saira Luxury Suit Set", "Tara Premium Suit Set", "Aisha Royal Suit Set", "Gulnaz Heritage Suit Set"
];

// Helper to make SEO-friendly names
function getSeoName(baseName, folder) {
  // Extract design suffix if present to keep names unique
  const designMatch = baseName.match(/\s*\(Design\s*(\d+)\)/i);
  const cleanName = baseName.replace(/\s*\(Design\s*\d+\)/i, '').trim();
  const designSuffix = designMatch ? ` Vol ${designMatch[1]}` : '';
  
  let seoName;
  if (folder.includes("Folder 1")) {
    seoName = `${cleanName} 3-Piece Cotton Top Set`;
  } else if (folder.includes("Folder 2")) {
    if (cleanName.toLowerCase().includes("peplum")) {
      seoName = `${cleanName} Cotton Peplum Top`;
    } else if (cleanName.toLowerCase().includes("tunic")) {
      seoName = `${cleanName} Cotton Tunic Top`;
    } else {
      seoName = `${cleanName} Casual Printed Cotton Top`;
    }
  } else if (folder.includes("Folder 3")) {
    seoName = `${cleanName} Cotton Flared Anarkali Gown Kurta`;
  } else if (folder.includes("Folder 4")) {
    seoName = `${cleanName} Premium Embroidered Cotton Angrakha Kurta Pant Set`;
  } else if (folder.includes("Folder 5")) {
    seoName = `${cleanName} Daily Wear Cotton Angrakha Kurta Pant Set`;
  } else if (folder.includes("Folder 6")) {
    seoName = `${cleanName} Premium Cotton Angrakha Suit Set with Dupatta`;
  } else {
    seoName = cleanName;
  }
  
  return seoName + designSuffix;
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

// Defined block sizes that were used in deduplicate_db.js
const originalBlockSizes = {
  "Folder 1(Three Piece Top)": [4, 2, 1, 2, 2, 1, 3, 2, 1, 2, 1, 1, 3, 3], // sum 28
  "Folder 2 (Top": [1, 1, 1, 3, 1, 1, 1, 2, 2, 2, 1, 2], // sum 18 (Note: first 14 blocks in deduplicate_db.js were Folder 1, next 12 blocks were Folder 2)
  "Folder 3 (Long single piece kurta)": [4, 2, 3, 3, 4], // sum 16
  "Folder 4 (Two Piece Kurta Set)": [6, 2, 5, 2, 2, 4, 2, 3], // sum 26
  "Folder 5 (Two Piece Kurta Set)": [2, 3, 1, 1, 3, 2, 3, 2, 1, 2, 2, 1, 2, 1, 4, 1, 1, 1], // sum 33
  "Folder 6 (Two Piece Kurta Set)": [2, 2, 2, 4, 1, 1, 1, 1] // sum 14
};

// Defined correct merge groups from similarity analysis
const correctMergeGroups = {
  "Folder 1(Three Piece Top)": [
    [0, 9, 10],
    [1, 4, 5, 12, 13, 14, 25],
    [2, 11],
    [3, 15, 16, 18, 19, 22, 23, 26],
    [6, 20, 21],
    [7, 8, 27]
  ],
  "Folder 2 (Top": [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7],
    [8, 9, 10],
    [11, 12],
    [13, 14, 15],
    [16, 17]
  ],
  "Folder 3 (Long single piece kurta)": [
    [0, 1, 2, 3],
    [4, 5],
    [6, 7, 8],
    [9, 10, 11],
    [12, 13],
    [14, 15]
  ],
  "Folder 4 (Two Piece Kurta Set)": [
    [0, 1, 2, 3, 4, 5],
    [6, 7],
    [8, 9, 10, 11, 12],
    [13, 14, 15, 16],
    [17, 18, 19, 20],
    [21, 22],
    [23, 24, 25]
  ],
  "Folder 5 (Two Piece Kurta Set)": [
    [0, 1, 2, 3],
    [4, 5, 6, 7, 8, 9],
    [10, 11],
    [12, 13, 14],
    [15, 16],
    [17, 18, 19],
    [20, 21],
    [23, 24],
    [25, 26, 27, 28, 29],
    [30, 31, 32]
  ],
  "Folder 6 (Two Piece Kurta Set)": [
    [0, 1],
    [2, 3, 4],
    [5, 13],
    [6, 7, 8, 9],
    [10, 12]
  ]
};

const run = async () => {
  try {
    // 1. Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB!");

    const adminUser = await User.findOne({ email: 'admin@rangandcraft.store' });
    const adminId = adminUser._id;

    // 2. Load drive contents
    const jsonPath = path.join(__dirname, '../drive_contents.json');
    const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    // Group files by product (folder + base timestamp name)
    const grouped = {};
    rawData.forEach(item => {
      if (item.path === 'Rate List For Kurtas.pdf') return;
      
      const parts = item.path.split('/');
      const folder = parts[0];
      const filename = parts[1];
      
      let baseName = filename;
      const match = filename.match(/(WhatsApp Image\s+\d{4}-\d{2}-\d{2}\s+at\s+\d+\.\d+\.\d+\s+[AP]M)(?:\s+\(\d+\))?\.jpe?g/i);
      if (match) {
        baseName = match[1];
      }
      
      const key = `${folder}/${baseName}`;
      if (!grouped[key]) {
        grouped[key] = { folder, baseName, files: [] };
      }
      grouped[key].files.push(item);
    });

    const productsList = Object.values(grouped);

    // Group original products in memory by folder
    const folderToOriginalProds = {};
    productsList.forEach(p => {
      if (!folderToOriginalProds[p.folder]) {
        folderToOriginalProds[p.folder] = [];
      }
      folderToOriginalProds[p.folder].push(p);
    });

    // We will collect the original products, fetch their current DB representation, and split images back.
    const folderToPopulatedProds = {};

    for (const folder of Object.keys(originalBlockSizes)) {
      const originalProds = folderToOriginalProds[folder];
      const blockSizes = originalBlockSizes[folder];
      
      // Fetch current database master products for this folder
      let dbProducts = [];
      if (folder.includes("Folder 1")) {
        dbProducts = await Product.find({ category: "Three Piece Half Sleeves Shirts" }).sort({ displayOrder: 1 });
      } else if (folder.includes("Folder 2")) {
        dbProducts = await Product.find({ category: "Half Sleeves Shirts" }).sort({ displayOrder: 1 });
      } else if (folder.includes("Folder 3")) {
        dbProducts = await Product.find({ category: "Kurtas" }).sort({ displayOrder: 1 });
      } else if (folder.includes("Folder 4")) {
        dbProducts = await Product.find({ category: "Short Kurtas", price: 590 }).sort({ displayOrder: 1 });
      } else if (folder.includes("Folder 5")) {
        dbProducts = await Product.find({ category: "Short Kurtas", price: 450 }).sort({ displayOrder: 1 });
      } else if (folder.includes("Folder 6")) {
        dbProducts = await Product.find({ category: "Suits" }).sort({ displayOrder: 1 });
      }

      console.log(`\nSplitting ${folder}: DB count = ${dbProducts.length}, blockSizes length = ${blockSizes.length}`);
      
      // Let's populate the images for the original products
      const populated = [];
      let runningIdx = 0;
      
      for (let i = 0; i < blockSizes.length; i++) {
        const size = blockSizes[i];
        const blockItems = originalProds.slice(runningIdx, runningIdx + size);
        runningIdx += size;
        
        const masterDBProduct = dbProducts[i];
        if (!masterDBProduct) {
          console.error(`Error: Missing master DB product for folder ${folder} at block ${i}`);
          continue;
        }

        const originalImages = [...masterDBProduct.images];
        let imgStartIdx = 0;
        
        for (let j = 0; j < blockItems.length; j++) {
          const item = blockItems[j];
          const count = item.files.length;
          
          let pImages = originalImages.slice(imgStartIdx, imgStartIdx + count);
          imgStartIdx += count;
          
          if (pImages.length === 0) {
            pImages = [originalImages[0] || '/images/placeholder.png'];
          }
          
          populated.push({
            ...item,
            images: pImages,
            image: pImages[0]
          });
        }
      }
      
      folderToPopulatedProds[folder] = populated;
      console.log(`  Successfully populated ${populated.length} original products for ${folder}`);
    }

    // Now we have all 135 products in folderToPopulatedProds!
    // Let's perform the correct merges and prepare the products to be inserted.
    const finalProductsToInsert = [];

    // Names index counters
    let topsNamesIdx = 0, gownNamesIdx = 0, kurta4NamesIdx = 0, kurta5NamesIdx = 0, suitNamesIdx = 0;
    
    function getNextName(folder) {
      if (folder.includes("Folder 1") || folder.includes("Folder 2")) {
        const base = topsNames[topsNamesIdx % topsNames.length];
        topsNamesIdx++;
        const suffix = Math.floor(topsNamesIdx / topsNames.length) > 0 ? ` (Design ${Math.floor(topsNamesIdx / topsNames.length) + 1})` : "";
        return base + suffix;
      } else if (folder.includes("Folder 3")) {
        const base = gownNames[gownNamesIdx % gownNames.length];
        gownNamesIdx++;
        const suffix = Math.floor(gownNamesIdx / gownNames.length) > 0 ? ` (Design ${Math.floor(gownNamesIdx / gownNames.length) + 1})` : "";
        return base + suffix;
      } else if (folder.includes("Folder 4")) {
        const base = kurtaSet4Names[kurta4NamesIdx % kurtaSet4Names.length];
        kurta4NamesIdx++;
        const suffix = Math.floor(kurta4NamesIdx / kurtaSet4Names.length) > 0 ? ` (Design ${Math.floor(kurta4NamesIdx / kurtaSet4Names.length) + 1})` : "";
        return base + suffix;
      } else if (folder.includes("Folder 5")) {
        const base = kurtaSet5Names[kurta5NamesIdx % kurtaSet5Names.length];
        kurta5NamesIdx++;
        const suffix = Math.floor(kurta5NamesIdx / kurtaSet5Names.length) > 0 ? ` (Design ${Math.floor(kurta5NamesIdx / kurtaSet5Names.length) + 1})` : "";
        return base + suffix;
      } else if (folder.includes("Folder 6")) {
        const base = suitNames[suitNamesIdx % suitNames.length];
        suitNamesIdx++;
        const suffix = Math.floor(suitNamesIdx / suitNames.length) > 0 ? ` (Design ${Math.floor(suitNamesIdx / suitNames.length) + 1})` : "";
        return base + suffix;
      }
      return "Beautiful Ethnic Wear";
    }

    for (const folder of Object.keys(folderToPopulatedProds)) {
      const populatedProds = folderToPopulatedProds[folder];
      const mergeGroups = correctMergeGroups[folder] || [];
      const config = folderConfig[folder];
      
      // Keep track of which indices are merged
      const mergedIndicesSet = new Set();
      mergeGroups.forEach(g => g.forEach(idx => mergedIndicesSet.add(idx)));
      if (folder.includes("Folder 1")) {
        mergedIndicesSet.add(24); // Skip Index 24 in Folder 1 as it is merged cross-folder
      }

      // Helper to merge images of a group
      const mergeGroupImages = (group) => {
        const imageUrlsSet = new Set();
        group.forEach(idx => {
          const item = populatedProds[idx];
          if (item.image) imageUrlsSet.add(item.image);
          if (item.images && Array.isArray(item.images)) {
            item.images.forEach(img => {
              if (img) imageUrlsSet.add(img);
            });
          }
        });
        return Array.from(imageUrlsSet);
      };

      console.log(`\nMerging ${folder}:`);
      
      // Process products sequentially
      for (let idx = 0; idx < populatedProds.length; idx++) {
        // Check if this index is part of a merge group
        let isMaster = false;
        let mergeGroup = null;
        
        for (const group of mergeGroups) {
          if (group[0] === idx) {
            isMaster = true;
            mergeGroup = group;
            break;
          }
        }
        
        const isDuplicate = mergedIndicesSet.has(idx) && !isMaster;
        
        if (isDuplicate) {
          // Skip, since it is merged into a master product
          continue;
        }

        const item = populatedProds[idx];
        let finalImages = item.images;
        
        if (isMaster) {
          finalImages = mergeGroupImages(mergeGroup);
          if (folder.includes("Folder 2") && mergeGroup[0] === 16) {
            // Also merge Folder 1 Index 24 images
            const f1Prods = folderToPopulatedProds["Folder 1(Three Piece Top)"];
            if (f1Prods && f1Prods[24]) {
              const f1Images = f1Prods[24].images || [f1Prods[24].image];
              f1Images.forEach(img => {
                if (img && !finalImages.includes(img)) {
                  finalImages.push(img);
                }
              });
            }
          }
          console.log(`  Merging group [${mergeGroup.join(', ')}] -> Kept "${item.baseName}", merged ${mergeGroup.length} products with ${finalImages.length} images`);
        } else {
          console.log(`  Kept single product "${item.baseName}" with ${finalImages.length} images`);
        }

        const rawBaseName = getNextName(folder);
        const seoName = getSeoName(rawBaseName, folder);

        finalProductsToInsert.push({
          user: adminId,
          name: seoName,
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
          images: finalImages,
          image: finalImages[0] || '/images/placeholder.png',
          soldOut: false,
          displayOrder: 0 // Will set later sequentially
        });
      }
    }

    // Set sequential displayOrder across all products
    finalProductsToInsert.forEach((p, idx) => {
      p.displayOrder = idx + 1;
    });

    console.log(`\nPrepared ${finalProductsToInsert.length} final unique products after deduplication.`);

    // 3. Clear existing Products from Database
    console.log("Clearing all products from database...");
    const deleteResult = await Product.deleteMany({});
    console.log(`Cleared ${deleteResult.deletedCount} products.`);

    // 4. Insert new products
    console.log("Inserting new unique products...");
    const createdProducts = await Product.insertMany(finalProductsToInsert);
    console.log(`Successfully inserted ${createdProducts.length} unique products!`);

    // Verify category counts
    const categories = ["Three Piece Half Sleeves Shirts", "Half Sleeves Shirts", "Kurtas", "Short Kurtas", "Suits"];
    console.log(`\n=== Verification ===`);
    for (const cat of categories) {
      let count = 0;
      if (cat === "Short Kurtas") {
        const count590 = await Product.countDocuments({ category: cat, price: 590 });
        const count450 = await Product.countDocuments({ category: cat, price: 450 });
        console.log(`Category "${cat}": 590 price = ${count590}, 450 price = ${count450}`);
      } else {
        count = await Product.countDocuments({ category: cat });
        console.log(`Category "${cat}": count = ${count}`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error("Critical Error during migration:", err);
    process.exit(1);
  }
};

run();
