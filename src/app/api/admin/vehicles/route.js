import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';

// GET /api/admin/vehicles - Get all vehicles
export async function GET(request) {
  try {
    await dbConnect();
    console.log("Connected to database");
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '100');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    
    // Build query
    let query = {};
    if (customerId) {
      query.customerId = customerId;
    }
    
    console.log("Query:", query);
    
    // Get vehicles directly from the CarListing collection
    const vehicles = await mongoose.connection.db.collection('CarListing')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    console.log(`Found ${vehicles.length} vehicles`);
    
    // Get total count for pagination
    const total = await mongoose.connection.db.collection('CarListing').countDocuments(query);
    console.log(`Total vehicles: ${total}`);
    
    // Extract all customer IDs from vehicles
    const customerIds = vehicles
      .filter(vehicle => vehicle.customerId)
      .map(vehicle => {
        try {
          return new ObjectId(vehicle.customerId);
        } catch (err) {
          console.error(`Invalid ObjectId: ${vehicle.customerId}`);
          return null;
        }
      })
      .filter(id => id !== null);
    
    console.log(`Found ${customerIds.length} unique customer IDs`);
    
    // Create a map of customer IDs to customer names
    const customerMap = {};
    
    if (customerIds.length > 0) {
      // Fetch customers from customerusers collection
      const customers = await mongoose.connection.db.collection('customerusers')
        .find({ _id: { $in: customerIds } })
        .toArray();
      
      console.log(`Found ${customers.length} customers`);
      
      // Create a map of customer ID to customer name
      customers.forEach(customer => {
        const fullName = [customer.name, customer.lastName].filter(Boolean).join(' ');
        customerMap[customer._id.toString()] = fullName || 'No Name';
      });
    }
    
    // Format vehicles for response
    const formattedVehicles = vehicles.map(vehicle => {
      const customerId = vehicle.customerId ? vehicle.customerId.toString() : null;
      const customerName = customerId && customerMap[customerId] 
        ? customerMap[customerId] 
        : 'Unknown';
      
      return {
        id: vehicle._id.toString(),
        customerId: customerId,
        customerName: customerName,
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || '',
        price: vehicle.price || 0,
        status: vehicle.status || 'unknown',
        estimatedDelivery: vehicle.estimatedDelivery || null,
        createdAt: vehicle.createdAt || new Date(),
        updatedAt: vehicle.updatedAt || new Date()
      };
    });
    
    // Apply search filter if provided
    const filteredVehicles = search 
      ? formattedVehicles.filter(vehicle => 
          vehicle.make?.toLowerCase().includes(search.toLowerCase()) ||
          vehicle.model?.toLowerCase().includes(search.toLowerCase()) ||
          vehicle.customerName?.toLowerCase().includes(search.toLowerCase())
        )
      : formattedVehicles;
    
    return NextResponse.json({
      success: true,
      vehicles: filteredVehicles,
      pagination: {
        total: search ? filteredVehicles.length : total,
        page,
        limit,
        pages: Math.ceil((search ? filteredVehicles.length : total) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Internal Server Error',
      error: error.message 
    }, { status: 500 });
  }
}

// POST /api/admin/vehicles - Create a new vehicle
export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    // Validate required fields
    if (!data.make || !data.model || !data.year) {
      return NextResponse.json({ 
        success: false,
        message: 'Make, model, and year are required' 
      }, { status: 400 });
    }
    
    // Check if customer exists if customerId is provided
    let customerName = 'Unknown';
    if (data.customerId) {
      try {
        const customer = await mongoose.connection.db.collection('customerusers')
          .findOne({ _id: new ObjectId(data.customerId) });
        
        if (customer) {
          customerName = [customer.name, customer.lastName].filter(Boolean).join(' ');
        }
      } catch (err) {
        console.error('Error finding customer:', err);
      }
    }
    
    // Create vehicle document
    const newVehicle = {
      customerId: data.customerId || null,
      make: data.make,
      model: data.model,
      year: data.year,
      price: data.price || 0,
      status: data.status || 'pending',
      estimatedDelivery: data.estimatedDelivery || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert directly into CarListing collection
    const result = await mongoose.connection.db.collection('CarListing').insertOne(newVehicle);
    
    // ADDED: Revalidate the RSS feed endpoints
    try {
      console.log('Revalidating RSS feed paths after vehicle creation');
      revalidatePath('/api/rss');
      revalidatePath('/api/rss/zapier-test');
      revalidatePath('/api/rss/basic-test');
    } catch (revalidateError) {
      console.error('Error revalidating paths:', revalidateError);
      // Continue with the response even if revalidation fails
    }
    
    return NextResponse.json({
      success: true,
      vehicle: {
        id: result.insertedId.toString(),
        customerId: data.customerId || null,
        customerName: customerName,
        ...newVehicle
      },
      message: 'Vehicle created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Internal Server Error',
      error: error.message 
    }, { status: 500 });
  }
} 