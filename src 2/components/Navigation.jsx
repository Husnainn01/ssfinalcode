"use client"

import { UserButton, useUser } from "@clerk/nextjs"
import Link from "next/link"

export default function Navigation() {
  const { isLoaded, isSignedIn } = useUser()

  return (
    <header className="w-full border-b">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          SS Holdings
        </Link>

        {isLoaded && (
          <div>
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/"/>
            ) : (
              <Link 
                href="/auth/login"
                className="btn btn-primary"
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  )
} 