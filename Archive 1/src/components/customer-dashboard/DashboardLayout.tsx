"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "./Sidebar"
import { Navbar } from "./Navbar"
import { cn } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="pt-16 relative">
        <Sidebar 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen}
        />
        <main 
          className={cn(
            "min-h-[calc(100vh-4rem)] transition-all duration-300 ease-in-out p-8",
            isSidebarOpen ? "ml-64" : "ml-16"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
