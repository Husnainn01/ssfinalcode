import mongoose from 'mongoose';

const VehicleSchema = new mongoose.Schema({
  make: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  stockNo: {
    type: String,
    required: true,
    unique: true
  },
  images: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['available', 'sold', 'reserved'],
    default: 'available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent overwriting the model if it already exists
const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema);

export default Vehicle; 