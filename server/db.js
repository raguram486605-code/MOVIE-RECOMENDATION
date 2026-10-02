import mongoose from 'mongoose';
import { seedInitialData } from './seedData.js';

export async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/movie_recs';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
    console.log('Connected to MongoDB at:', uri);
    await seedInitialData(false);
  } catch (err) {
    console.warn('Local MongoDB unavailable (' + err.message + '). Fallback to in-memory MongoDB...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create({
        instance: { dbName: 'movie_recs' },
        binary: { version: '7.0.14' }
      });
      const memUri = mongoServer.getUri();
      await mongoose.connect(memUri);
      console.log('Connected to In-Memory MongoDB at:', memUri);
      await seedInitialData(false);
    } catch (memErr) {
      console.error('Failed to start in-memory MongoDB:', memErr.message);
      throw memErr;
    }
  }
}
