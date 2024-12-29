import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;

const categories = [
  { name: "SUV", code: "SUV", active: true },
  { name: "Sedan", code: "SEDAN", active: true },
  { name: "Hatchback", code: "HATCH", active: true },
  { name: "Coupe", code: "COUPE", active: true },
  { name: "Convertible", code: "CONV", active: true },
  { name: "Wagon", code: "WAGON", active: true },
  { name: "Van", code: "VAN", active: true },
  { name: "Truck", code: "TRUCK", active: true }
];

async function seedCategories() {
  let client;
  try {
    console.log("Connecting to MongoDB...");
    client = await MongoClient.connect(uri);
    console.log("Connected successfully");

    const db = client.db("carwebsite");
    console.log("Selected database:", db.databaseName);
    
    const collection = db.collection("categories");
    console.log("Selected collection: categories");

    // Create index
    console.log("Creating index...");
    await collection.createIndex({ code: 1 }, { unique: true });
    
    // Insert data
    console.log("Inserting categories...");
    const result = await collection.bulkWrite(
      categories.map(category => ({
        updateOne: {
          filter: { code: category.code },
          update: { $set: category },
          upsert: true
        }
      }))
    );
    
    console.log("Bulk write result:", result);
    console.log("Categories seeded successfully!");

    // Verify the data
    const count = await collection.countDocuments();
    console.log(`Number of documents in collection: ${count}`);
    
    const documents = await collection.find({}).toArray();
    console.log("Inserted documents:", documents);

  } catch (error) {
    console.error("Detailed error:", error);
  } finally {
    if (client) {
      console.log("Closing connection...");
      await client.close();
      console.log("Connection closed");
    }
  }
}

seedCategories(); 