import mongoose from "mongoose";

export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EDITOR: 'editor',
  MODERATOR: 'moderator',
  VIEWER: 'viewer',
};

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
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
      }],
      inquiries: [{
        type: String,
        enum: ['view_inquiries', 'reply_inquiries', 'archive_inquiries']
      }],
      documents: [{
        type: String,
        enum: ['view_documents', 'create_documents', 'edit_documents', 'delete_documents']
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
    collection: 'users'
  }
);

// Create indexes
roleSchema.index({ name: 1 });

const Role = mongoose.models.users || mongoose.model('users', roleSchema);
export default Role; 