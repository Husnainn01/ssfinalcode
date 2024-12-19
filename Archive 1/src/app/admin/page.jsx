"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { checkAuth } from "@/utils/auth"

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      try {
        const { isAuthenticated } = await checkAuth();
        if (isAuthenticated) {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/admin/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.replace('/admin/login');
      }
    };

    init();
  }, [router]);

  // Return loading state or null
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}
