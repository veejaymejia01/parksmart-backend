import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dns from 'dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

import User from '../models/User.js';
import ParkingLot from '../models/ParkingLot.js';
import Slot from '../models/Slot.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const loadJSON = async (filename) => {
  const data = await readFile(join(__dirname, 'data', filename), 'utf-8');
  return JSON.parse(data);
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    await User.deleteMany();
    await ParkingLot.deleteMany();
    await Slot.deleteMany();
    console.log('Cleared existing data');

    const usersData = await loadJSON('users.json');
    const lotsData = await loadJSON('lots.json');
    const slotsData = await loadJSON('slots.json');

    await User.create(usersData);
    console.log(`Seeded ${usersData.length} users`);

    await ParkingLot.insertMany(lotsData);
    console.log(`Seeded ${lotsData.length} parking lots`);

    await Slot.insertMany(slotsData);
    console.log(`Seeded ${slotsData.length} slots`);

    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();

