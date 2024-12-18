import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = cookies()
    
    // Clear the customer auth cookie specifically
    cookieStore.delete('customer_token')

    return NextResponse.json(
      { message: 'Logged out successfully' },
      {
        status: 200,
        headers: {
          // Also set cookie clearing header for extra security
          'Set-Cookie': 'customer_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax'
        }
      }
    )
  } catch (error) {
    console.error('Customer logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
} 