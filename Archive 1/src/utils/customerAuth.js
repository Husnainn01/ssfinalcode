let customerAuthCache = {
    isAuthenticated: null,
    timestamp: null,
    expiresIn: 5 * 60 * 1000 // Cache for 5 minutes
  };
  
  export async function checkCustomerAuth() {
    try {
      console.log('Starting auth check...');
      console.log('Current cookies:', document.cookie);
      
      const response = await fetch('/api/auth/user/check', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        console.error('Auth check failed:', response.status, response.statusText);
        throw new Error('Auth check failed');
      }
  
      const data = await response.json();
      console.log('Auth check raw response:', data);
  
      const authState = {
        isAuthenticated: Boolean(data.isAuthenticated),
        user: data.user
      };
      
      console.log('Processed auth state:', authState);
      return authState;
    } catch (error) {
      console.error('Customer auth check error:', error);
      return {
        isAuthenticated: false,
        user: null
      };
    }
  }
  
  export function clearCustomerAuthCache() {
    customerAuthCache = {
      isAuthenticated: null,
      timestamp: null,
      expiresIn: 60 * 1000
    };
  }
  
  export function getCustomerToken() {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('customer_token='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
  } 