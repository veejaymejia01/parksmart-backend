import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

const verifyUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'apppersonaltesting@gmail.com' });
    if (user) {
      user.isVerified = true;
      user.isActive = true;
      user.role = 'superadmin';
      user.password = 'Apptesting123!@#'; // Make sure password is correct
      await user.save();
      console.log('✅ User apppersonaltesting@gmail.com has been successfully verified and promoted to superadmin!');
    } else {
      // Create new superadmin
      await User.create({
        name: 'App Tester',
        email: 'apppersonaltesting@gmail.com',
        password: 'Apptesting123!@#',
        phone: '09000000000',
        role: 'superadmin',
        isActive: true,
        isVerified: true
      });
      console.log('✅ Superadmin apppersonaltesting@gmail.com created successfully!');
    }
  } catch (error) {
    console.error('❌ Error verifying user:', error.message);
  } finally {
    await mongoose.connection.close();
  }
};

verifyUser();
