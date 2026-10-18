import mongoose from 'mongoose';

export async function connectDB(uri: string): Promise<typeof mongoose> {
  let cleanUri = (uri || '').trim();
  // Strip quotes if the connection string was pasted with quotes in cloud dashboards
  cleanUri = cleanUri.replace(/^['"]+|['"]+$/g, '').trim();

  // If the user pasted the entire variable declaration "MONGODB_URI=..."
  if (cleanUri.startsWith('MONGODB_URI=')) {
    cleanUri = cleanUri.replace(/^MONGODB_URI=/, '').trim().replace(/^['"]+|['"]+$/g, '');
  }

  // Normalize common typo where colon is omitted
  if (cleanUri.startsWith('mongodb+srv//')) {
    cleanUri = cleanUri.replace('mongodb+srv//', 'mongodb+srv://');
  } else if (cleanUri.startsWith('mongodb//')) {
    cleanUri = cleanUri.replace('mongodb//', 'mongodb://');
  }

  // If host only was provided (e.g. cluster0.abcde.mongodb.net/kagazai)
  if (cleanUri && !cleanUri.startsWith('mongodb://') && !cleanUri.startsWith('mongodb+srv://')) {
    if (cleanUri.includes('mongodb.net')) {
      cleanUri = `mongodb+srv://${cleanUri}`;
    }
  }

  if (!cleanUri || (!cleanUri.startsWith('mongodb://') && !cleanUri.startsWith('mongodb+srv://'))) {
    console.error(
      `[db] Invalid MONGODB_URI scheme. Expected connection string to start with "mongodb://" or "mongodb+srv://", but received: "${cleanUri}". Please set a valid MONGODB_URI in your Render environment variables.`
    );
    throw new Error('Invalid scheme: expected connection string to start with "mongodb://" or "mongodb+srv://"');
  }

  try {
    const conn = await mongoose.connect(cleanUri);
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
