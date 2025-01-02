"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Home, 
  ShoppingBag, 
  User, 
  Settings, 
  Heart,
  ChevronLeft,
  ChevronRight,
  Package,
  FileText,
  Search
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  isOpen: boolean
  setIsOpen?: (isOpen: boolean) => void
}

const menuItems = [
  { 
    icon: Home, 
    label: "Overview", 
    href: "/customer-dashboard" 
  },
  { 
    icon: Heart, 
    label: "Favorites", 
    href: "/customer-dashboard/favorites" 
  },
  { 
    icon: ShoppingBag, 
    label: "Create Order", 
    href: "/customer-dashboard/create-order",
    comingSoon: true
  },
  { 
    icon: Search, 
    label: "Track Shipment", 
    href: "/customer-dashboard/track-shipment",
    comingSoon: true
  },
  { 
    icon: Package, 
    label: "My Orders", 
    href: "/customer-dashboard/orders",
    comingSoon: true
  },
  { 
    icon: FileText, 
    label: "Invoices & Documents", 
    href: "/customer-dashboard/invoices",
    comingSoon: true
  },
  { 
    icon: User, 
    label: "Profile", 
    href: "/customer-dashboard/profile",
    comingSoon: true
  },
  { 
    icon: Settings, 
    label: "Settings", 
    href: "/customer-dashboard/settings" 
  },
]

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside 
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-sm transition-all duration-300 ease-in-out z-20",
        isOpen ? "w-64" : "w-16"
      )}
    >
      <div className="flex flex-col h-full">
        <nav className="flex-1 py-6 px-3">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center h-10 px-3 rounded-lg transition-colors relative group",
                      !isOpen && "justify-center",
                      pathname === item.href 
                        ? "bg-gray-100 text-gray-900" 
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {isOpen && (
                      <div className="flex items-center ml-3">
                        <span>{item.label}</span>
                        {item.comingSoon && (
                          <span className="ml-2 text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
                            Soon
                          </span>
                        )}
                      </div>
                    )}
                    {!isOpen && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                        {item.label}
                        {item.comingSoon && (
                          <span className="ml-1 text-xs px-1.5 py-0.5 bg-primary/20 text-primary-foreground rounded-full">
                            Soon
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="p-3 border-t">
          <button
            onClick={() => setIsOpen?.(!isOpen)}
            className={cn(
              "w-full h-10 flex items-center rounded-lg transition-colors hover:bg-gray-100",
              isOpen ? "justify-end px-3" : "justify-center"
            )}
          >
            {!isOpen ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}
