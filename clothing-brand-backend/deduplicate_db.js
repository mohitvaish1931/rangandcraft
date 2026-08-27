import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const groupSizes = {
  "Half Sleeves Shirts": [4, 2, 1, 2, 2, 1, 3, 2, 1, 2, 1, 1, 3, 3, 1, 1, 1, 3, 1, 1, 1, 2, 2, 2, 1, 2],
  "Kurtas": [4, 2, 3, 3, 4],
  "Suits": [2, 2, 2, 4, 1, 1, 1, 1],
  "Short Kurtas 590": [6, 2, 5, 2, 2, 4, 2, 3],
  "Short Kurtas 450": [2, 3, 1, 1, 3, 2, 3, 2, 1, 2, 2, 1, 2, 1, 4, 1, 1, 1]
};

const run = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB!");

    // Fetch all products
    const allProducts = await Product.find({});
    console.log(`Total products initially in DB: ${allProducts.length}`);

    let totalDeleted = 0;
    let totalUpdated = 0;

    // Process Half Sleeves Shirts (Folder 1 & 2)
    const tops = allProducts.filter(p => p.category === "Half Sleeves Shirts");
    tops.sort((a, b) => a.displayOrder - b.displayOrder);
    await processCategoryBlocks("Half Sleeves Shirts", tops, groupSizes["Half Sleeves Shirts"]);

    // Process Kurtas (Folder 3)
    const kurtas = allProducts.filter(p => p.category === "Kurtas");
    kurtas.sort((a, b) => a.displayOrder - b.displayOrder);
    await processCategoryBlocks("Kurtas", kurtas, groupSizes["Kurtas"]);

    // Process Suits (Folder 6)
    const suits = allProducts.filter(p => p.category === "Suits");
    suits.sort((a, b) => a.displayOrder - b.displayOrder);
    await processCategoryBlocks("Suits", suits, groupSizes["Suits"]);

    // Process Short Kurtas 590 (Folder 4)
    const shortKurtas590 = allProducts.filter(p => p.category === "Short Kurtas" && p.price === 590);
    shortKurtas590.sort((a, b) => a.displayOrder - b.displayOrder);
    await processCategoryBlocks("Short Kurtas 590", shortKurtas590, groupSizes["Short Kurtas 590"]);

    // Process Short Kurtas 450 (Folder 5)
    const shortKurtas450 = allProducts.filter(p => p.category === "Short Kurtas" && p.price === 450);
    shortKurtas450.sort((a, b) => a.displayOrder - b.displayOrder);
    await processCategoryBlocks("Short Kurtas 450", shortKurtas450, groupSizes["Short Kurtas 450"]);

    async function processCategoryBlocks(label, items, blocks) {
      const sum = blocks.reduce((a, b) => a + b, 0);
      if (items.length !== sum) {
        console.error(`Error for ${label}: DB item count (${items.length}) does not match sum of blocks (${sum})`);
        return;
      }

      console.log(`\nProcessing ${label} (${items.length} products into ${blocks.length} groups)...`);
      let itemIdx = 0;

      for (let gIdx = 0; gIdx < blocks.length; gIdx++) {
        const blockSize = blocks[gIdx];
        const blockItems = items.slice(itemIdx, itemIdx + blockSize);
        itemIdx += blockSize;

        const master = blockItems[0];
        const duplicates = blockItems.slice(1);

        // Merge images
        const imageUrlsSet = new Set();
        blockItems.forEach(item => {
          if (item.image) imageUrlsSet.add(item.image);
          if (item.images && Array.isArray(item.images)) {
            item.images.forEach(img => {
              if (img) imageUrlsSet.add(img);
            });
          }
        });
        const mergedImages = Array.from(imageUrlsSet);

        // Update master
        master.images = mergedImages;
        await master.save();
        totalUpdated++;

        // Delete duplicates
        if (duplicates.length > 0) {
          const dupIds = duplicates.map(d => d._id);
          const deleteResult = await Product.deleteMany({ _id: { $in: dupIds } });
          totalDeleted += deleteResult.deletedCount;
          console.log(`  Group ${gIdx + 1}: Kept "${master.name}", merged ${duplicates.length} duplicates and deleted them.`);
        } else {
          console.log(`  Group ${gIdx + 1}: Kept "${master.name}" (no duplicates).`);
        }
      }
    }

    const finalCount = await Product.countDocuments();
    console.log(`\n=== Deduplication Finished ===`);
    console.log(`Total Master Products Updated: ${totalUpdated}`);
    console.log(`Total Duplicate Products Deleted: ${totalDeleted}`);
    console.log(`Total Products Remaining in DB: ${finalCount}`);

    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

run();
