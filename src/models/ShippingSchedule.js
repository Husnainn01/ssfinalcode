import mongoose from 'mongoose';

const shippingScheduleSchema = new mongoose.Schema({
  voyageNo: {
    type: String,
    required: [true, 'Voyage number is required'],
    unique: true
  },
  company: {
    type: String,
    required: [true, 'Shipping company is required']
  },
  shipName: {
    type: String,
    required: [true, 'Ship name is required']
  },
  japanPorts: [{
    type: String,
    required: [true, 'At least one Japan port is required']
  }],
  destinationPorts: [{
    type: String,
    required: [true, 'At least one destination port is required']
  }],
  estimatedTime: {
    type: Number,
    required: [true, 'Estimated time is required']
  },
  departureDate: {
    type: Date,
    required: [true, 'Departure date is required']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const ShippingSchedule = mongoose.models.ShippingSchedule || 
  mongoose.model('ShippingSchedule', shippingScheduleSchema);

export default ShippingSchedule; 