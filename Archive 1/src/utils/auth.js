import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode('chendanvasu');

export async function checkAdminAuth() {
  try {
    console.log('Checking admin auth...');
    const response = await fetch('/api/admin/auth/check', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    const data = await response.json();
    console.log('Auth check response:', data);

    if (!response.ok) {
      console.log('Auth check failed:', data.message);
      return { isAuthenticated: false, user: null };
    }

    return {
      isAuthenticated: true,
      user: data.user
    };
  } catch (error) {
    console.error('Auth check error:', error);
    return { isAuthenticated: false, user: null };
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
