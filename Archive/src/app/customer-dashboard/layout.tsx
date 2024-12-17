import DashboardLayout from "@/components/customer-dashboard/DashboardLayout"

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}
