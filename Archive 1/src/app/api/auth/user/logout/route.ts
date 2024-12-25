import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = cookies()
    
    // List of all cookies to clear
    const cookiesToClear = [
      'token',
      'customer_token',
      'next-auth.session-token',
      'next-auth.csrf-token',
      'next-auth.callback-url'
    ]

    // Create Set-Cookie headers for each cookie with proper expiration
    const clearCookieHeaders = cookiesToClear.map(name => {
      cookieStore.delete(name)
      return `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax; Domain=${process.env.NEXT_PUBLIC_DOMAIN || ''}`
    })

    // Create response with all cookie clearing headers
    const response = new NextResponse(
      JSON.stringify({ 
        success: true,
        message: 'Logged out successfully' 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )

    // Add all Set-Cookie headers
    clearCookieHeaders.forEach(header => {
      response.headers.append('Set-Cookie', header)
    })

    return response

  } catch (error) {
    console.error('Logout error:', error)
    return new NextResponse(
      JSON.stringify({ 
        success: false,
        error: 'Logout failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
} 