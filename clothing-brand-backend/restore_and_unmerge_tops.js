"import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from './models/Product.js';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

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

let topsIdx = 0;
function getName(folder) {
  if (folder.includes("Folder 1") || folder.includes("Folder 2")) {
    const base = topsNames[topsIdx % topsNames.length];
    topsIdx++;
    const suffix = Math.floor(topsIdx / topsNames.length) > 0 ? ` (Design ${Math.floor(topsIdx / topsNames.length) + 1})` : "";
    return base + suffix;
  }
  return "Beautiful Ethnic Top";
}

const folderConfig = {
  "Folder 1(Three Piece Top)": {
    category: "Three Piece Half Sleeves Shirts",
    subcategory: "Daily Wear",
    pric
<truncated 9030 bytes>