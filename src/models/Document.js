import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    required: true,
    enum: ['invoice', 'purchase_agreement', 'shipping_document', 'customs_document', 'other']
  },
  url: { 
    type: String, 
    required: true 
  },
  publicId: {
    type: String, 
    required: true 
  },
  vehicleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'AgreedVehicle',
    required: true 
  },
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer' 
  },
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin'
  },
  size: { 
    type: Number 
  },
  mimeType: { 
    type: String 
  },
  originalName: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    default: 'active',
    enum: ['active', 'archived', 'deleted'] 
  },
  uploadedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'vehicleDocuments' // Explicitly set collection name
});

const Document = mongoose.models.Document || mongoose.model('Document', DocumentSchema);

export default Document; 