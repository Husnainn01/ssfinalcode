"use client"

import { create } from 'zustand'
import { useEffect } from 'react'

interface AuthState {
  isAuthenticated: boolean
  user: any | null
  isLoading: boolean
  error: string | null
  lastChecked: number | null
  checkAuth: () => Promise<void>
  setAuth: (data: { isAuthenticated: boolean; user: any }) => void
  clearAuth: () => void
}

const CACHE_DURATION = 30000 // 30 seconds

const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  error: null,
  lastChecked: null,
  checkAuth: async () => {
    const state = get()
    
    // Check if we have recently checked auth status
    if (state.lastChecked && Date.now() - state.lastChecked < CACHE_DURATION) {
      return // Skip check if within cache duration
    }

    try {
      set({ isLoading: true, error: null })
      const response = await fetch('/api/auth/user/check', {
        credentials: 'include'
      })
      const data = await response.json()
      
      set({ 
        isAuthenticated: data.authenticated,
        user: data.user, 
        isLoading: false,
        lastChecked: Date.now()
      })
    } catch (error) {
      console.error('Auth check error:', error)
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Authentication check failed',
        isAuthenticated: false,
        user: null,
        lastChecked: Date.now()
      })
    }
  },
  setAuth: (data) => set({ 
    isAuthenticated: data.isAuthenticated, 
    user: data.user,
    isLoading: false,
    error: null,
    lastChecked: Date.now()
  }),
  clearAuth: () => set({ 
    isAuthenticated: false, 
    user: null,
    isLoading: false,
    error: null,
    lastChecked: null
  })
}))

export function useCustomerAuth() {
  const store = useAuthStore()

  useEffect(() => {
    // Only check auth if it hasn't been checked recently
    if (!store.lastChecked || Date.now() - store.lastChecked >= CACHE_DURATION) {
      store.checkAuth()
    }
  }, []) // Empty dependency array to run only on mount

  return store
} 