import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode('chendanvasu');

export async function checkAdminAuth() {
  try {
    const response = await fetch('/api/admin/auth/check', {
      credentials: 'include',
      headers: {
        'Admin-Auth': 'true'
      }
    });
    
    if (!response.ok) {
      throw new Error('Auth check failed');
    }

    const data = await response.json();
    return {
      isAuthenticated: data.authenticated,
      user: data.user
    };
  } catch (error) {
    console.error('Admin auth check failed:', error);
    return {
      isAuthenticated: false,
      user: null
    };
  }
}

export function getAdminToken() {
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('admin_token='));
  return tokenCookie ? tokenCookie.split('=')[1] : null;
}

export async function verifyAdminToken(token) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload.role === 'admin';
  } catch {
    return false;
  }
}
