let customerAuthCache = {
    isAuthenticated: null,
    timestamp: null,
    expiresIn: 5 * 60 * 1000 // Cache for 5 minutes
  };
  
  export async function checkCustomerAuth() {
    try {
      // Check cache first
      const now = Date.now()
      if (
        customerAuthCache.isAuthenticated !== null &&
        customerAuthCache.timestamp &&
        (now - customerAuthCache.timestamp) < customerAuthCache.expiresIn
      ) {
        return {
          isAuthenticated: customerAuthCache.isAuthenticated,
          user: customerAuthCache.user
        }
      }
  
      const response = await fetch('/api/auth/user/check', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Auth check failed')
      }
  
      const data = await response.json();
    //   console.log('Auth check raw response:', data);
  
      // Update cache
      customerAuthCache = {
        isAuthenticated: Boolean(data.isAuthenticated),
        user: data.user,
        timestamp: now,
        expiresIn: 5 * 60 * 1000
      }
  
      return {
        isAuthenticated: Boolean(data.isAuthenticated),
        user: data.user
      };
    } catch (error) {
      console.error('Customer auth check error:', error)
      // Clear cache on error
      clearCustomerAuthCache()
      return {
        isAuthenticated: false,
        user: null
      };
    }
  }
  
  export function clearCustomerAuthCache() {
    customerAuthCache = {
      isAuthenticated: null,
      user: null,
      timestamp: null,
      expiresIn: 5 * 60 * 1000
    };
  }
  
  export function getCustomerToken() {
    if (typeof window === 'undefined') return null
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('customer_token='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
  } 