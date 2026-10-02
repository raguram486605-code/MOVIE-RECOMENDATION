import 'dotenv/config';
import { connectDB } from './db.js';
import { seedInitialData } from './seedData.js';
import mongoose from 'mongoose';

await connectDB();
await seedInitialData(true);
console.log('Seeding finished successfully.');
process.exit(0);
