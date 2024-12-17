"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  role?: string
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  isLoading: boolean
}

interface CacheData {
  isAuthenticated: boolean
  user: User | null
  timestamp: number | null
}

// Create a cache object outside the hook
const authCache: {
  data: CacheData | null
  timestamp: number | null
  ttl: number
} = {
  data: null,
  timestamp: null,
  ttl: 5 * 60 * 1000 // 5 minutes cache TTL
};

export function useAuth(): AuthState {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Auth check failed');
        }

        const data = await response.json();
        console.log('Auth check response:', data);

        setIsAuthenticated(data.authenticated);
        setUser(data.user);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  return {
    isAuthenticated,
    user,
    isLoading
  }
} 