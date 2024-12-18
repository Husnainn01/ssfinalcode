"use client"

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from "@/context/ThemeProvider"
import { Toaster } from "@/components/ui/toaster"

export function Providers({ children }) {
  return (
    <ThemeProvider>
      {children}
      <Toaster />
    </ThemeProvider>
  )
} 