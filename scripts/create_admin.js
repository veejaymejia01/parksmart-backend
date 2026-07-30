import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not found in .env file');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    const userExists = await User.findOne({ email: 'apppersonaltesting@gmail.com' });
    if (userExists) {
      userExists.role = 'superadmin';
      userExists.isVerified = true;
      userExists.isActive = true;
      userExists.password = 'Apptesting123!@#';
      await userExists.save();
      console.log('✅ Existing user promoted to verified superadmin');
      process.exit(0);
    }

    const admin = await User.create({
      name: 'App Tester',
      email: 'apppersonaltesting@gmail.com',
      password: 'Apptesting123!@#',
      phone: '09000000000',
      role: 'superadmin',
      isActive: true,
      isVerified: true
    });

    console.log('✅ Admin created successfully:', admin.email);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
