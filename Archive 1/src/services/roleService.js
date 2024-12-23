const BASE_URL = '/api/admin/roles';

export const roleService = {
  // Fetch all roles
  getAllRoles: async () => {
    try {
      const response = await fetch(BASE_URL);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch roles');
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug log

      if (!data || !data.roles) {
        console.warn('No roles data in response');
        return [];
      }

      return data.roles;
    } catch (error) {
      console.error('Get roles error:', error);
      throw new Error(error.message || 'Failed to fetch roles');
    }
  },

  // Create new role
  createRole: async (roleData) => {
    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create role');
      }

      const data = await response.json();
      return data.role;
    } catch (error) {
      console.error('Role creation error:', error);
      throw error;
    }
  },

  // Update role
  updateRole: async (id, roleData) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update role');
      }

      const data = await response.json();
      return data.role;
    } catch (error) {
      console.error('Role update error:', error);
      throw error;
    }
  },

  // Delete role
  deleteRole: async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete role');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Role deletion error:', error);
      throw error;
    }
  },
}; 