// src/models/AdminUser.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Define admin roles
export const ADMIN_ROLES = {
  SUPER_ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer'
};

const adminUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    default: 'admin'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Hash password before saving
adminUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare password
adminUserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Clear any existing model to prevent OverwriteModelError
mongoose.models = {};

const AdminUser = mongoose.model('AdminUser', adminUserSchema);
export default AdminUser;