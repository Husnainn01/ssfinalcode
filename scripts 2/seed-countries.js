import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config();

// Use the MongoDB URI from your .env file
const uri = process.env.MONGODB_URI;

const countries = [
  { name: "United States", code: "US" },
  { name: "United Kingdom", code: "GB" },
  { name: "Canada", code: "CA" },
  { name: "Australia", code: "AU" },
  { name: "Germany", code: "DE" },
  { name: "France", code: "FR" },
  { name: "Italy", code: "IT" },
  { name: "Spain", code: "ES" },
  { name: "Japan", code: "JP" },
  { name: "China", code: "CN" },
  { name: "India", code: "IN" },
  { name: "Brazil", code: "BR" },
  { name: "Mexico", code: "MX" },
  { name: "South Korea", code: "KR" },
  { name: "Russia", code: "RU" },
  { name: "Netherlands", code: "NL" },
  { name: "Switzerland", code: "CH" },
  { name: "Sweden", code: "SE" },
  { name: "Norway", code: "NO" },
  { name: "Denmark", code: "DK" },
  { name: "Finland", code: "FI" },
  { name: "Greece", code: "GR" },
  { name: "Portugal", code: "PT" },
  { name: "Austria", code: "AT" },
  { name: "Belgium", code: "BE" },
  { name: "Czech Republic", code: "CZ" },
  { name: "Hungary", code: "HU" },
  { name: "Ireland", code: "IE" },
  { name: "Malta", code: "MT" },
  { name: "Poland", code: "PL" },
  { name: "Romania", code: "RO" },
  { name: "Slovakia", code: "SK" },
  { name: "Slovenia", code: "SI" },
  { name: "Turkey", code: "TR" },
  { name: "Ukraine", code: "UA" },
  { name: "Belarus", code: "BY" },
  { name: "Bosnia and Herzegovina", code: "BA" },
  { name: "Croatia", code: "HR" },
  { name: "Kosovo", code: "XK" },
  { name: "Montenegro", code: "ME" },
  { name: "North Macedonia", code: "MK" },
  { name: "Serbia", code: "RS" },
  { name: "Slovenia", code: "SI" },
  { name: "Bosnia and Herzegovina", code: "BA" },
];

async function seedCountries() {
  if (!uri) {
    console.error("MongoDB URI is not defined in environment variables");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB...");
    const client = await MongoClient.connect(uri);
    const db = client.db("carwebsite01"); // Changed to match your database name
    
    console.log("Creating index...");
    await db.collection("countries").createIndex({ code: 1 }, { unique: true });
    
    console.log("Inserting countries...");
    const result = await db.collection("countries").bulkWrite(
      countries.map(country => ({
        updateOne: {
          filter: { code: country.code },
          update: { $set: country },
          upsert: true
        }
      }))
    );
    
    console.log("Countries seeded successfully!");
    await client.close();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding countries:", error);
    console.error("Error details:", error.message);
    process.exit(1);
  }
}

seedCountries(); 