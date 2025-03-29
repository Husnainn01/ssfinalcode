import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import CustomerUser from '@/models/CustomerUser';
import CarListing from '@/models/Car';

// GET /api/admin/customers - Get all customers
export async function GET(request) {
  try {
    await dbConnect();
    console.log("Database connected successfully");
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    
    // Build query
    let query = { status: { $ne: 'deleted' } }; // Exclude deleted customers
    if (search) {
      query = {
        ...query,
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    console.log("Query:", JSON.stringify(query));
    
    // List all collections to verify customerusers exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Available collections:", collections.map(c => c.name));
    
    // Get customers directly from the customerusers collection
    const customers = await mongoose.connection.db.collection('customerusers')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    console.log(`Found ${customers.length} customers`);
    if (customers.length > 0) {
      console.log("Sample customer:", JSON.stringify(customers[0]));
    }
    
    // Get total count for pagination
    const total = await mongoose.connection.db.collection('customerusers').countDocuments(query);
    console.log(`Total customers: ${total}`);
    
    // Get vehicle counts for each customer
    const customerIds = customers.map(customer => customer._id);
    const vehicleCounts = await CarListing.aggregate([
      { $match: { customerId: { $in: customerIds.map(id => id.toString()) } } },
      { $group: { _id: '$customerId', count: { $sum: 1 } } }
    ]);
    
    // Create a map of customer ID to vehicle count
    const vehicleCountMap = {};
    vehicleCounts.forEach(item => {
      vehicleCountMap[item._id.toString()] = item.count;
    });
    
    // Format customers for response
    const formattedCustomers = customers.map(customer => {
      // Format phone number from object
      let phoneDisplay = 'No Phone';
      if (customer.phoneNumber) {
        if (typeof customer.phoneNumber === 'object') {
          const countryCode = customer.phoneNumber.countryCode || '';
          const number = customer.phoneNumber.number || '';
          phoneDisplay = countryCode ? `+${countryCode} ${number}` : number;
        } else if (typeof customer.phoneNumber === 'string') {
          phoneDisplay = customer.phoneNumber;
        }
      }
      
      // Format full name
      const fullName = [customer.name || '', customer.lastName || ''].filter(Boolean).join(' ');
      
      return {
        id: customer._id.toString(),
        name: fullName || 'Unknown',
        email: customer.email || 'No Email',
        phone: phoneDisplay,
        status: customer.status || 'unknown',
        lastLogin: customer.lastLogin || null,
        vehicleCount: vehicleCountMap[customer._id.toString()] || 0,
        createdAt: customer.createdAt || new Date(),
        updatedAt: customer.updatedAt || new Date()
      };
    });
    
    return NextResponse.json({
      success: true,
      customers: formattedCustomers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Internal Server Error',
      error: error.message 
    }, { status: 500 });
  }
}

// POST /api/admin/customers - Create a new customer
export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.email) {
      return NextResponse.json({ 
        success: false,
        message: 'Name and email are required' 
      }, { status: 400 });
    }
    
    // Check if email already exists
    const existingUser = await mongoose.connection.db.collection('customerusers')
      .findOne({ email: data.email });
      
    if (existingUser) {
      return NextResponse.json({ 
        success: false,
        message: 'Email already exists' 
      }, { status: 400 });
    }
    
    // Create customer
    const customerData = {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      role: 'customer',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await mongoose.connection.db.collection('customerusers')
      .insertOne(customerData);
    
    return NextResponse.json({
      success: true,
      customer: {
        id: result.insertedId.toString(),
        ...customerData
      },
      message: 'Customer created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Internal Server Error',
      error: error.message 
    }, { status: 500 });
  }
} 