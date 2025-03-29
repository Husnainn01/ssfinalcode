import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// Function to get potential secret keys
const getSecretKeys = () => {
  const keys = [];
  
  // Add the environment variable key if it exists
  if (process.env.JWT_SECRET) {
    keys.push(new TextEncoder().encode(process.env.JWT_SECRET));
  }
  
  // Add the hardcoded fallback key
  keys.push(new TextEncoder().encode('chendanvasu'));
  
  return keys;
};

// Function to try verification with multiple keys
async function verifyTokenWithMultipleKeys(token) {
  const keys = getSecretKeys();
  let lastError = null;
  
  for (const key of keys) {
    try {
      console.log('Attempting token verification with key...');
      const { payload } = await jwtVerify(token, key);
      console.log('Token verification successful');
      return payload;
    } catch (error) {
      console.log(`Verification failed with key: ${error.message}`);
      lastError = error;
    }
  }
  
  // If we get here, all keys failed
  console.error('Token verification failed with all keys:', lastError);
  return null;
}

export async function POST(req, { params }) {
  try {
    // Get admin token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get('admin_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    // Use multi-key verification approach
    const tokenData = await verifyTokenWithMultipleKeys(token);
    
    if (!tokenData) {
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    // Get vehicle ID from params
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 });
    }

    console.log('Processing shipping update for vehicle:', id);

    // Parse request body
    const data = await req.json();
    console.log('Shipping data received:', data);
    
    // Validate required fields
    if (!data.status) {
      return NextResponse.json({ error: 'Shipping status is required' }, { status: 400 });
    }

    // Connect to database
    await dbConnect();
    const db = mongoose.connection.db;
    
    // First, check if vehicle exists in agreedvehicles collection
    console.log('Looking for vehicle in agreedvehicles collection...');
    const vehicleObjectId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;
    
    let vehicle;
    let vehicleCollection = 'agreedvehicles';
    
    if (vehicleObjectId) {
      vehicle = await db.collection('agreedvehicles').findOne({ _id: vehicleObjectId });
    }
    
    // If not found in agreedvehicles, try the vehicles collection as fallback
    if (!vehicle) {
      console.log('Vehicle not found in agreedvehicles, checking vehicles collection...');
      vehicleCollection = 'vehicles';
      if (vehicleObjectId) {
        vehicle = await db.collection('vehicles').findOne({ _id: vehicleObjectId });
      }
    }
    
    // If still not found, log but continue (we'll still create shipping record)
    if (!vehicle) {
      console.log('Warning: Vehicle not found in any collection, but will create shipping record anyway');
    } else {
      console.log(`Found vehicle in ${vehicleCollection} collection`);
    }
    
    // Get vehicle info for the shipping record
    const vehicleInfo = vehicle ? {
      make: vehicle.make || 'Unknown',
      model: vehicle.model || 'Unknown',
      year: vehicle.year || 'Unknown',
      vin: vehicle.vin || null,
      customerName: vehicle.customerName || vehicle.customer?.name || null,
      stockNumber: vehicle.stockNumber || null
    } : null;
    
    // Create shipping object
    const shippingData = {
      vehicleId: id,
      vehicleInfo: vehicleInfo,
      status: data.status,
      method: data.method || null,
      trackingNumber: data.trackingNumber || null,
      expectedArrival: data.expectedArrival ? new Date(data.expectedArrival) : null,
      carrier: data.carrier || null,
      notes: data.notes || null,
      createdAt: new Date(),
      updatedBy: tokenData.email || 'admin',
      sourceCollection: vehicleCollection
    };

    console.log('Creating shipping record for vehicle:', id);

    // Insert into shipping collection
    const result = await db.collection('vehicleShipping').insertOne(shippingData);
    
    if (!result.acknowledged) {
      return NextResponse.json({ error: 'Failed to save shipping information' }, { status: 500 });
    }

    // Also update the latest shipping status on the original vehicle collection (if we found the vehicle)
    if (vehicle) {
      try {
        console.log(`Updating ${vehicleCollection} record with latest shipping status`);
        await db.collection(vehicleCollection).updateOne(
          { _id: vehicleObjectId },
          { 
            $set: { 
              'shipping.status': data.status,
              'shipping.method': data.method,
              'shipping.trackingNumber': data.trackingNumber,
              'shipping.expectedArrival': data.expectedArrival ? new Date(data.expectedArrival) : null,
              'shipping.carrier': data.carrier,
              'shipping.lastUpdated': new Date(),
              'updatedAt': new Date()
            }
          }
        );
        console.log(`Updated ${vehicleCollection} record with latest shipping status`);
      } catch (vehicleError) {
        // Don't fail if vehicle update fails, just log it
        console.log(`${vehicleCollection} record update failed, continuing with shipping update:`, vehicleError.message);
      }

      // Add entry to vehicle timeline if needed
      if (data.status === 'Shipped' || data.status === 'In transit' || data.status === 'Delivered') {
        try {
          const timeline = vehicle.timeline || [];
          
          // Add shipping status to timeline if not already there
          const statusEvent = {
            title: `Vehicle ${data.status}`,
            date: new Date(),
            description: `Status updated to ${data.status}${data.method ? ` via ${data.method}` : ''}`,
            type: 'shipping',
            completed: true
          };
          
          const existingEntryIndex = timeline.findIndex(entry => entry.type === 'shipping' && entry.title === statusEvent.title);
          
          if (existingEntryIndex >= 0) {
            // Update existing entry
            timeline[existingEntryIndex] = statusEvent;
          } else {
            // Add new entry
            timeline.push(statusEvent);
          }
          
          // Update timeline
          await db.collection(vehicleCollection).updateOne(
            { _id: vehicleObjectId },
            { $set: { timeline: timeline } }
          );
          console.log(`Updated ${vehicleCollection} timeline with shipping event`);
        } catch (timelineError) {
          // Don't fail if timeline update fails, just log it
          console.log('Timeline update failed, continuing with shipping update:', timelineError.message);
        }
      }
    }

    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Shipping information saved successfully',
      shipping: shippingData,
      id: result.insertedId
    });
    
  } catch (error) {
    console.error('Error saving shipping information:', error);
    return NextResponse.json({ error: 'Failed to save shipping information: ' + error.message }, { status: 500 });
  }
}

// GET handler to retrieve shipping history for a vehicle
export async function GET(req, { params }) {
  try {
    // Get vehicle ID from params
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 });
    }

    // Connect to database
    await dbConnect();
    const db = mongoose.connection.db;
    
    // First, check if vehicle exists in agreedvehicles or vehicles
    console.log('Looking for vehicle details to include in response...');
    const vehicleObjectId = mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;
    
    let vehicle;
    let vehicleCollection;
    
    if (vehicleObjectId) {
      // Try agreedvehicles first
      vehicle = await db.collection('agreedvehicles').findOne({ _id: vehicleObjectId });
      vehicleCollection = 'agreedvehicles';
      
      // If not found, try vehicles
      if (!vehicle) {
        vehicle = await db.collection('vehicles').findOne({ _id: vehicleObjectId });
        if (vehicle) vehicleCollection = 'vehicles';
      }
    }
    
    // Get shipping history for this vehicle
    const shippingHistory = await db.collection('vehicleShipping')
      .find({ vehicleId: id })
      .sort({ createdAt: -1 })
      .toArray();
    
    // Include the vehicle info if we found it
    const responseData = { 
      success: true, 
      shipping: shippingHistory
    };
    
    if (vehicle) {
      responseData.vehicle = {
        _id: vehicle._id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        vin: vehicle.vin,
        stockNumber: vehicle.stockNumber,
        collection: vehicleCollection
      };
    }
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Error retrieving shipping information:', error);
    return NextResponse.json({ error: 'Failed to retrieve shipping information' }, { status: 500 });
  }
} 