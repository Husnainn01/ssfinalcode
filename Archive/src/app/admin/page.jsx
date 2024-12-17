"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { checkAuth } from "@/utils/auth";
// import { adminMetadata } from '../metadata'

export default function AdminPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const isAuthenticated = await checkAuth();
        console.log('Auth status:', isAuthenticated);
        
        if (isAuthenticated) {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [])

  if (!isLoading) {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
    </div>
  )
}
