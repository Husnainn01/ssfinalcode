import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

// GET /api/admin/customers/[id] - Get a specific customer
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    
    // Validate ID
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false,
        message: 'Invalid customer ID' 
      }, { status: 400 });
    }
    
    // Get customer directly from the collection
    const customer = await mongoose.connection.db.collection('customerusers')
      .findOne({ _id: new ObjectId(id) });
    
    if (!customer) {
      return NextResponse.json({ 
        success: false,
        message: 'Customer not found' 
      }, { status: 404 });
    }
    
    // Get customer inquiries
    const inquiries = await mongoose.connection.db.collection('customerInquiries')
      .find({ userId: id })
      .sort({ createdAt: -1 })
      .toArray();
    
    // Get customer vehicles
    const vehicles = await mongoose.connection.db.collection('CarListing')
      .find({ customerId: new ObjectId(id) })
      .sort({ createdAt: -1 })
      .toArray();
    
    // Format phone number
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
    
    // Format customer for response
    const formattedCustomer = {
      id: customer._id.toString(),
      name: customer.name || '',
      lastName: customer.lastName || '',
      fullName: [customer.name || '', customer.lastName || ''].filter(Boolean).join(' '),
      email: customer.email || '',
      phone: phoneDisplay,
      role: customer.role || 'customer',
      status: customer.status || 'active',
      createdAt: customer.createdAt || null,
      updatedAt: customer.updatedAt || null,
      lastLogin: customer.lastLogin || null,
      inquiries: inquiries.map(inquiry => ({
        id: inquiry._id.toString(),
        subject: inquiry.subject || '',
        status: inquiry.status || 'pending',
        createdAt: inquiry.createdAt || null
      })),
      vehicles: vehicles.map(vehicle => ({
        id: vehicle._id.toString(),
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || '',
        status: vehicle.status || 'pending',
        createdAt: vehicle.createdAt || null
      })),
      inquiryCount: inquiries.length,
      vehicleCount: vehicles.length
    };
    
    return NextResponse.json({
      success: true,
      customer: formattedCustomer
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Internal Server Error',
      error: error.message 
    }, { status: 500 });
  }
}

// PATCH /api/admin/customers/[id] - Update a customer
export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    
    // Validate ID
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false,
        message: 'Invalid customer ID' 
      }, { status: 400 });
    }
    
    const body = await request.json();
    
    // Check if customer exists
    const customer = await mongoose.connection.db.collection('customerusers')
      .findOne({ _id: new ObjectId(id) });
    
    if (!customer) {
      return NextResponse.json({ 
        success: false,
        message: 'Customer not found' 
      }, { status: 404 });
    }
    
    // Prepare update data
    const updateData = {
      ...(body.name && { name: body.name }),
      ...(body.lastName && { lastName: body.lastName }),
      ...(body.email && { email: body.email }),
      ...(body.phoneNumber && { phoneNumber: body.phoneNumber }),
      ...(body.status && { status: body.status }),
      updatedAt: new Date()
    };
    
    // Update customer
    const result = await mongoose.connection.db.collection('customerusers')
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ 
        success: false,
        message: 'Customer not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Customer updated successfully'
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Internal Server Error',
      error: error.message 
    }, { status: 500 });
  }
}

// DELETE /api/admin/customers/[id] - Delete a customer
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    
    // Validate ID
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false,
        message: 'Invalid customer ID' 
      }, { status: 400 });
    }
    
    // Check if customer exists
    const customer = await mongoose.connection.db.collection('customerusers')
      .findOne({ _id: new ObjectId(id) });
    
    if (!customer) {
      return NextResponse.json({ 
        success: false,
        message: 'Customer not found' 
      }, { status: 404 });
    }
    
    // Delete customer
    const result = await mongoose.connection.db.collection('customerusers')
      .deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ 
        success: false,
        message: 'Failed to delete customer' 
      }, { status: 500 });
    }
    
    // Delete related data (inquiries, vehicles, etc.)
    await mongoose.connection.db.collection('customerInquiries')
      .deleteMany({ userId: id });
    
    await mongoose.connection.db.collection('customerNotifications')
      .deleteMany({ userId: id });
    
    // Don't automatically delete vehicles, just update them to remove customer reference
    await mongoose.connection.db.collection('CarListing')
      .updateMany(
        { customerId: new ObjectId(id) },
        { $set: { customerId: null, customerName: 'Customer Deleted' } }
      );
    
    return NextResponse.json({
      success: true,
      message: 'Customer and related data deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Internal Server Error',
      error: error.message 
    }, { status: 500 });
  }
} 