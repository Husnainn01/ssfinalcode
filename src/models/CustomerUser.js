import mongoose from "mongoose";

const customerUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      default: 'customer'
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  {
    timestamps: true,
    collection: 'customerusers' // Explicitly set the collection name
  }
);

// Create indexes
customerUserSchema.index({ email: 1 });

// Check if the model exists before creating it
const CustomerUser = mongoose.models.CustomerUser || mongoose.model('CustomerUser', customerUserSchema);

export default CustomerUser; 