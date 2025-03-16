import mongoose from 'mongoose';

const QnaSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Please provide a question'],
    trim: true,
  },
  answer: {
    type: String,
    required: [true, 'Please provide an answer'],
    trim: true,
  },
  category: {
    type: String,
    enum: [
      'General Questions',
      'Vehicles & Inventory',
      'Buying & Paying',
      'Booking & Shipping',
      'Documentation',
      'Receiving Your Cargo',
      'Country Regulations',
      'Glossary Of Terms',
      'Other'
    ],
    default: 'General Questions',
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

export default mongoose.models.Qna || mongoose.model('Qna', QnaSchema); 