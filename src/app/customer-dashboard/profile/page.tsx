// "use client"

// import { useEffect, useState } from "react"
// import { useRouter } from "next/navigation"
// import { ProfileForm } from "@/components/customer-dashboard/components/ProfileForm"
// import { checkCustomerAuth } from "@/utils/customerAuth"

// export default function ProfilePage() {
//   const router = useRouter()
//   const [isLoading, setIsLoading] = useState(true)

//   useEffect(() => {
//     const verifyAuth = async () => {
//       try {
//         const authState = await checkCustomerAuth()
//         if (!authState.isAuthenticated) {
//           router.push('/auth/login')
//           return
//         }
//         setIsLoading(false)
//       } catch (error) {
//         console.error('Profile auth error:', error)
//         router.push('/auth/login')
//       }
//     }

//     verifyAuth()
//   }, [router])

//   if (isLoading) {
//     return (
//       <div className="container mx-auto py-10">
//         <div className="flex items-center justify-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="container mx-auto py-10">
//       <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
//       <ProfileForm />
//     </div>
//   )
// }

import { ComingSoon } from "@/components/ui/coming-soon"

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function OrdersPage() {
  return (
    <ComingSoon 
      title="Profile - Coming Soon"
      message="View and manage your profile information. This feature will be available soon."
    />
  )
}
