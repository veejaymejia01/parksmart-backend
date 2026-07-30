import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dns from 'dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

import User from '../models/User.js';
import ParkingLot from '../models/ParkingLot.js';
import Slot from '../models/Slot.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const loadJSON = async (filename) => {
  const data = await readFile(join(__dirname, '..', 'seed', 'data', filename), 'utf-8');
  return JSON.parse(data);
};

const seedInMemoryDB = async () => {
  try {
    const usersData = await loadJSON('users.json');
    const lotsData = await loadJSON('lots.json');
    const slotsData = await loadJSON('slots.json');

    await User.create(usersData);
    await ParkingLot.insertMany(lotsData);
    await Slot.insertMany(slotsData);
    console.log('✅ In-memory Database seeded successfully');
  } catch (error) {
    console.error('❌ In-memory Seeding failed:', error.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`⚠️ Local MongoDB connection failed: ${error.message}`);
    console.log(`🚀 Starting MongoMemoryServer...`);
    try {
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`✅ In-memory MongoDB Connected: ${conn.connection.host}`);
      await seedInMemoryDB();
    } catch (memError) {
      console.error(`❌ MongoMemoryServer Error: ${memError.message}`);
      process.exit(1);
    }
  }
};

export default connectDB;

