"use client"

import { ProfileForm } from "@/components/customer-dashboard/components/ProfileForm"

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
      <div className="bg-white shadow rounded-lg p-6">
        <ProfileForm />
      </div>
    </div>
  )
}
