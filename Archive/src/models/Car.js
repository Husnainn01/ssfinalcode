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
  collection: 'CarListing' // Specify the correct collection name
});

const Car = mongoose.models.Car || mongoose.model('Car', CarSchema);
export default Car; 