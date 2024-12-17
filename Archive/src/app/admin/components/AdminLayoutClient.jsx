"use client"
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import AdminMenu from "../components/template/adminMenu"
import AdminHeader from "../components/template/header"
import { Providers } from "../providers"
import { checkAuth } from "@/utils/auth"
import ErrorBoundary from "@/components/ErrorBoundary"
import { useAuth } from "@/hooks/useAuth";

export default function AdminLayoutClient({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const isLoginPage = pathname === '/admin/login';
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  useEffect(() => {
    console.log("Current pathname:", pathname);
    console.log("Is login page:", isLoginPage);

    const verifyAuth = async () => {
      try {
        console.log("Verifying auth...");
        const authResult = await checkAuth();
        console.log("Auth result:", authResult);
        
        if (!authResult.isAuthenticated && !isLoginPage) {
          console.log("Not authenticated, redirecting to login");
          router.replace('/admin/login');
          return;
        }
        console.log("Authentication successful");
      } catch (error) {
        console.error('Auth verification failed:', error);
        setError(error.message);
        if (!isLoginPage) {
          router.replace('/admin/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [isLoginPage, router]);

  useEffect(() => {
    console.log('AdminLayoutClient - Auth State:', {
      isAuthenticated,
      isLoading,
      user,
    });
  }, [isAuthenticated, isLoading, user]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated && !isLoginPage) {
    console.log('User not authenticated');
    return null;
  }

  if (isLoginPage) {
    return <div className="min-h-screen bg-gray-100">{children}</div>;
  }

  return (
    <Providers>
      <div className="min-h-screen bg-gray-100">
        <AdminHeader />
        <div className="flex">
          <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-gray-900 overflow-y-auto">
            <AdminMenu />
          </aside>
          <main className="flex-1 ml-64 p-6 bg-gray-50">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </Providers>
  );
} 