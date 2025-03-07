/**
 * Script to validate JSON-LD structures across the site
 * Run with: node src/app/tools/validate-json-ld.js
 */

import fs from 'fs';
import path from 'path';
import { validateBasicJsonLd } from '../components/json-ld/utils/validateJsonLd.js';
import { generateVehicleJsonLd } from '../components/json-ld/JsonLd.jsx';

// Sample vehicle data for testing
const sampleVehicle = {
  name: "2015 Suzuki Carry",
  description: "Low mileage mini truck, perfect for small farms and businesses",
  model: "Carry",
  manufacturer: "Suzuki",
  category: "Kei Truck",
  engineType: "Gasoline",
  engineDisplacement: "660cc",
  fuelType: "Gasoline",
  mileage: 45000,
  modelYear: "2015",
  transmission: "Manual",
  color: "White",
  doors: 2,
  driveType: "4WD",
  price: 8995,
  images: [{ url: "https://example.com/image1.jpg", caption: "Front view" }]
};

// Test the JSON-LD generators
function testGenerators() {
  console.log("Testing vehicle JSON-LD generator...");
  
  try {
    const vehicleData = generateVehicleJsonLd(sampleVehicle);
    validateBasicJsonLd(vehicleData);
    console.log("✅ Vehicle JSON-LD generation passed validation");
    
    // Log the generated data for inspection
    console.log(JSON.stringify(vehicleData, null, 2));
  } catch (error) {
    console.error("❌ Vehicle JSON-LD validation failed:", error.message);
  }
}

// Validate all JSON-LD scripts in HTML pages
async function validateHtmlPages() {
  console.log("This function would scan your built pages for JSON-LD scripts");
  console.log("To implement this, you would need to:");
  console.log("1. Build your site with 'next build'");
  console.log("2. Extract JSON-LD scripts from the HTML");
  console.log("3. Validate each script against schema.org requirements");
}

// Main execution
console.log("JSON-LD Validation Tool");
console.log("======================");
console.log("Testing your JSON-LD generators and validators...");
console.log("");

testGenerators();

console.log("");
console.log("To run the full site validation:");
console.log("1. Build your site: npm run build");
console.log("2. Implement the validateHtmlPages() function");
console.log("");
console.log("For external validation, use Google's Rich Results Test:");
console.log("https://search.google.com/test/rich-results"); 