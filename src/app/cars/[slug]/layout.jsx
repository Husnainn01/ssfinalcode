export const dynamic = 'force-dynamic';
export const runtime = 'edge';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function CarDetailsLayout({
  children,
  params
}) {
  try {
    // Check authentication if needed
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      redirect('/auth/login');
    }

    return (
      <div>
        {children}
      </div>
    );
  } catch (error) {
    console.error('Car details layout error:', error);
    return (
      <div>
        <p>Error loading page</p>
      </div>
    );
  }
} 