import mongoose from 'mongoose';

export async function connectDB(uri: string): Promise<typeof mongoose> {
  try {
    const conn = await mongoose.connect(uri);
    console.log(`[db] Connected to MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('[db] Error connecting to MongoDB:', error);
    throw error;
  }
}

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
