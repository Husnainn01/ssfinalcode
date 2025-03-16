import mongoose from 'mongoose';

const NoticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Please provide content'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'error'],
    default: 'info',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  showOnPages: {
    type: [String],
    default: ['all'],
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 30*24*60*60*1000), // 30 days from now
  },
  position: {
    type: String,
    enum: ['top', 'bottom'],
    default: 'top',
  }
}, { timestamps: true });

export default mongoose.models.Notice || mongoose.model('Notice', NoticeSchema); 