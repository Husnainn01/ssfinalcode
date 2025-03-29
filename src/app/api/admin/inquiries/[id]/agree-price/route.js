import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { ObjectId } from 'mongodb';
import nodemailer from 'nodemailer';
import { connectDB } from '@/lib/mongodb';
import Inquiry from '@/models/Inquiry';
import AgreedVehicle from '@/models/AgreedVehicle';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import Vehicle from '@/models/Vehicle';
import { verifyAuth } from '@/lib/auth';

// Use the same secret that's used in middleware.js for admin authentication
const SECRET_KEY = new TextEncoder().encode('chendanvasu');

// Configure nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function POST(request, { params }) {
  try {
    // Auth verification
    const cookieStore = cookies();
    const token = cookieStore.get('admin_token')?.value;
    
    if (!token) {
      return Response.json({
        success: false,
        message: 'Unauthorized - No token found'
      }, { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      
      if (!payload || !['admin', 'editor', 'moderator'].includes(payload.role)) {
        return Response.json({
          success: false,
          message: 'Admin privileges required'
        }, { status: 403 });
      }
    } catch (authError) {
      console.error('Token verification error:', authError);
      return Response.json({
        success: false,
        message: 'Invalid token'
      }, { status: 401 });
    }
    
    const inquiryId = params.id;
    console.log('Looking for inquiry with ID:', inquiryId);
    
    const data = await request.json();
    const { agreedPrice } = data;
    
    if (!agreedPrice || isNaN(agreedPrice)) {
      return Response.json({ success: false, message: 'Valid agreed price is required' }, { status: 400 });
    }
    
    // Try to connect with both methods
    try {
      await dbConnect();
      console.log('Connected with dbConnect');
    } catch (err) {
      console.error('dbConnect failed:', err);
      try {
        await connectDB();
        console.log('Connected with connectDB');
      } catch (err2) {
        console.error('connectDB also failed:', err2);
        return Response.json({ success: false, message: 'Database connection failed' }, { status: 500 });
      }
    }
    
    // Get MongoDB connection and list all collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('All collections in database:', collections.map(c => c.name));
    
    // Try to find the inquiry in ALL collections to see where it might be
    let inquiry = null;
    let foundInCollection = null;
    
    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`Checking collection: ${collectionName}`);
      
      try {
        // Try string ID
        const result = await db.collection(collectionName).findOne({ _id: inquiryId });
        if (result) {
          inquiry = result;
          foundInCollection = collectionName;
          console.log(`Found inquiry in collection: ${collectionName} with string ID`);
          break;
        }
        
        // Try ObjectId if valid
        if (mongoose.Types.ObjectId.isValid(inquiryId)) {
          const objIdResult = await db.collection(collectionName).findOne({ 
            _id: new mongoose.Types.ObjectId(inquiryId) 
          });
          if (objIdResult) {
            inquiry = objIdResult;
            foundInCollection = collectionName;
            console.log(`Found inquiry in collection: ${collectionName} with ObjectId`);
            break;
          }
        }
        
        // Try inquiryId field
        const inquiryIdResult = await db.collection(collectionName).findOne({ inquiryId: inquiryId });
        if (inquiryIdResult) {
          inquiry = inquiryIdResult;
          foundInCollection = collectionName;
          console.log(`Found inquiry in collection: ${collectionName} with inquiryId field`);
          break;
        }
      } catch (err) {
        console.error(`Error checking collection ${collectionName}:`, err);
      }
    }
    
    if (!inquiry) {
      return Response.json({ 
        success: false, 
        message: 'Inquiry not found in any collection',
        debug: {
          inquiryId,
          collections: collections.map(c => c.name)
        }
      }, { status: 404 });
    }
    
    console.log(`Found inquiry in collection: ${foundInCollection}`);
    console.log('Inquiry: ', {
      _id: inquiry._id,
      status: inquiry.status,
      subject: inquiry.subject
    });
    
    // Try to create a vehicle
    try {
      // Generate a stock number if needed
      const stockNumber = `AG${Date.now().toString().slice(-6)}`;
      
      // Extract car details from the inquiry
      let carDetails = inquiry.carDetails || {};
      
      // If it's a string, try to parse it
      if (typeof carDetails === 'string') {
        try {
          carDetails = JSON.parse(carDetails);
        } catch (e) {
          console.error('Error parsing carDetails:', e);
          carDetails = {};
        }
      }
      
      console.log('Original car details:', carDetails);
      
      // Try to find the original vehicle - THIS IS THE KEY CHANGE
      let originalVehicle = null;
      
      // First try to find in the CarListing collection
      if (carDetails.id) {
        console.log('Looking for original vehicle by ID in CarListing:', carDetails.id);
        try {
          // Use direct collection access since we may not have a model
          originalVehicle = await mongoose.connection.db.collection('CarListing').findOne({
            _id: mongoose.Types.ObjectId.isValid(carDetails.id) ? 
              new mongoose.Types.ObjectId(carDetails.id) : carDetails.id
          });
          
          if (originalVehicle) {
            console.log('Found vehicle in CarListing collection');
            
            // Log more detailed fields to see what's available
            console.log('Original vehicle fields:', Object.keys(originalVehicle));
            
            // Log a sample of important fields
            console.log('Original vehicle details:', {
              _id: originalVehicle._id,
              make: originalVehicle.make,
              model: originalVehicle.model,
              title: originalVehicle.title,
              price: originalVehicle.price,
              bodyType: originalVehicle.bodyType,
              color: originalVehicle.color,
              fuelType: originalVehicle.fuelType,
              mileage: originalVehicle.mileage
            });
          }
        } catch (err) {
          console.error('Error finding vehicle in CarListing by ID:', err);
        }
      }
      
      // If not found, try stock number in CarListing
      if (!originalVehicle && (carDetails.stockNo || carDetails.stockNumber)) {
        const stockNo = carDetails.stockNo || carDetails.stockNumber;
        console.log('Looking for original vehicle by stock number in CarListing:', stockNo);
        
        try {
          originalVehicle = await mongoose.connection.db.collection('CarListing').findOne({ 
            $or: [
              { stockNumber: stockNo },
              { stockNo: stockNo }
            ]
          });
          
          if (originalVehicle) {
            console.log('Found vehicle in CarListing by stock number');
          }
        } catch (err) {
          console.error('Error finding vehicle in CarListing by stock number:', err);
        }
      }
      
      // If still not found, try by make, model, year
      if (!originalVehicle && carDetails.make && carDetails.model) {
        console.log('Looking for vehicle by make/model in CarListing:', carDetails.make, carDetails.model);
        
        try {
          originalVehicle = await mongoose.connection.db.collection('CarListing').findOne({
            make: carDetails.make,
            model: { $regex: new RegExp(carDetails.model, 'i') },
            year: carDetails.year
          });
          
          if (originalVehicle) {
            console.log('Found vehicle in CarListing by make/model/year');
          }
        } catch (err) {
          console.error('Error finding vehicle in CarListing by make/model:', err);
        }
      }
      
      // As a last resort, try the vehicles collection (just in case)
      if (!originalVehicle && carDetails.id) {
        console.log('Trying vehicles collection as a fallback...');
        try {
          originalVehicle = await Vehicle.findById(carDetails.id).lean();
        } catch (err) {
          console.error('Error finding in vehicles collection:', err);
        }
      }
      
      console.log('Found original vehicle:', originalVehicle ? 'Yes' : 'No');
      if (originalVehicle) {
        console.log('Original vehicle details:', {
          _id: originalVehicle._id,
          make: originalVehicle.make,
          model: originalVehicle.model,
          title: originalVehicle.title,
          price: originalVehicle.price
        });
      }
      
      // Process the image data
      let processedImages = [];
      
      // Handle images from original vehicle
      if (originalVehicle && originalVehicle.images) {
        if (Array.isArray(originalVehicle.images)) {
          processedImages = originalVehicle.images.map(img => {
            // If already in correct format
            if (typeof img === 'object' && img.image) {
              return img;
            }
            // If just a string URL
            if (typeof img === 'string') {
              return { image: img };
            }
            return null;
          }).filter(Boolean); // Remove any nulls
        }
      } 
      // Handle image from car details
      else if (carDetails.images) {
        if (Array.isArray(carDetails.images)) {
          processedImages = carDetails.images.map(img => {
            if (typeof img === 'object' && img.image) {
              return img;
            }
            if (typeof img === 'string') {
              return { image: img };
            }
            return null;
          }).filter(Boolean);
        } else if (typeof carDetails.images === 'string') {
          processedImages = [{ image: carDetails.images }];
        }
      }
      
      console.log('Processed images:', processedImages);
      
      // Create vehicle data object using the EXACT field names from your database
      const vehicleData = {
        // Main information - grab ALL fields from original vehicle if available
        title: originalVehicle?.title || `${carDetails.make || 'Unknown'} ${carDetails.model || 'Unknown'}`,
        price: originalVehicle?.price || carDetails.price || 0,
        agreedPrice: parseFloat(agreedPrice),
        priceCurrency: originalVehicle?.priceCurrency || "USD",
        make: originalVehicle?.make || carDetails.make || "Unknown",
        model: originalVehicle?.model || carDetails.model || "Unknown",
        year: originalVehicle?.year || carDetails.year || new Date().getFullYear(),
        
        // Specifications - use originalVehicle fields first
        mileage: originalVehicle?.mileage || carDetails.mileage || "0",
        mileageUnit: originalVehicle?.mileageUnit || "KM",
        itemCondition: originalVehicle?.itemCondition || "New",
        availability: originalVehicle?.availability || "InStock",
        vin: originalVehicle?.vin || carDetails.vin || "",
        bodyType: originalVehicle?.bodyType || carDetails.bodyType || "",
        color: originalVehicle?.color || carDetails.color || "",
        driveWheelConfiguration: originalVehicle?.driveWheelConfiguration || "",
        numberOfDoors: originalVehicle?.numberOfDoors || "",
        fuelType: originalVehicle?.fuelType || carDetails.fuelType || "",
        vehicleEngine: originalVehicle?.vehicleEngine || originalVehicle?.engine || "",
        vehicleSeatingCapacity: originalVehicle?.vehicleSeatingCapacity || "",
        vehicleTransmission: originalVehicle?.vehicleTransmission || originalVehicle?.transmission || "",
        cylinders: originalVehicle?.cylinders || "",
        
        // Features and safety
        carFeature: originalVehicle?.carFeature || [],
        carSafetyFeature: originalVehicle?.carSafetyFeature || [],
        
        // Images - already processed
        images: processedImages,
        
        // Stock information
        stockNumber: originalVehicle?.stockNumber || originalVehicle?.stockNo || carDetails.stockNo || stockNumber,
        status: "processing",
        
        // Location and category
        country: originalVehicle?.country || "",
        category: originalVehicle?.category || "",
        section: originalVehicle?.section || "",
        offerType: originalVehicle?.offerType || "Sale",
        
        // Inquiry and customer data
        inquiryId: inquiry._id.toString(),
        customerId: inquiry.userId || inquiry.customerId,
        
        // Agreement details
        estimatedDelivery: data.estimatedDelivery ? new Date(data.estimatedDelivery) : null,
        dateAgreed: new Date(),
        agreementNotes: data.notes || null,
        
        // Timestamps
        createdAt: new Date(),
        updatedAt: new Date(),
        
        // Generate slug from title
        slug: (originalVehicle?.title || `${carDetails.make || 'Unknown'} ${carDetails.model || 'Unknown'}`)
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '')
      };
      
      console.log('Creating AgreedVehicle with data:', {
        title: vehicleData.title,
        make: vehicleData.make,
        model: vehicleData.model,
        price: vehicleData.price,
        agreedPrice: vehicleData.agreedPrice,
        stockNumber: vehicleData.stockNumber,
        imageCount: vehicleData.images.length
      });
      
      // Try a direct insert first since there's been issue with the model
      try {
        console.log('Attempting direct insert with fields:', Object.keys(vehicleData));
        
        const vehicleDoc = {
          ...vehicleData,
          _id: new mongoose.Types.ObjectId(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const insertResult = await mongoose.connection.db.collection('agreedvehicles').insertOne(vehicleDoc);
        console.log('Inserted directly to collection with result:', insertResult);
        
        // Get the inserted vehicle
        const directlyInsertedVehicle = await mongoose.connection.db.collection('agreedvehicles').findOne({ _id: insertResult.insertedId });
        
        // Update the inquiry with this vehicle ID
        await db.collection(foundInCollection).updateOne(
          { _id: inquiry._id },
          { 
            $set: { 
              vehicleId: insertResult.insertedId,
              status: 'agreed',
              agreedPrice: parseFloat(agreedPrice),
              dateAgreed: new Date(),
              updatedAt: new Date()
            } 
          }
        );
        
        // Get the updated inquiry
        const updatedInquiry = await db.collection(foundInCollection).findOne({ _id: inquiry._id });
        
        return Response.json({
          success: true,
          message: 'Price agreement saved successfully. Vehicle created via direct insertion.',
          inquiry: updatedInquiry,
          vehicle: directlyInsertedVehicle
        });
      } catch (directInsertError) {
        console.error('Error with direct insert:', directInsertError);
        
        // Fall back to using the model
        try {
          // Create and save the AgreedVehicle
          const newVehicle = new AgreedVehicle(vehicleData);
          const savedVehicle = await newVehicle.save();
          console.log('AgreedVehicle saved with ID:', savedVehicle._id);
          
          // Update the inquiry with the vehicle ID and set status to 'agreed'
          await db.collection(foundInCollection).updateOne(
            { _id: inquiry._id },
            { 
              $set: { 
                vehicleId: savedVehicle._id,
                status: 'agreed',
                agreedPrice: parseFloat(agreedPrice),
                dateAgreed: new Date(),
                updatedAt: new Date()
              } 
            }
          );
          
          // Get the updated inquiry
          const updatedInquiry = await db.collection(foundInCollection).findOne({ _id: inquiry._id });
          
          return Response.json({
            success: true,
            message: 'Price agreement saved successfully. Vehicle created.',
            inquiry: updatedInquiry,
            vehicle: savedVehicle
          });
        } catch (modelError) {
          console.error("Error creating AgreedVehicle with model:", modelError);
          return Response.json({
            success: false,
            message: 'Failed to create vehicle: ' + modelError.message,
            error: modelError.stack
          }, { status: 500 });
        }
      }
    } catch (vehicleError) {
      console.error("Error in vehicle creation process:", vehicleError);
      return Response.json({
        success: false,
        message: 'Error creating vehicle: ' + vehicleError.message,
        error: vehicleError.stack
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error("Error in agree-price:", error);
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
} 