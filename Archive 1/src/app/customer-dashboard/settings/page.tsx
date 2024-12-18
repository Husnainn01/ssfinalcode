"use client"

import { SettingsForm } from "@/components/customer-dashboard/components/SettingsForm"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      <div className="bg-white shadow rounded-lg p-6">
        <SettingsForm />
      </div>
    </div>
  )
}
