"use client"
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuth = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      authChecked: false,
      user: null,
      
      // Update authentication state
      setIsAuthenticated: (value) => {
        console.log('Setting isAuthenticated:', value);
        set({ isAuthenticated: value });
      },
      
      setAuthChecked: (value) => set({ authChecked: value }),
      
      // Update user with role information
      setUser: (user) => {
        console.log('Setting user:', { ...user, password: undefined });
        set({ user });
      },
      
      // Check if user has specific role
      hasRole: (role) => {
        const user = get().user;
        return user?.role === role;
      },
      
      // Check if user has specific permission
      hasPermission: (resource, action) => {
        const user = get().user;
        if (!user || !user.role) return false;
        
        const ROLE_PERMISSIONS = {
          admin: ['view', 'create', 'edit', 'delete'],
          editor: ['view', 'create', 'edit'],
          moderator: ['view', 'edit', 'delete'],
          viewer: ['view']
        };
        
        return ROLE_PERMISSIONS[user.role]?.includes(action.split('_')[0]) || false;
      },
      
      // Reset auth state
      reset: () => set({ 
        isAuthenticated: false, 
        authChecked: false, 
        user: null 
      }),
      
      // Get current user role
      getRole: () => get().user?.role || null,
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        authChecked: state.authChecked
      })
    }
  )
);

export { useAuth } 