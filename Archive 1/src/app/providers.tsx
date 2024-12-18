'use client'

import { Auth0Provider } from '@auth0/auth0-react';
import { AuthProvider } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const onRedirectCallback = (appState: any) => {
    router.push(appState?.returnTo || '/customer-dashboard');
  };

  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN || ''}
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || ''}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/auth/callback`,
        scope: 'openid profile email',
      }}
      onRedirectCallback={onRedirectCallback}
      cacheLocation="localstorage"
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </Auth0Provider>
  );
}