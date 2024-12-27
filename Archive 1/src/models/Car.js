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
  visibility: String,
  images: {
    type: [String],
    default: []
  },
  image: String,
  stockNumber: String,
  date: {
    type: Date,
    default: Date.now
  },
  steering: String,
  seats: String,
  engineCode: String,
  driveType: String,
  country: String,
  category: String,
  section: {
    type: String,
    enum: ['recent', 'popular'],
    default: 'recent'
  },
  offerType: {
    type: String,
    enum: ['In Stock', 'Sold'],
    default: 'In Stock'
  }
}, {
  collection: 'CarListing',
  timestamps: true,
  strict: false
});

CarSchema.pre('save', function(next) {
  if (!this.image && this.images && this.images.length > 0) {
    this.image = this.images[0];
  }
  next();
});

const CarListing = mongoose.models.CarListing || mongoose.model('CarListing', CarSchema);
export default CarListing;  // Export as CarListing instead of Car
  