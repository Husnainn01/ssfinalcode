import mongoose from 'mongoose';

const CarSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  priceCurrency: {
    type: String,
    default: 'USD'
  },
  description: String,
  make: String,
  model: String,
  year: Number,
  mileage: String,
  mileageUnit: String,
  itemCondition: String,
  availability: String,
  vin: String,
  bodyType: String,
  color: String,
  driveWheelConfiguration: String,
  numberOfDoors: String,
  fuelType: String,
  vehicleEngine: String,
  vehicleSeatingCapacity: String,
  vehicleTransmission: String,
  carFeature: [String],
  carSafetyFeature: [String],
  cylinders: String,
  visibility: String
}, {
  collection: 'CarListing'
});

// Check if the model exists before creating it
const CarListing = mongoose.models.CarListing || mongoose.model('CarListing', CarSchema);
export default CarListing;  // Export as CarListing instead of Car
  