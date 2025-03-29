import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import Vehicle from '@/models/Vehicle';
import AgreedVehicle from '@/models/AgreedVehicle';

// GET /api/admin/vehicles/[id] - Get a specific vehicle
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    console.log("VEHICLE API: Looking for vehicle with ID:", id);
    
    // Add a validation check for the ID
    if (!id || id === 'undefined') {
      console.log("VEHICLE API: Invalid ID provided:", id);
      return Response.json({ error: "Invalid vehicle ID" }, { status: 400 });
    }
    
    // First try in AgreedVehicle collection
    let vehicle = null;
    
    try {
      // Try ObjectId format
      if (mongoose.Types.ObjectId.isValid(id)) {
        vehicle = await mongoose.connection.db.collection('agreedvehicles').findOne({
          _id: new mongoose.Types.ObjectId(id)
        });
      }
      
      // If not found, try string ID
      if (!vehicle) {
        vehicle = await mongoose.connection.db.collection('agreedvehicles').findOne({
          _id: id
        });
      }
      
      console.log('VEHICLE API: Found in agreedvehicles collection:', !!vehicle);
    } catch (err) {
      console.error('VEHICLE API: Error checking agreedvehicles:', err);
    }
    
    // If not found in agreedvehicles, try vehicles collection
    if (!vehicle) {
      try {
        vehicle = await Vehicle.findById(id).lean();
        console.log('Found in vehicles collection:', !!vehicle);
      } catch (err) {
        console.error('Error checking vehicles:', err);
      }
    }
    
    // If still not found, try CarListing collection
    if (!vehicle) {
      try {
        if (mongoose.Types.ObjectId.isValid(id)) {
          vehicle = await mongoose.connection.db.collection('CarListing').findOne({
            _id: new mongoose.Types.ObjectId(id)
          });
        }
        
        console.log('Found in CarListing collection:', !!vehicle);
      } catch (err) {
        console.error('Error checking CarListing:', err);
      }
    }
    
    if (!vehicle) {
      return NextResponse.json({ success: false, message: 'Vehicle not found' }, { status: 404 });
    }
    
    // Format the data to match what the client expects
    const formattedVehicle = {
      id: vehicle._id, 
      customerId: vehicle.customerId,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      price: vehicle.price,
      agreedPrice: vehicle.agreedPrice,
      priceCurrency: vehicle.priceCurrency,
      status: vehicle.status || 'processing',
      
      // Ensure all date fields are included
      estimatedDelivery: vehicle.estimatedDelivery || null,
      dateAgreed: vehicle.dateAgreed || null,
      createdAt: vehicle.createdAt || null,
      updatedAt: vehicle.updatedAt || null,
      
      // Other direct fields
      stockNumber: vehicle.stockNumber || "N/A",
      availability: vehicle.availability || "N/A",
      offerType: vehicle.offerType || "N/A",
      
      // Create a specs object to hold all specification data
      specs: {
        bodyType: vehicle.bodyType || "N/A",
        color: vehicle.color || "N/A",
        fuelType: vehicle.fuelType || "N/A",
        engine: vehicle.vehicleEngine || "N/A",
        transmission: vehicle.vehicleTransmission || "N/A",
        cylinders: vehicle.cylinders || "N/A",
        doors: vehicle.numberOfDoors || "N/A",
        seatingCapacity: vehicle.vehicleSeatingCapacity || "N/A",
        driveWheelConfiguration: vehicle.driveWheelConfiguration || "N/A",
        vin: vehicle.vin || "N/A",
        mileage: vehicle.mileage || "0",
        mileageUnit: vehicle.mileageUnit || "KM",
        itemCondition: vehicle.itemCondition || "N/A",
        // Also add these to specs for backward compatibility
        stockNumber: vehicle.stockNumber || "N/A",
        availability: vehicle.availability || "N/A",
        offerType: vehicle.offerType || "N/A",
      },
      
      // Rename features to match what client expects
      features: vehicle.carFeature || [],
      notes: vehicle.agreementNotes || null,
      
      // Pass through images, handling different formats
      images: Array.isArray(vehicle.images) ? 
        vehicle.images.map(img => typeof img === 'object' && img.image ? img.image : img) : 
        [],
      
      // Other fields
      customer: vehicle.customer || null,
      documents: vehicle.documents || [],
      shipping: vehicle.shipping || null,
      timeline: vehicle.timeline || []
    };
    
    // Add debug logging for date fields
    console.log("VEHICLE API: Date fields check:", {
      dateAgreed: vehicle.dateAgreed,
      estimatedDelivery: vehicle.estimatedDelivery,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt
    });
    
    // Log the formatted data
    console.log("VEHICLE API: Formatted for client:", {
      fields: Object.keys(formattedVehicle),
      specsFields: Object.keys(formattedVehicle.specs)
    });
    
    return NextResponse.json({
      success: true,
      vehicle: formattedVehicle
    });
  } catch (error) {
    console.error("Error checking vehicles:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/vehicles/[id] - Update a vehicle
export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    
    // Validate ID
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false,
        message: 'Invalid vehicle ID' 
      }, { status: 400 });
    }
    
    const body = await request.json();
    
    // Check if vehicle exists
    const vehicle = await mongoose.connection.db.collection('CarListing')
      .findOne({ _id: new ObjectId(id) });
    
    if (!vehicle) {
      return NextResponse.json({ 
        success: false,
        message: 'Vehicle not found' 
      }, { status: 404 });
    }
    
    // If customerId is provided, check if customer exists
    if (body.customerId && body.customerId !== (vehicle.customerId ? vehicle.customerId.toString() : null)) {
      if (!ObjectId.isValid(body.customerId)) {
        return NextResponse.json({ 
          success: false,
          message: 'Invalid customer ID' 
        }, { status: 400 });
      }
      
      const customer = await mongoose.connection.db.collection('customerusers')
        .findOne({ _id: new ObjectId(body.customerId) });
      
      if (!customer) {
        return NextResponse.json({ 
          success: false,
          message: 'Customer not found' 
        }, { status: 404 });
      }
    }
    
    // Prepare update data
    const updateData = {
      ...(body.make && { make: body.make }),
      ...(body.model && { model: body.model }),
      ...(body.year && { year: body.year }),
      ...(body.hasOwnProperty('price') && { price: body.price }),
      ...(body.hasOwnProperty('agreedPrice') && { agreedPrice: body.agreedPrice }),
      ...(body.status && { status: body.status }),
      ...(body.hasOwnProperty('estimatedDelivery') && { estimatedDelivery: body.estimatedDelivery }),
      ...(body.specs && { specs: body.specs }),
      ...(body.features && { features: body.features }),
      ...(body.hasOwnProperty('notes') && { notes: body.notes }),
      ...(body.hasOwnProperty('customerId') && { 
        customerId: body.customerId ? new ObjectId(body.customerId) : null 
      }),
      updatedAt: new Date()
    };
    
    // Update vehicle
    const result = await mongoose.connection.db.collection('CarListing')
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ 
        success: false,
        message: 'Vehicle not found' 
      }, { status: 404 });
    }
    
    // If status changed, add to timeline if timeline collection exists
    if (body.status && body.status !== vehicle.status) {
      try {
        await mongoose.connection.db.collection('timeline').insertOne({
          vehicleId: id,
          title: `Status changed to ${body.status}`,
          status: body.status,
          date: new Date(),
          description: body.statusNote || `Vehicle status updated to ${body.status}`
        });
      } catch (err) {
        console.error('Error adding timeline event:', err);
        // Continue even if timeline insertion fails
      }
    }
    
    // Get updated vehicle
    const updatedVehicle = await mongoose.connection.db.collection('CarListing')
      .findOne({ _id: new ObjectId(id) });
    
    return NextResponse.json({
      success: true,
      message: 'Vehicle updated successfully',
      vehicle: {
        id: updatedVehicle._id.toString(),
        customerId: updatedVehicle.customerId ? updatedVehicle.customerId.toString() : null,
        make: updatedVehicle.make,
        model: updatedVehicle.model,
        year: updatedVehicle.year,
        price: updatedVehicle.price,
        status: updatedVehicle.status,
        estimatedDelivery: updatedVehicle.estimatedDelivery,
        updatedAt: updatedVehicle.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Internal Server Error',
      error: error.message 
    }, { status: 500 });
  }
}

// DELETE /api/admin/vehicles/[id] - Delete a vehicle
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    
    // Validate ID
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false,
        message: 'Invalid vehicle ID' 
      }, { status: 400 });
    }
    
    // Check if vehicle exists
    const vehicle = await mongoose.connection.db.collection('CarListing')
      .findOne({ _id: new ObjectId(id) });
    
    if (!vehicle) {
      return NextResponse.json({ 
        success: false,
        message: 'Vehicle not found' 
      }, { status: 404 });
    }
    
    // Delete associated documents if documents collection exists
    try {
      await mongoose.connection.db.collection('documents')
        .deleteMany({ vehicleId: id });
    } catch (err) {
      console.error('Error deleting documents:', err);
      // Continue even if document deletion fails
    }
    
    // Delete associated shipping info if shipping collection exists
    try {
      await mongoose.connection.db.collection('shipping')
        .deleteMany({ vehicleId: id });
    } catch (err) {
      console.error('Error deleting shipping info:', err);
      // Continue even if shipping deletion fails
    }
    
    // Delete associated timeline events if timeline collection exists
    try {
      await mongoose.connection.db.collection('timeline')
        .deleteMany({ vehicleId: id });
    } catch (err) {
      console.error('Error deleting timeline events:', err);
      // Continue even if timeline deletion fails
    }
    
    // Delete vehicle
    const result = await mongoose.connection.db.collection('CarListing')
      .deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ 
        success: false,
        message: 'Failed to delete vehicle' 
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Vehicle and associated data deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Internal Server Error',
      error: error.message 
    }, { status: 500 });
  }
} 