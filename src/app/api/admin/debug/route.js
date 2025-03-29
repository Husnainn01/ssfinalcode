import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    await dbConnect();
    
    // Get all registered models
    const modelNames = Object.keys(mongoose.models);
    const modelDetails = modelNames.map(name => {
      const model = mongoose.models[name];
      return {
        name,
        collection: model.collection.name,
        modelName: model.modelName,
        hasSchema: !!model.schema
      };
    });
    
    // Get collection names from the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Check connection status
    const connectionState = mongoose.connection.readyState;
    const connectionStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    return NextResponse.json({
      success: true,
      dbConnection: {
        state: connectionStates[connectionState] || 'unknown',
        host: mongoose.connection.host,
        name: mongoose.connection.name
      },
      models: modelDetails,
      collections: collectionNames,
      environment: {
        nodeEnv: process.env.NODE_ENV || 'not set',
        nextEnv: process.env.NEXT_PUBLIC_ENV || 'not set'
      }
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    }, { status: 500 });
  }
} 