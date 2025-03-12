import mongoose from 'mongoose';

const portSchema = new mongoose.Schema({
  region: {
    type: String,
    required: [true, 'Region is required'],
    enum: ['Africa', 'Asia', 'Europe', 'Middle East', 'Oceania']
  },
  name: {
    type: String,
    required: [true, 'Port name is required'],
    uppercase: true,
    trim: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add a unique compound index on region and name
portSchema.index({ region: 1, name: 1 }, { unique: true });

const Port = mongoose.models.Port || mongoose.model('Port', portSchema);

export default Port; 