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
    console.log(`Looking for vehicle with ID: ${id}`);
    
    // Verify customer authentication
    const cookieStore = cookies();
    const token = cookieStore.get('customer_token') || cookieStore.get('token');
    
    if (!token) {
      return NextResponse.json({ 
        success: false,
        message: 'Unauthorized - Please log in' 
      }, { status: 401 });
    }
    
    try {
      // Try multiple secret keys for verification
      let payload;
      const secretKeys = [
        new TextEncoder().encode('chendanvasu'),
        new TextEncoder().encode(process.env.JWT_SECRET || ''),
        new TextEncoder().encode(process.env.NEXTAUTH_SECRET || '')
      ];
      
      // Try each secret key until one works
      let verificationSuccess = false;
      
      for (const secretKey of secretKeys) {
        try {
          const result = await jwtVerify(token.value, secretKey);
          payload = result.payload;
          verificationSuccess = true;
          console.log('Token verified successfully with key');
          break;
        } catch (err) {
          // Continue trying other keys
          console.log('Key verification attempt failed, trying next key');
        }
      }
      
      if (!verificationSuccess) {
        throw new Error('All verification attempts failed');
      }
      
      // Ensure this is a customer token
      if (payload.role !== 'customer' && payload.type !== 'customer') {
        return NextResponse.json({ 
          success: false,
          message: 'Unauthorized - Invalid token type' 
        }, { status: 403 });
      }
      
      const customerId = payload.userId || payload.id;
      
      // Validate vehicle ID
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ 
          success: false,
          message: 'Invalid vehicle ID' 
        }, { status: 400 });
      }
      
      // First check agreedvehicles collection (priority collection)
      console.log(`Checking agreedvehicles collection for vehicle ${id}`);
      let vehicle = await mongoose.connection.db.collection('agreedvehicles')
        .findOne({ _id: new ObjectId(id) });
      
      let collectionUsed = 'agreedvehicles';
      
      // If not found, try looking up by string ID
      if (!vehicle) {
        console.log(`Checking agreedvehicles collection for vehicle with string ID ${id}`);
        vehicle = await mongoose.connection.db.collection('agreedvehicles')
          .findOne({ id: id });
      }
      
      // If still not found, check other collections as fallback
      if (!vehicle) {
        const fallbackCollections = ['CarListing', 'vehicles'];
        for (const collectionName of fallbackCollections) {
          try {
            console.log(`Checking ${collectionName} collection for vehicle ${id}`);
            const result = await mongoose.connection.db.collection(collectionName)
              .findOne({ _id: new ObjectId(id) });
            
            if (result) {
              vehicle = result;
              collectionUsed = collectionName;
              console.log(`Found vehicle in ${collectionName} collection`);
              break;
            }
            
            // Try string ID lookup
            const resultByStringId = await mongoose.connection.db.collection(collectionName)
              .findOne({ id: id });
            
            if (resultByStringId) {
              vehicle = resultByStringId;
              collectionUsed = collectionName;
              console.log(`Found vehicle in ${collectionName} collection with string ID`);
              break;
            }
          } catch (err) {
            console.error(`Error checking ${collectionName} collection:`, err);
          }
        }
      }
      
      if (!vehicle) {
        return NextResponse.json({ 
          success: false,
          message: 'Vehicle not found in any collection',
          vehicleId: id
        }, { status: 404 });
      }
      
      console.log(`Successfully found vehicle in ${collectionUsed} collection`);
      
      // Get shipping information from vehicleShipping collection
      console.log(`Looking for shipping data in vehicleShipping collection for vehicle ${id}`);
      let shipping = await mongoose.connection.db.collection('vehicleShipping')
        .findOne({ vehicleId: id });
      
      // If not found by ID, try with ObjectId
      if (!shipping && ObjectId.isValid(id)) {
        shipping = await mongoose.connection.db.collection('vehicleShipping')
          .findOne({ vehicleId: new ObjectId(id) });
      }
      
      // If still not found, try with string representation of ID
      if (!shipping) {
        shipping = await mongoose.connection.db.collection('vehicleShipping')
          .findOne({ vehicleId: vehicle._id.toString() });
      }
      
      // As last resort, check the legacy shipping collection
      if (!shipping) {
        shipping = await mongoose.connection.db.collection('shipping')
          .findOne({ vehicleId: id });
      }
      
      console.log(`Shipping data found: ${!!shipping}`);
      
      // Get documents for this vehicle
      let documents = [];
      try {
        documents = await mongoose.connection.db.collection('documents')
          .find({ vehicleId: id })
          .sort({ uploadedAt: -1 })
          .toArray();
        
        if (documents.length === 0) {
          // Try with string ID
          documents = await mongoose.connection.db.collection('documents')
            .find({ vehicleId: vehicle._id.toString() })
            .sort({ uploadedAt: -1 })
            .toArray();
        }
      } catch (err) {
        console.error('Error fetching documents:', err);
      }
      
      // Format documents
      const formattedDocuments = documents.map(doc => ({
        id: doc._id.toString(),
        name: doc.name || 'Unnamed Document',
        type: doc.type || 'other',
        url: doc.url || '',
        dateAdded: doc.uploadedAt || doc.createdAt || new Date()
      }));
      
      // Get or create timeline
      let timeline = [];
      try {
        timeline = await mongoose.connection.db.collection('timeline')
          .find({ vehicleId: id })
          .sort({ date: 1 })
          .toArray();
        
        if (timeline.length === 0) {
          // Try with string ID
          timeline = await mongoose.connection.db.collection('timeline')
            .find({ vehicleId: vehicle._id.toString() })
            .sort({ date: 1 })
            .toArray();
        }
      } catch (err) {
        console.error('Error fetching timeline:', err);
      }
      
      // Format timeline events or create default timeline
      let formattedTimeline = [];
      if (timeline && timeline.length > 0) {
        formattedTimeline = timeline.map((event, index, array) => {
          const statusIndex = array.findIndex(e => e.status === event.status);
          const isCompleted = statusIndex < array.length - 1;
          
          return {
            status: event.status || '',
            date: event.date || new Date(),
            description: event.description || '',
            completed: isCompleted
          };
        });
      } else {
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
            date: vehicle.shippingDate || shipping?.createdAt || vehicle.updatedAt || new Date(),
            description: "Vehicle in transit",
            completed: currentStatusIndex >= 3
          },
          {
            status: "Delivery",
            date: vehicle.deliveryDate || shipping?.estimatedDelivery || vehicle.estimatedDelivery || new Date(),
            description: "Vehicle delivered to customer",
            completed: currentStatusIndex >= 4
          }
        ];
        
        formattedTimeline = timelineSteps;
      }
      
      // Get contact person (support staff)
      let contactPerson = null;
      try {
        const adminUser = await mongoose.connection.db.collection('users')
          .findOne({ role: 'admin' });
        
        if (adminUser) {
          contactPerson = {
            name: [adminUser.name, adminUser.lastName].filter(Boolean).join(' ') || 'Support Staff',
            role: adminUser.roleName || 'Customer Support Specialist',
            email: adminUser.email || 'support@jdmglobal.com',
            phone: adminUser.phone || '+1-555-123-4567'
          };
        }
      } catch (err) {
        console.error('Error fetching contact person:', err);
      }
      
      // Format the full vehicle response
      const formattedVehicle = {
        id: vehicle._id.toString(),
        make: vehicle.make || vehicle.carMake || '',
        model: vehicle.model || vehicle.carModel || '',
        year: vehicle.year || vehicle.carYear || '',
        price: vehicle.price || vehicle.carPrice || 0,
        agreedPrice: vehicle.agreedPrice || vehicle.price || 0,
        status: vehicle.status || 'pending',
        imageUrl: '',
        images: [],
        inquiryId: vehicle.inquiryId || '',
        dateAgreed: vehicle.dateAgreed || vehicle.createdAt,
        estimatedDelivery: shipping?.estimatedDelivery || vehicle.estimatedDelivery || null,
        specs: {
          engine: vehicle.specs?.engine || vehicle.vehicleEngine || vehicle.engine || 'Not specified',
          transmission: vehicle.specs?.transmission || vehicle.vehicleTransmission || vehicle.transmission || 'Not specified',
          mileage: vehicle.specs?.mileage || vehicle.mileage || 0,
          color: vehicle.specs?.color || vehicle.color || 'Not specified',
          fuelType: vehicle.specs?.fuelType || vehicle.fuelType || 'Not specified',
          bodyType: vehicle.specs?.bodyType || vehicle.bodyType || 'Not specified',
          vin: vehicle.specs?.vin || vehicle.vin || '',
          doors: vehicle.specs?.doors || vehicle.numberOfDoors || null,
          seats: vehicle.specs?.seats || vehicle.vehicleSeatingCapacity || null,
          features: vehicle.specs?.features || vehicle.carFeature || []
        },
        documents: formattedDocuments,
        timeline: formattedTimeline,
        shipping: shipping ? {
          trackingNumber: shipping.trackingNumber || '',
          carrier: shipping.carrier || '',
          origin: shipping.origin || '',
          destination: shipping.destination || '',
          departureDate: shipping.departureDate || null,
          arrivalDate: shipping.estimatedDelivery || null,
          currentLocation: shipping.currentLocation || '',
          status: shipping.status || ''
        } : null,
        contactPerson: contactPerson,
        stockNumber: vehicle.stockNumber || ''
      };
      
      // Handle vehicle images - try multiple possible formats
      if (vehicle.images) {
        if (Array.isArray(vehicle.images)) {
          // Handle different image formats
          formattedVehicle.images = vehicle.images.map(img => {
            if (typeof img === 'string') {
              return img;
            } else if (img && img.image) {
              return img.image;
            } else if (img && img.url) {
              return img.url;
            }
            return '';
          }).filter(img => img); // Remove empty strings
          
          if (formattedVehicle.images.length > 0) {
            formattedVehicle.imageUrl = formattedVehicle.images[0];
          }
        } else if (typeof vehicle.images === 'string') {
          formattedVehicle.imageUrl = vehicle.images;
          formattedVehicle.images = [vehicle.images];
        }
      } else if (vehicle.image || vehicle.imageUrl) {
        formattedVehicle.imageUrl = vehicle.image || vehicle.imageUrl;
        formattedVehicle.images = [formattedVehicle.imageUrl];
      }
      
      return NextResponse.json({
        success: true,
        vehicle: formattedVehicle,
        collectionUsed: collectionUsed
      });
      
    } catch (error) {
      console.error('Token verification error:', error);
      
      // In development mode, return sample data
      if (process.env.NODE_ENV === 'development') {
        console.log("Returning sample data in development mode after token verification failed");
        
        return NextResponse.json({
          success: true,
          vehicle: {
            id: id,
            make: "Toyota",
            model: "Supra",
            year: 2020,
            price: 65000,
            agreedPrice: 62500,
            status: "processing",
            imageUrl: "https://images.unsplash.com/photo-1632245889029-e406faaa34cd?q=80&w=1000",
            images: [
              "https://images.unsplash.com/photo-1632245889029-e406faaa34cd?q=80&w=1000",
              "https://images.unsplash.com/photo-1611016186353-9af58c69a533?q=80&w=1000"
            ],
            inquiryId: "INQ-123",
            dateAgreed: "2023-12-15",
            estimatedDelivery: "2024-03-20",
            specs: {
              engine: "3.0L Inline-6 Turbo",
              transmission: "8-Speed Automatic",
              mileage: 15000,
              color: "Red",
              fuelType: "Petrol",
              bodyType: "Coupe",
              vin: "JT3HP10V5W0007211",
              doors: 2,
              seats: 2,
              features: ["Leather Seats", "Navigation System", "Bluetooth"]
            },
            documents: [],
            timeline: [
              { 
                status: "Inquiry Created", 
                date: "2023-11-30", 
                description: "Initial inquiry submitted", 
                completed: true
              },
              { 
                status: "Price Agreed", 
                date: "2023-12-15", 
                description: "Final price negotiated and agreed", 
                completed: true
              },
              { 
                status: "Processing", 
                date: "2023-12-20", 
                description: "Vehicle being prepared for shipping", 
                completed: true
              },
              { 
                status: "Shipping", 
                date: "2024-01-10", 
                description: "Vehicle in transit", 
                completed: false
              }
            ],
            shipping: {
              status: "In Transit"
            }
          },
          note: "Development mode: Authentication bypassed"
        });
      }
      
      return NextResponse.json({ 
        success: false,
        message: 'Invalid authentication token',
        error: error.message
      }, { status: 401 });
    }
  } catch (error) {
    console.error('Error fetching vehicle detail:', error);
    
    // Development fallback
    if (process.env.NODE_ENV === 'development') {
      console.log("Development mode: Returning sample vehicle after server error");
      
      return NextResponse.json({
        success: true,
        vehicle: {
          id: id,
          make: "Toyota",
          model: "Supra",
          year: 2020,
          price: 65000,
          agreedPrice: 62500,
          status: "processing",
          imageUrl: "https://images.unsplash.com/photo-1632245889029-e406faaa34cd?q=80&w=1000",
          images: [
            "https://images.unsplash.com/photo-1632245889029-e406faaa34cd?q=80&w=1000",
            "https://images.unsplash.com/photo-1611016186353-9af58c69a533?q=80&w=1000"
          ],
          inquiryId: "INQ-123",
          dateAgreed: "2023-12-15",
          estimatedDelivery: "2024-03-20",
          specs: {
            engine: "3.0L Inline-6 Turbo",
            transmission: "8-Speed Automatic",
            mileage: 15000,
            color: "Red",
            fuelType: "Petrol",
            bodyType: "Coupe",
            vin: "JT3HP10V5W0007211",
            doors: 2,
            seats: 2,
            features: ["Leather Seats", "Navigation System", "Bluetooth"]
          },
          documents: [],
          timeline: [
            { 
              status: "Inquiry Created", 
              date: "2023-11-30", 
              description: "Initial inquiry submitted", 
              completed: true
            },
            { 
              status: "Price Agreed", 
              date: "2023-12-15", 
              description: "Final price negotiated and agreed", 
              completed: true
            },
            { 
              status: "Processing", 
              date: "2023-12-20", 
              description: "Vehicle being prepared for shipping", 
              completed: true
            },
            { 
              status: "Shipping", 
              date: "2024-01-10", 
              description: "Vehicle in transit", 
              completed: false
            }
          ],
          shipping: {
            status: "In Transit"
          }
        },
        note: "Development mode: Server error, returning sample data"
      });
    }
    
    return NextResponse.json({ 
      success: false,
      message: 'Internal Server Error',
      error: error.message 
    }, { status: 500 });
  }
} 