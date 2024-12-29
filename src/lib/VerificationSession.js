import mongoose from 'mongoose';

// Check if the model is already defined
const modelExists = mongoose.models && mongoose.models.VerificationSession;

const verificationSessionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true
  },
  code: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    expires: 600 // TTL index: automatically delete documents after 10 minutes
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Only create the model if it hasn't been created already
const VerificationSession = modelExists 
  ? mongoose.models.VerificationSession 
  : mongoose.model('VerificationSession', verificationSessionSchema);

export default VerificationSession; 