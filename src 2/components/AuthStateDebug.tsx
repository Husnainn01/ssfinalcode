"use client"
import { useAuth } from '@/hooks/useAuth'

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
              id: user.id || user._id,
              _id: user._id,
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