let customerAuthCache = {
  isAuthenticated: null,
  timestamp: null,
  expiresIn: 5 * 60 * 1000 // Cache for 5 minutes
};

export async function checkCustomerAuth() {
  try {
    const response = await fetch('/api/customer/auth/check', {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();
    return {
      isAuthenticated: data.authenticated,
      user: data.user
    };
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