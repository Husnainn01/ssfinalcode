import mongoose from 'mongoose';

const AgreedVehicleSchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  title: String,
  price: { type: Number, required: true },
  agreedPrice: { type: Number, required: true },
  priceCurrency: { type: String, default: "USD" },
  images: [{ type: String }],
  stockNumber: String,
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipping', 'delivered', 'completed'],
    default: 'processing'
  },
  
  // Link to original inquiry
  inquiryId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inquiry'
  },
  
  // Customer information
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Vehicle specifications
  mileage: String,
  mileageUnit: { type: String, default: "KM" },
  bodyType: String,
  color: String,
  fuelType: String,
  transmission: String,
  engine: String,
  cylinders: String,
  doors: String,
  seatingCapacity: String,
  driveWheelConfiguration: String,
  vin: String,
  features: [String],
  safetyFeatures: [String],
  
  // Delivery details
  estimatedDelivery: Date,
  dateAgreed: Date,
  agreementNotes: String,
  shipping: {
    trackingNumber: String,
    carrier: String,
    estimatedDelivery: Date
  },
  
  // Additional metadata
  country: String,
  category: String,
  section: String,
  offerType: String,
  availability: String,
  itemCondition: String,
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create a text index for search
AgreedVehicleSchema.index({ 
  make: 'text', 
  model: 'text', 
  title: 'text',
  vin: 'text'
});

// Make sure we create or use the existing model
const AgreedVehicle = mongoose.models.AgreedVehicle || mongoose.model('AgreedVehicle', AgreedVehicleSchema);

export default AgreedVehicle; 