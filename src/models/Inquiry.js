import mongoose from 'mongoose';

const InquirySchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'answered', 'resolved', 'agreed', 'completed', 'closed'],
    default: 'pending'
  },
  category: {
    type: String,
    enum: ['vehicle', 'general', 'support'],
    default: 'vehicle'
  },
  
  // Customer information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  customerCreatedAt: Date,
  
  // Vehicle information (if category is 'vehicle')
  vehicleMake: String,
  vehicleModel: String,
  vehicleYear: Number,
  price: Number,
  
  // Reference to vehicle if created from this inquiry
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  
  // Price agreement information
  agreedPrice: { type: Number },
  dateAgreed: { type: Date },
  agreementNotes: String,
  estimatedDelivery: Date,
  
  // Replies/conversation
  replies: [{
    message: {
      type: String,
      required: true
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    adminName: String,
    adminId: mongoose.Schema.Types.ObjectId,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Reference to vehicle in the vehicle collection
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AgreedVehicle'
  },
  
  // Reference to customer
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Update the updatedAt field on save
InquirySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Check if model exists to prevent overwrite during hot reloads
const Inquiry = mongoose.models.Inquiry || mongoose.model('Inquiry', InquirySchema);

export default Inquiry; 