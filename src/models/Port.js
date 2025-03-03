import mongoose from 'mongoose';

const portSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Port name is required'],
    unique: true
  },
  country: {
    type: String,
    required: [true, 'Country is required']
  },
  region: {
    type: String,
    required: [true, 'Region is required'],
    enum: ['Africa', 'Europe', 'Middle East', 'Asia', 'Oceania']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Port = mongoose.models.Port || mongoose.model('Port', portSchema);

export default Port; 