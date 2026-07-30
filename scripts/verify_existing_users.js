import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const verifyExistingUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    const result = await User.updateMany(
      { isVerified: { $ne: true } },
      { $set: { isVerified: true } }
    );

    console.log(`✅ Updated ${result.modifiedCount} users to verified status.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating users:', error.message);
    process.exit(1);
  }
};

verifyExistingUsers();
