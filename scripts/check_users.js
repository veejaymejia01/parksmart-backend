import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({}, 'name email role isVerified isActive verificationToken otp');
    console.log('--- USERS IN DATABASE ---');
    console.log(JSON.stringify(users, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.connection.close();
  }
};

checkUsers();
