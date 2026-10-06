import mongoose from 'mongoose';
import dotenv from 'dotenv';
import products from './data/products.js';
import users from './data/users.js';
import Product from './models/Product.js';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

// Seeding wipes every product and user. Never let it run against a live store by accident.
if (process.env.NODE_ENV === 'production' && !process.argv.includes('--force')) {
  console.error('Refusing to seed/destroy data with NODE_ENV=production. Re-run with --force if you really mean it.');
  process.exit(1);
}

connectDB();

const importData = async () => {
  try {
    await Product.deleteMany();
    await User.deleteMany();

    // Use admin credentials from .env if available
    const adminData = { ...users[0] };
    if (process.env.ADMIN_EMAIL) adminData.email = process.env.ADMIN_EMAIL;
    if (process.env.ADMIN_PASSWORD) adminData.password = process.env.ADMIN_PASSWORD;

    const usersToInsert = [...users];
    usersToInsert[0] = adminData;

    // create() (not insertMany) so the pre-save hook hashes the passwords.
    const createdUsers = await User.create(usersToInsert);
    const adminUser = createdUsers[0]._id;

    const sampleProducts = products.map((product) => {
      return { ...product, user: adminUser };
    });

    await Product.insertMany(sampleProducts);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Product.deleteMany();
    await User.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error with data destroy: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
