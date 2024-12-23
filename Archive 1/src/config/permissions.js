export const ROLE_PERMISSIONS = {
  admin: {
    users: ['view_users', 'create_users', 'edit_users', 'delete_users'],
    roles: ['view_roles', 'create_roles', 'edit_roles', 'delete_roles'],
    // Car Management Permissions
    listings: ['view_listings', 'create_listings', 'edit_listings', 'delete_listings'],
    makes: ['view_makes', 'create_makes', 'edit_makes', 'delete_makes'],
    models: ['view_models', 'create_models', 'edit_models', 'delete_models'],
    colors: ['view_colors', 'create_colors', 'edit_colors', 'delete_colors'],
    features: ['view_features', 'create_features', 'edit_features', 'delete_features'],
    safety: ['view_safety', 'create_safety', 'edit_safety', 'delete_safety'],
    types: ['view_types', 'create_types', 'edit_types', 'delete_types'],
    // Content Management Permissions
    blog: ['view_posts', 'create_posts', 'edit_posts', 'delete_posts'],
    categories: ['view_categories', 'create_categories', 'edit_categories', 'delete_categories'],
    settings: ['view_settings', 'edit_settings']
  },
  editor: {
    // Can manage listings and content
    listings: ['view_listings', 'create_listings', 'edit_listings'],
    makes: ['view_makes', 'create_makes', 'edit_makes'],
    models: ['view_models', 'create_models', 'edit_models'],
    colors: ['view_colors', 'create_colors', 'edit_colors'],
    features: ['view_features', 'create_features', 'edit_features'],
    safety: ['view_safety', 'create_safety', 'edit_safety'],
    types: ['view_types', 'create_types', 'edit_types'],
    blog: ['view_posts', 'create_posts', 'edit_posts'],
    categories: ['view_categories', 'create_categories', 'edit_categories']
  },
  moderator: {
    // Can moderate listings and content
    listings: ['view_listings', 'edit_listings', 'delete_listings'],
    makes: ['view_makes', 'create_makes', 'edit_makes'],
    models: ['view_models', 'create_models', 'edit_models'],
    colors: ['view_colors', 'create_colors', 'edit_colors'],
    features: ['view_features', 'create_features', 'edit_features'],
    safety: ['view_safety', 'create_safety', 'edit_safety'],
    types: ['view_types', 'create_types', 'edit_types'],
    blog: ['view_posts', 'create_posts', 'edit_posts'],
    categories: ['view_categories', 'create_categories', 'edit_categories']
  },
  viewer: {
    // Can only view
    listings: ['view_listings'],
    makes: ['view_makes'],
    models: ['view_models'],
    colors: ['view_colors'],
    features: ['view_features'],
    safety: ['view_safety'],
    types: ['view_types'],
    blog: ['view_posts'],
    categories: ['view_categories']
  }
};

// Helper function to check permissions
export const hasPermission = (userRole, resource, action) => {
  if (!ROLE_PERMISSIONS[userRole]) return false;
  return ROLE_PERMISSIONS[userRole][resource]?.includes(action) || false;
}; 