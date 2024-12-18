import { redirect } from 'next/navigation';
import DashboardLayout from "@/components/customer-dashboard/DashboardLayout"
import { verifyCustomerAuth } from '@/lib/customerAuth';

export default async function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const auth = await verifyCustomerAuth();
  
  if (!auth.success) {
    redirect('/auth/login');
  }

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  )
}
