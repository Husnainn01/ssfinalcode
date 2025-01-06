import mongoose from 'mongoose';

export const runtime = 'nodejs';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

// Initialize cached for both Node.js and Edge Runtime environments
let cached = (typeof global !== 'undefined' ? global : {}).mongoose;

if (!cached) {
  cached = (typeof global !== 'undefined' ? global : {}).mongoose = { 
    conn: null, 
    promise: null 
  };
}

async function dbConnect() {
  try {
    if (cached.conn) {
      console.log('Using cached database connection');
      return cached.conn;
    }

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      console.log('Creating new database connection...');
      
      // Test the connection before caching
      const testConnection = await mongoose.connect(MONGODB_URI, opts);
      
      // Verify connection
      await testConnection.connection.db.admin().ping();
      console.log('Database ping successful');

      cached.promise = Promise.resolve(testConnection);
    }

    cached.conn = await cached.promise;
    console.log('Database connection established successfully');
    
    // Log connection status
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    console.log('Connection state:', states[state]);

    return cached.conn;
  } catch (error) {
    console.error('Database connection error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      state: mongoose.connection?.readyState
    });

    // Reset the promise if connection failed
    cached.promise = null;
    throw error;
  }
}

// Only add event listeners if we're in a Node.js environment
if (typeof process !== 'undefined' && process.on) {
  // Add connection event listeners
  if (mongoose.connection) {
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      if (mongoose.connection) {
        await mongoose.connection.close();
      }
      process.exit(0);
    });
  }
}

export default dbConnect;