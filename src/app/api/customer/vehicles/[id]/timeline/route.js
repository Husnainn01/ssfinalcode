import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    console.log(`Fetching timeline for vehicle ID: ${id}`);
    
    // Verify customer authentication (same as other API routes)
    const cookieStore = cookies();
    const token = cookieStore.get('customer_token') || cookieStore.get('token');
    
    if (!token) {
      return NextResponse.json({ 
        success: false,
        message: 'Unauthorized - Please log in' 
      }, { status: 401 });
    }
    
    try {
      // Authentication verification logic (same as your existing routes)
      // ...
      
      // Get timeline from the timeline collection
      let timeline = [];
      try {
        timeline = await mongoose.connection.db.collection('timeline')
          .find({ vehicleId: id })
          .sort({ date: 1 })
          .toArray();
        
        if (timeline.length === 0 && ObjectId.isValid(id)) {
          // Try with ObjectId
          timeline = await mongoose.connection.db.collection('timeline')
            .find({ vehicleId: new ObjectId(id) })
            .sort({ date: 1 })
            .toArray();
        }
        
        // If still no results, check string version of ID
        if (timeline.length === 0) {
          timeline = await mongoose.connection.db.collection('timeline')
            .find({ vehicleId: id.toString() })
            .sort({ date: 1 })
            .toArray();
        }
      } catch (err) {
        console.error('Error fetching timeline:', err);
      }
      
      // Format timeline events
      let formattedTimeline = [];
      if (timeline && timeline.length > 0) {
        formattedTimeline = timeline.map((event, index, array) => {
          const statusIndex = array.findIndex(e => e.status === event.status);
          const isCompleted = event.completed || statusIndex < array.findIndex(e => e._id.toString() === event._id.toString());
          
          return {
            status: event.status || '',
            date: event.date || new Date(),
            description: event.description || '',
            completed: isCompleted,
            updatedAt: event.updatedAt || event.date || new Date(),
            updatedBy: event.updatedBy || null
          };
        });
      } else {
        // If no timeline found, check vehicle status to create basic timeline
        try {
          const vehicle = await mongoose.connection.db.collection('agreedvehicles')
            .findOne({ _id: ObjectId.isValid(id) ? new ObjectId(id) : id });
            
          if (vehicle) {
            // Create a basic timeline based on vehicle status
            const statusMap = {
              'pending': 0,
              'processing': 1,
              'shipping': 2,
              'delivered': 3,
              'completed': 4
            };
            
            const currentStatusIndex = statusMap[vehicle.status || 'pending'] || 0;
            
            const timelineSteps = [
              {
                status: "Inquiry Created",
                date: vehicle.createdAt || new Date(),
                description: `Initial inquiry submitted for ${vehicle.make || ''} ${vehicle.model || ''}`,
                completed: true
              },
              {
                status: "Price Agreed",
                date: vehicle.dateAgreed || vehicle.createdAt || new Date(),
                description: `Final price agreed at $${(vehicle.agreedPrice || vehicle.price || 0).toLocaleString()}`,
                completed: currentStatusIndex >= 1
              },
              {
                status: "Processing",
                date: vehicle.processingDate || vehicle.updatedAt || new Date(),
                description: "Vehicle being prepared for shipping",
                completed: currentStatusIndex >= 2
              },
              {
                status: "Shipping",
                date: vehicle.shippingDate || vehicle.updatedAt || new Date(),
                description: "Vehicle in transit",
                completed: currentStatusIndex >= 3
              },
              {
                status: "Delivery",
                date: vehicle.deliveryDate || vehicle.estimatedDelivery || new Date(),
                description: "Vehicle delivered to customer",
                completed: currentStatusIndex >= 4
              }
            ];
            
            formattedTimeline = timelineSteps;
          }
        } catch (err) {
          console.error('Error creating fallback timeline:', err);
        }
      }
      
      return NextResponse.json({
        success: true,
        timeline: formattedTimeline
      });
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json({ 
        success: false,
        message: 'Invalid authentication token',
        error: error.message
      }, { status: 401 });
    }
  } catch (error) {
    console.error('Error fetching timeline:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Internal Server Error',
      error: error.message 
    }, { status: 500 });
  }
} 