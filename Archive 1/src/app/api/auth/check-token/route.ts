import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')

  return NextResponse.json({
    hasToken: !!token,
    tokenDetails: token ? {
      name: token.name,
      present: true
    } : null
  })
} 