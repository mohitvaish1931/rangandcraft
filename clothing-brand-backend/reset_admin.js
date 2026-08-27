import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB!');

    const newPassword = process.env.ADMIN_PASSWORD || 'mohitl@1931';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Use findOneAndUpdate to bypass the pre-save hook
    const result = await User.findOneAndUpdate(
      { email: 'admin@rangandcraft.store' },
      { 
        $set: { 
          password: hashedPassword, 
          isAdmin: true 
        } 
      },
      { new: true }
    );

    if (!result) {
      console.log('Admin not found, creating...');
      // Use insertOne directly to bypass pre-save hook
      await User.collection.insertOne({
        name: 'Admin',
        email: 'admin@rangandcraft.store',
        password: hashedPassword,
        isAdmin: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('✅ Admin user created!');
    } else {
      console.log(`✅ Admin password reset for: ${result.email}`);
    }

    // Verify
    const verifyUser = await User.findOne({ email: 'admin@rangandcraft.store' });
    const isMatch = await bcrypt.compare(newPassword, verifyUser.password);
    console.log(`Login verification: ${isMatch ? '✅ Password matches!' : '❌ Password does NOT match!'}`);
    console.log(`\nCredentials:`);
    console.log(`  Email:    admin@rangandcraft.store`);
    console.log(`  Password: ${newPassword}`);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

resetAdmin();
