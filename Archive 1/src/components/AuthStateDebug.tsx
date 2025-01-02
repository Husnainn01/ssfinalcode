"use client"
import { useAuth } from '@/hooks/useAuth'

// Define a more specific user type for debugging
interface DebugUser {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  [key: string]: any;
}

export function AuthStateDebug() {
  const { isAuthenticated, user, isLoading } = useAuth()
  
  if (process.env.NODE_ENV !== 'development') return null

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs" style={{ zIndex: 100000 }}>
      <pre>
        {JSON.stringify(
          {
            isAuthenticated,
            user: user ? {
              id: (user as DebugUser).id || (user as DebugUser)._id,
              _id: (user as DebugUser)._id,
              name: user.name,
              email: user.email,
              rawUser: user
            } : null,
            isLoading
          },
          null,
          2
        )}
      </pre>
    </div>
  )
} 