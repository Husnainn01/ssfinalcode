import { redirect } from 'next/navigation';
import DashboardLayout from "@/components/customer-dashboard/DashboardLayout"
import { verifyCustomerAuth } from '@/lib/customerAuth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const auth = await verifyCustomerAuth();
    
    console.log('Customer auth result:', auth); // Debug log
    
    if (!auth.success) {
      console.log('Auth failed, redirecting to login'); // Debug log
      redirect('/auth/login');
    }

    return (
      <DashboardLayout>
        {children}
      </DashboardLayout>
    )
  } catch (error) {
    console.error('Layout error:', error); // Debug log
    redirect('/auth/login');
  }
}
