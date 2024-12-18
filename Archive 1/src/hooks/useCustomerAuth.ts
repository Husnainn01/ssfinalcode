import { useState, useEffect } from 'react';
import { checkCustomerAuth } from '@/utils/customerAuth';

export function useCustomerAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await checkCustomerAuth();
        setIsAuthenticated(result.isAuthenticated);
        setUser(result.user);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { isAuthenticated, user, isLoading };
} 