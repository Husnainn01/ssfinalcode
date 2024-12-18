import { jwtVerify } from 'jose';

// Increase cache duration to reduce frequency of checks
let authCache = {
  isAuthenticated: null,
  timestamp: null,
  expiresIn: 5 * 60 * 1000 // Cache for 5 minutes
};

// Add debounce utility
let authCheckPromise = null;
const debounceTime = 1000; // 1 second

export async function checkAuth() {
  try {
    const response = await fetch('/api/admin/auth/check', {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();
    console.log('Auth check response:', data);

    return {
      isAuthenticated: data.authenticated,
      user: data.user
    };
  } catch (error) {
    console.error('Auth check error:', error);
    return {
      isAuthenticated: false,
      user: null
    };
  }
}

// Clear cache when needed (e.g., on logout)
export function clearAuthCache() {
  authCache = {
    isAuthenticated: null,
    timestamp: null,
    expiresIn: 60 * 1000
  };
}

export function getToken() {
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
  return tokenCookie ? tokenCookie.split('=')[1] : null;
}
