import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';
import Inquiry from '@/models/Inquiry';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    console.log("Looking for inquiry with ID:", id);

    // First, check if the ID is valid
    if (!id || id === 'undefined') {
      console.log("Invalid inquiry ID provided");
      return NextResponse.json({ error: "Invalid inquiry ID" }, { status: 400 });
    }

    // Try to find the inquiry in customerInquiries collection
    let inquiry;
    try {
      inquiry = await mongoose.connection.db
        .collection('customerInquiries')
        .findOne({ _id: new mongoose.Types.ObjectId(id) });
      
      console.log("Found in customerInquiries:", !!inquiry);
    } catch (err) {
      console.error("Error searching customerInquiries:", err);
    }

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    // If the inquiry has an agreed price, fetch the vehicle from agreedvehicles collection
    if (inquiry.status === 'agreed' && inquiry.vehicleId) {
      try {
        console.log("Fetching agreed vehicle with ID:", inquiry.vehicleId);
        const agreedVehicle = await mongoose.connection.db
          .collection('agreedvehicles')
          .findOne({ _id: new mongoose.Types.ObjectId(inquiry.vehicleId) });

        if (agreedVehicle) {
          console.log("Found agreed vehicle:", agreedVehicle._id);
          inquiry.vehicle = agreedVehicle;
        } else {
          console.log("No agreed vehicle found with ID:", inquiry.vehicleId);
        }
      } catch (error) {
        console.error("Error fetching agreed vehicle:", error);
      }
    }
    // If not agreed yet but has vehicle details, fetch from cars collection
    else if (inquiry.category === 'vehicle' && inquiry.vehicleId) {
      try {
        const vehicle = await mongoose.connection.db
          .collection('cars')
          .findOne({ _id: new mongoose.Types.ObjectId(inquiry.vehicleId) });
        
        if (vehicle) {
          inquiry.carDetails = {
            id: vehicle._id.toString(),
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            price: vehicle.price,
            stockNo: vehicle.stockNo,
            images: vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : null
          };
        }
      } catch (error) {
        console.error("Error fetching vehicle details:", error);
      }
    }

    // Log found inquiry details with vehicle info
    console.log("Found inquiry:", {
      _id: inquiry._id,
      status: inquiry.status,
      hasAgreedVehicle: !!inquiry.vehicle,
      hasCarDetails: !!inquiry.carDetails,
      vehicleId: inquiry.vehicleId
    });

    // Get admin info from headers (set by middleware)
    const adminId = request.headers.get('x-admin-id');
    const adminRole = request.headers.get('x-admin-role');
    
    // Check permissions based on role for viewing inquiries
    if (!['admin', 'editor', 'moderator', 'viewer'].includes(adminRole)) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient permissions to view inquiries'
      }, { status: 403 });
    }
    
    // Mark any unread customer replies as read
    if (inquiry.replies && inquiry.replies.some(reply => !reply.isAdmin && !reply.readByAdmin)) {
      await mongoose.connection.db
        .collection('customerInquiries')
        .updateOne(
          { _id: new mongoose.Types.ObjectId(id) },
          { 
            $set: { 
              "replies.$[elem].readByAdmin": true 
            } 
          },
          { 
            arrayFilters: [{ "elem.isAdmin": false, "elem.readByAdmin": { $ne: true } }] 
          }
        );
    }
    
    // After finding the inquiry, let's properly extract customer information
    if (inquiry) {
      // First, try to get customer info directly from the inquiry
      const customerInfo = {
        name: inquiry.customerName || inquiry.name || 'Unknown',
        email: inquiry.customerEmail || inquiry.email || '',
        phone: inquiry.customerPhone || inquiry.phone || '',
        joined: inquiry.customerJoined || inquiry.joined || 'N/A'
      };

      // Log what we found in the inquiry
      console.log("Customer info from inquiry:", {
        foundName: inquiry.customerName || inquiry.name,
        foundEmail: inquiry.customerEmail || inquiry.email,
        rawInquiry: {
          customerName: inquiry.customerName,
          customerEmail: inquiry.customerEmail,
          name: inquiry.name,
          email: inquiry.email
        }
      });

      // Attach the customer info to the inquiry
      inquiry.customer = {
        ...inquiry.customer, // Keep any existing customer data
        ...customerInfo // Override with the info we extracted
      };

      // If we have a customer ID, try to get more details
      const customerId = inquiry.userId || inquiry.customerId || inquiry.customer?._id;
      
      if (customerId) {
        try {
          console.log(`Attempting to fetch customer with ID: ${customerId}`);
          
          let customerObjectId;
          try {
            customerObjectId = new mongoose.Types.ObjectId(customerId);
          } catch (err) {
            console.error(`Invalid ObjectId format for customer ID: ${customerId}`);
            customerObjectId = customerId;
          }
          
          const customer = await mongoose.connection.db
            .collection('customerusers')
            .findOne({ _id: customerObjectId });
          
          if (customer) {
            console.log(`Customer found in customerusers:`, {
              name: customer.name,
              email: customer.email
            });
            
            // Format the full name by combining first name and last name
            const fullName = customer.lastName 
              ? `${customer.name} ${customer.lastName}`.trim()
              : customer.name;

            // Format the joined date
            const joinedDate = customer.createdAt 
              ? new Date(customer.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })
              : 'N/A';

            // Update customer info with properly formatted data
            inquiry.customer = {
              name: fullName,
              email: customer.email || '',
              phone: customer.phone || '',
              joined: joinedDate,
              // Keep the original fields as well
              firstName: customer.name,
              lastName: customer.lastName || '',
              // Keep any existing customer data
              ...inquiry.customer
            };
          }
        } catch (error) {
          console.error("Error fetching customer details:", error);
        }
      }
      
      // If we still don't have customer info but have an email, try finding by email
      if (!inquiry.customer.name || inquiry.customer.name === 'Unknown') {
        const emailToSearch = inquiry.customerEmail || inquiry.email || inquiry.customer?.email;
        
        if (emailToSearch) {
          try {
            console.log(`Trying to find customer by email: ${emailToSearch}`);
            const customerByEmail = await mongoose.connection.db
              .collection('customerusers')
              .findOne({ email: emailToSearch });
            
            if (customerByEmail) {
              console.log(`Customer found by email:`, {
                name: customerByEmail.name,
                email: customerByEmail.email
              });
              
              inquiry.customer = {
                ...inquiry.customer,
                name: customerByEmail.name || customerByEmail.firstName || inquiry.customer.name,
                lastName: customerByEmail.lastName || '',
                email: customerByEmail.email || inquiry.customer.email,
                phone: customerByEmail.phone || inquiry.customer.phone,
                joined: customerByEmail.createdAt || inquiry.customer.joined
              };
            }
          } catch (error) {
            console.error("Error fetching customer by email:", error);
          }
        }
      }

      // Log final customer info for debugging
      console.log("Final customer info:", {
        fullName: inquiry.customer.name,
        email: inquiry.customer.email,
        phone: inquiry.customer.phone || 'Not provided',
        joined: inquiry.customer.joined
      });
    }
    
    return NextResponse.json({ 
      success: true,
      inquiry 
    });
  } catch (error) {
    console.error("Error fetching inquiry:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Helper function to generate mock data for development/testing
function generateMockInquiryResponse(id) {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  return {
    inquiry: {
      _id: id,
      subject: "Inquiry about vehicle purchase options",
      message: "Hello, I'm interested in purchasing a Toyota Camry from your dealership. Could you please provide information about financing options and current promotions? Also, do you have any hybrid models available?\n\nThank you for your assistance.",
      status: "pending",
      category: "vehicle",
      createdAt: yesterday.toISOString(),
      updatedAt: yesterday.toISOString(),
      customer: {
        name: "John Smith",
        email: "john.smith@example.com",
        phone: "+1 (555) 123-4567"
      },
      customerName: "John Smith",
      customerEmail: "john.smith@example.com",
      referenceId: "REF-1234",
      replies: [
        {
          _id: "reply_1",
          message: "Thank you for your inquiry. We do have several Toyota Camry models, including hybrids. Our current financing rate is 2.9% APR for qualified buyers. Would you like to schedule a test drive?",
          isAdmin: true,
          createdAt: new Date(yesterday.getTime() + 3600000).toISOString(),
          adminName: "Sales Team"
        },
        {
          _id: "reply_2",
          message: "Yes, I would love to schedule a test drive for this weekend. Do you have availability on Saturday morning?",
          isAdmin: false,
          createdAt: new Date(yesterday.getTime() + 7200000).toISOString()
        }
      ],
      carDetails: {
        id: "car_123",
        make: "Toyota",
        model: "Camry",
        year: "2023",
        price: 28500,
        stockNo: "TC-2023-456",
        images: "https://placehold.co/600x400?text=Toyota+Camry"
      }
    }
  };
} 