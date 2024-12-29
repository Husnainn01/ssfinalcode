"use client"

import { useAuth } from "@/hooks/useAuth"
import { useState, useEffect } from "react"

export function AuthDebug() {
  const { isAuthenticated, user } = useAuth()
  const [tokenInfo, setTokenInfo] = useState<any>(null)

  useEffect(() => {
    const checkToken = async () => {
      try {
        // Check client-side cookies
        const clientToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1]

        // Check HTTP-only cookies via API
        const response = await fetch('/api/auth/check-token', {
          credentials: 'include'
        })
        const data = await response.json()

        setTokenInfo({
          clientToken: clientToken ? 'Present' : 'Not found',
          httpOnlyToken: data.hasToken ? 'Present' : 'Not found'
        })
      } catch (error) {
        console.error('Token check failed:', error)
        setTokenInfo({
          error: 'Failed to check token',
          details: error.message
        })
      }
    }

    checkToken()
  }, [])

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-lg font-bold mb-4">Auth Debug Info</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Auth Status:</h3>
          <pre className="bg-white p-2 rounded">
            {JSON.stringify({ isAuthenticated, user }, null, 2)}
          </pre>
        </div>

        <div>
          <h3 className="font-semibold">Token Info:</h3>
          <pre className="bg-white p-2 rounded">
            {JSON.stringify(tokenInfo, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
} 