"use client"
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import AdminMenu from "./template/adminMenu"
import AdminHeader from "./template/header"
import ErrorBoundary from "@/components/ErrorBoundary"
import { useAuth } from "@/hooks/useAuth"
import { checkAdminAuth } from "@/utils/auth"

export default function AdminLayoutClient({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const isLoginPage = pathname === '/admin/login';
  const auth = useAuth();

  useEffect(() => {
    const verifyAdminAuth = async () => {
      if (!auth.authChecked || auth.isAuthenticated) {
        try {
          const { isAuthenticated, user } = await checkAdminAuth();
          
          if (!isAuthenticated) {
            auth.reset();
            if (!isLoginPage) {
              router.replace('/admin/login');
            }
          } else {
            auth.setIsAuthenticated(true);
            auth.setAuthChecked(true);
            auth.setUser(user);
          }
        } catch (error) {
          console.error('Admin verification failed:', error);
          auth.reset();
          if (!isLoginPage) {
            router.replace('/admin/login');
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    verifyAdminAuth();
  }, [pathname, auth.authChecked, auth.isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only return children without layout for login page
  if (isLoginPage) {
    return children;
  }

  // Return null for unauthenticated users on non-login pages
  if (!auth.isAuthenticated && !isLoginPage) {
    return null;
  }

  // For authenticated pages, render with admin layout
  return (
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
  );
} 