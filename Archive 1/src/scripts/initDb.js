import * as dotenv from 'dotenv';
dotenv.config();

import dbConnect from '../lib/dbConnect.js';
import CustomerUser from '../lib/CustomerUser.js';
import mongoose from 'mongoose';

async function initializeDatabase() {
  try {
    await dbConnect();
    console.log('Connected to MongoDB');

    // Get database reference and log the name
    const db = mongoose.connection.db;
    console.log('Current database:', db.databaseName);

    // Check if collection exists
    const collections = await db.listCollections().toArray();
    console.log('Existing collections:', collections.map(col => col.name));

    const collectionExists = collections.some(col => col.name === 'customerusers');

    if (!collectionExists) {
      console.log('Creating CustomerUser collection...');
      
      // Create collection with validation
      await db.createCollection('customerusers', {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["name", "email", "password"],
            properties: {
              name: {
                bsonType: "string",
                description: "must be a string and is required"
              },
              lastName: {
                bsonType: "string",
                description: "must be a string and is required"
              },
              email: {
                bsonType: "string",
                pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
                description: "must be a valid email address and is required"
              },
              password: {
                bsonType: "string",
                description: "must be a string and is required"
              }
            }
          }
        }
      });

      // Verify collection was created
      const newCollections = await db.listCollections().toArray();
      console.log('Collections after creation:', newCollections.map(col => col.name));

      // Create indexes
      const customerCollection = db.collection('customerusers');
      await customerCollection.createIndex({ email: 1 }, { unique: true });
      
      console.log('CustomerUser collection and indexes created successfully');
    }

    // Create a test user to verify
    const testEmail = 'test@example.com';
    const testUser = new CustomerUser({
      name: 'Test User',
      lastName: 'Test Last',
      email: testEmail,
      emailConfirmation: testEmail,
      password: 'password123',
      phoneNumber: {
        number: '1234567890',
        countryCode: '+44'
      },
      address: {
        postCode: 'SW1A 1AA',
        country: 'United Kingdom',
        port: 'London'
      }
    });

    try {
      await testUser.save();
      console.log('Test user created successfully');

      // Verify the data
      const users = await CustomerUser.find();
      console.log('Users in database:', users.length);
      console.log('First user:', users[0]?.email);

    } catch (error) {
      if (error.code === 11000) {
        console.log('Test user already exists');
        const users = await CustomerUser.find();
        console.log('Existing users:', users.length);
      } else {
        console.error('Error creating test user:', error);
        // Log the full error details
        console.log('Validation errors:', JSON.stringify(error.errors, null, 2));
      }
    }

  } catch (error) {
    console.error('Database initialization error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the initialization
initializeDatabase(); 