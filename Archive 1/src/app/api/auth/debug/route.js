import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const mainToken = cookieStore.get('token');
  const customerToken = cookieStore.get('customer_token');

  return NextResponse.json({
    mainToken: mainToken ? 'Present' : 'Missing',
    customerToken: customerToken ? 'Present' : 'Missing',
    allCookies: cookieStore.getAll().map(c => c.name)
  });
} 