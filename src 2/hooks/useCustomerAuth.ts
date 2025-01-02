"use client"

import { create } from 'zustand'
import { useEffect } from 'react'
import { checkCustomerAuth } from '@/utils/customerAuth'

interface AuthState {
  isAuthenticated: boolean
  user: any | null
  isLoading: boolean
  error: string | null
  checkAuth: () => Promise<void>
  setAuth: (data: { isAuthenticated: boolean; user: any }) => void
  clearAuth: () => void
}

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  error: null,
  checkAuth: async () => {
    try {
      set({ isLoading: true, error: null })
      const response = await fetch('/api/auth/user/check', {
        credentials: 'include'
      })
      const data = await response.json()
      console.log('Auth check response:', data)
      
      set({ 
        isAuthenticated: data.authenticated,
        user: data.user, 
        isLoading: false 
      })
    } catch (error) {
      console.error('Auth check error:', error)
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Authentication check failed',
        isAuthenticated: false,
        user: null
      })
    }
  },
  setAuth: (data) => set({ 
    isAuthenticated: data.isAuthenticated, 
    user: data.user,
    isLoading: false,
    error: null
  }),
  clearAuth: () => set({ 
    isAuthenticated: false, 
    user: null,
    isLoading: false,
    error: null
  })
}))

export function useCustomerAuth() {
  const store = useAuthStore()

  useEffect(() => {
    // Check auth status when component mounts
    store.checkAuth()
  }, []) // Remove the interval to simplify debugging

  return store
} 