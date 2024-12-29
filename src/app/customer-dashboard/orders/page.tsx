// "use client"

// import { OrdersTable } from "@/components/customer-dashboard/components/OrdersTable"

// export default function OrdersPage() {
//   return (
//     <div className="space-y-6">
//       <h2 className="text-3xl font-bold tracking-tight">My Orders</h2>
//       <div className="bg-white shadow rounded-lg">
//         <OrdersTable />
//       </div>
//     </div>
//   )
// }

import { ComingSoon } from "@/components/ui/coming-soon"

export default function OrdersPage() {
  return (
    <ComingSoon 
      title="My Orders - Coming Soon"
      message="View and manage all your orders in one place. This feature will be available soon."
    />
  )
}