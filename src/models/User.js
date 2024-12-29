import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    lastName: {
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
    role: {
      type: String,
      required: true,
    },
    permissions: {
      users: [{
        type: String,
        enum: ['view_users', 'create_users', 'edit_users', 'delete_users']
      }],
      posts: [{
        type: String,
        enum: ['view_posts', 'create_posts', 'edit_posts', 'delete_posts']
      }],
      settings: [{
        type: String,
        enum: ['view_settings', 'edit_settings']
      }],
      roles: [{
        type: String,
        enum: ['view_roles', 'create_roles', 'edit_roles', 'delete_roles']
      }]
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  {
    timestamps: true,
    collection: 'users' // Explicitly set the collection name
  }
);

// Create indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Check if the model exists before creating it
const User = mongoose.models.users || mongoose.model('users', userSchema);

export default User; 