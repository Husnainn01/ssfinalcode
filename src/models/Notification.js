import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'CustomerUser'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['inquiry', 'order', 'document', 'payment', 'system', 'alert', 'update'],
    default: 'system'
  },
  inquiryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomerInquiry'
  },
  details: [{
    label: String,
    value: String
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'customerNotifications'
});

// Clear any existing model to prevent OverwriteModelError
mongoose.models = {};

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification; 