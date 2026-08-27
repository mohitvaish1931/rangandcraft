import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const driveContents = JSON.parse(fs.readFileSync(path.join(__dirname, '../drive_contents.json'), 'utf8'));

// Group files by folder and base timestamp
const grouped = {};
driveContents.forEach(item => {
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
console.log(`Total unique products from drive_contents: ${productsList.length}`);

// Count per folder
const folderCounts = {};
productsList.forEach(p => {
  folderCounts[p.folder] = (folderCounts[p.folder] || 0) + 1;
});

console.log('\nProducts per folder:');
Object.entries(folderCounts).forEach(([folder, count]) => {
  console.log(`  ${folder}: ${count} products`);
});

// Count total images
let totalImages = 0;
productsList.forEach(p => {
  totalImages += p.files.length;
});
console.log(`\nTotal images across all products: ${totalImages}`);

// Show image distribution
const imageCounts = {};
productsList.forEach(p => {
  const c = p.files.length;
  imageCounts[c] = (imageCounts[c] || 0) + 1;
});
console.log('\nImages per product distribution:');
Object.entries(imageCounts).sort((a, b) => Number(a[0]) - Number(b[0])).forEach(([count, numProducts]) => {
  console.log(`  ${count} image(s): ${numProducts} products`);
});

// Check local downloads
const uploadBase = path.join(__dirname, '../drive_downloads');
let existCount = 0;
let missingCount = 0;
const missingFiles = [];
driveContents.forEach(item => {
  if (item.path === 'Rate List For Kurtas.pdf') return;
  const localPath = path.join(uploadBase, ...item.path.split('/'));
  if (fs.existsSync(localPath)) {
    existCount++;
  } else {
    missingCount++;
    missingFiles.push(item.path);
  }
});
console.log(`\nLocal files: ${existCount} exist, ${missingCount} missing`);
if (missingCount > 0 && missingCount <= 10) {
  console.log('Missing files:');
  missingFiles.forEach(f => console.log(`  ${f}`));
}

// Also check current DB total images
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);
const allProducts = await Product.find().select('images');
let dbTotalImages = 0;
const allUrls = new Set();
allProducts.forEach(p => {
  if (p.images) {
    dbTotalImages += p.images.length;
    p.images.forEach(url => allUrls.add(url));
  }
});
console.log(`\nDB: ${allProducts.length} products, ${dbTotalImages} total image refs, ${allUrls.size} unique URLs`);
process.exit(0);
