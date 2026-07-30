import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';

const getVerificationToken = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'linkverify_test_unique@example.com' });
    if (user) {
      console.log('---TOKEN_START---');
      console.log(user.verificationToken);
      console.log('---TOKEN_END---');
    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.connection.close();
  }
};

getVerificationToken();
