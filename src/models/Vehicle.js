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
  section: {
    type: String,
    enum: ['popular', 'bestValue', 'premium', 'performance'],
    default: null
  },
  slug: {
    type: String,
    unique: true,
    sparse: true,
    default: function() {
      return `${this.make}-${this.model}-${this.year}-${this.stockNo}`.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
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

// Add an index for faster queries
VehicleSchema.index({ section: 1, status: 1 });
VehicleSchema.index({ slug: 1 });

// Update the updatedAt field on save
VehicleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema);

export default Vehicle; 