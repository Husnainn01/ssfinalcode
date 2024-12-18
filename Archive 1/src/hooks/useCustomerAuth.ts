import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useCustomerAuth() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/user/check', {
          credentials: 'include',
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (!response.ok) {
          throw new Error('Not authenticated');
        }

        const data = await response.json();
        
        if (data.user?.type !== 'customer') {
          throw new Error('Not a customer account');
        }
        
        if (mounted) {
          setUser(data.user);
          setIsAuthenticated(true);
          setIsLoading(false);
        }
      } catch (error) {
        if (error.name === 'AbortError') return;
        
        if (mounted) {
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
          
          if (window.location.pathname.startsWith('/customer-dashboard')) {
            router.push('/auth/login');
          }
        }
      }
    };

    if (!user && !isAuthenticated) {
      checkAuth();
    } else {
      setIsLoading(false);
    }

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [user, isAuthenticated, router]);

  return { user, isAuthenticated, isLoading };
} 