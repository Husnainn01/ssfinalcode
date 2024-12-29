import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  // ... existing fields ...
  stockNumber: {
    type: String,
    required: [true, 'Stock number is required'],
    unique: true, // If you want stock numbers to be unique
    trim: true
  },
  // ... rest of your schema ...
}, {
  timestamps: true
});

// Add index for faster queries
listingSchema.index({ stockNumber: 1 });

const Listing = mongoose.models.Listing || mongoose.model('Listing', listingSchema);

export default Listing; 