import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const customerSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: { 
    type: String, 
    required: [true, 'Last name is required'],
    trim: true
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  emailConfirmation: {
    type: String,
    required: [true, 'Email confirmation is required'],
    validate: {
      validator: function(value) {
        return value === this.email;
      },
      message: 'Emails do not match'
    }
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    select: false
  },
  phoneNumber: {
    number: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    countryCode: {
      type: String,
      required: [true, 'Country code is required'],
      trim: true
    }
  },
  address: {
    postCode: {
      type: String,
      required: [true, 'Post code is required'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true
    },
    port: {
      type: String,
      required: [true, 'Port is required'],
      trim: true
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  lastLogin: Date
}, {
  timestamps: true,
  strict: true
});

// Hash password before saving
customerSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Method to compare password
customerSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    if (!this.password) {
      console.error('No password stored for customer');
      return false;
    }
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw error;
  }
};

// Method to get public profile
customerSchema.methods.getPublicProfile = function() {
  const customerObject = this.toObject();
  delete customerObject.password;
  delete customerObject.emailConfirmation;
  return customerObject;
};

// Create indexes
customerSchema.index({ email: 1 }, { unique: true });
customerSchema.index({ 'address.postCode': 1 });
customerSchema.index({ 'address.country': 1 });

const CustomerUser = mongoose.models.CustomerUser || mongoose.model('CustomerUser', customerSchema);

export default CustomerUser; 