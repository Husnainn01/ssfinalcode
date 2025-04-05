import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Inquiry ID is required'
      }, { status: 400 });
    }
    
    await dbConnect();
    
    // Use the correct collection name - customerInquiries
    const inquiryCollection = mongoose.connection.db.collection('customerInquiries');
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid inquiry ID format' 
      }, { status: 400 });
    }
    
    const inquiry = await inquiryCollection.findOne({ 
      _id: new mongoose.Types.ObjectId(id) 
    });
    
    if (!inquiry) {
      return NextResponse.json({ 
        success: false, 
        message: 'Inquiry not found' 
      }, { status: 404 });
    }
    
    // Check if there's a related vehicle to unarchive
    const vehicleId = inquiry.vehicleId || inquiry.vehicle?._id;
    let vehicleUpdated = false;
    
    if (vehicleId && mongoose.Types.ObjectId.isValid(vehicleId)) {
      const vehiclesCollection = mongoose.connection.db.collection('agreedvehicles');
      const updateVehicleResult = await vehiclesCollection.updateOne(
        { _id: new mongoose.Types.ObjectId(vehicleId) },
        { $set: { isArchived: false }, $unset: { archivedAt: "" } }
      );
      
      vehicleUpdated = updateVehicleResult.modifiedCount > 0;
    }
    
    // Update the inquiry to remove archived status
    const result = await inquiryCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { 
        $set: { isArchived: false },
        $unset: { archivedAt: "" }
        // Note: we don't change the status back from 'closed'
      }
    );
    
    if (result.modifiedCount === 0) {
      return NextResponse.json({
        success: false,
        message: 'Failed to unarchive inquiry'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Inquiry successfully unarchived',
      vehicleUpdated: vehicleUpdated
    });
    
  } catch (error) {
    console.error('Error unarchiving inquiry:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Internal Server Error',
      error: error.message 
    }, { status: 500 });
  }
} 