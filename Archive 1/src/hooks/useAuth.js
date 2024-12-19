"use client"
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuth = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      authChecked: false,
      user: null,
      setIsAuthenticated: (value) => {
        console.log('Setting isAuthenticated:', value);
        set({ isAuthenticated: value });
      },
      setAuthChecked: (value) => set({ authChecked: value }),
      setUser: (user) => set({ user }),
      reset: () => set({ isAuthenticated: false, authChecked: false, user: null }),
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
      getStorage: () => localStorage, // Use localStorage for persistence
    }
  )
);

export { useAuth } 