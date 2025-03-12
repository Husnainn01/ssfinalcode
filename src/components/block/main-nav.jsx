'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { 
  Car, 
  CarFront, 
  Truck, 
  Bus, 
  CarTaxiFront,
  Combine,
  Tractor,
  Bike,
  Container,
  Forklift,
} from "lucide-react"

export function MainNav() {
  // Using the same static data as leftsidebar
  const staticMakes = [
    { _id: '1', name: 'Toyota' },
    { _id: '2', name: 'Honda' },
    { _id: '3', name: 'Nissan' },
    { _id: '4', name: 'Mazda' },
    { _id: '5', name: 'Suzuki' },
    { _id: '6', name: 'Mitsubishi' },
    { _id: '7', name: 'Daihatsu' },
    { _id: '8', name: 'Subaru' },
    { _id: '9', name: 'Hino' },
    { _id: '10', name: 'Volkswagen' },
  ]

  const staticVehicleTypes = [
    { type: 'Sedan', icon: CarFront },
    { type: 'SUV', icon: Car },
    { type: 'Truck', icon: Truck },
    { type: 'Van', icon: Bus },
    { type: 'Mini Van', icon: CarTaxiFront },
    { type: 'Commercial', icon: Container },
    { type: 'Agricultural', icon: Tractor },
    { type: 'Construction', icon: Forklift },
    { type: 'Machinery', icon: Combine },
    { type: 'Motorcycle', icon: Bike },
  ]

  const staticCountries = [
    { name: 'Japan', flag: '🇯🇵' },
    { name: 'Singapore', flag: '🇸🇬' },
    { name: 'Dubai', flag: '🇦🇪' },
    { name: 'Thailand', flag: '🇹🇭' },
    { name: 'Korea', flag: '🇰🇷' },
    { name: 'Australia', flag: '🇦🇺' },
    { name: 'New Zealand', flag: '🇳🇿' },
    { name: 'Canada', flag: '🇨🇦' },
    { name: 'United States', flag: '🇺🇸' },
    { name: 'United Kingdom', flag: '🇬🇧' },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-2 relative z-50">
      <NavigationMenu className="relative z-50" aria-label="Main Navigation">
        <NavigationMenuList className="gap-8">
          {/* About Dropdown */}
          <NavigationMenuItem>
            <NavigationMenuTrigger 
              className="text-base font-medium bg-transparent text-white hover:bg-white/10 
                data-[state=open]:bg-white/10 hover:text-theme-secondary-hover 
                data-[state=open]:text-theme-secondary-hover transition-all duration-200"
              aria-label="About Menu"
            >
              About
            </NavigationMenuTrigger>
            <NavigationMenuContent className="z-[60]">
              <div className="w-64 p-3 bg-white/95 backdrop-blur-sm rounded-lg 
                shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100/50">
                <Link 
                  href="/about" 
                  className="block px-4 py-2.5 text-[15px] text-gray-700 rounded-md hover:bg-gradient-to-r from-theme-secondary-hover to-transparent hover:text-theme-primary transition-all duration-200"
                  role="menuitem"
                >
                  About Us
                </Link>
                <Link 
                  href="/banking" 
                  className="block px-4 py-2.5 text-[15px] text-gray-700 rounded-md hover:bg-gradient-to-r from-theme-secondary-hover to-transparent hover:text-theme-primary transition-all duration-200"
                  role="menuitem"
                >
                  Banking Information
                </Link>
                <Link 
                  href="/how-to-buy" 
                  className="block px-4 py-2.5 text-[15px] text-gray-700 rounded-md hover:bg-gradient-to-r from-theme-secondary-hover to-transparent hover:text-theme-primary transition-all duration-200"
                  role="menuitem"
                >
                  How to Buy
                </Link>
                <Link 
                  href="/FAQ" 
                  className="block px-4 py-2.5 text-[15px] text-gray-700 rounded-md hover:bg-gradient-to-r from-theme-secondary-hover to-transparent hover:text-theme-primary transition-all duration-200"
                  role="menuitem"
                >
                  FAQ
                </Link>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Stock List Mega Menu */}
          <NavigationMenuItem>
            <NavigationMenuTrigger 
              className="text-base font-medium bg-transparent text-white hover:bg-white/10 
                data-[state=open]:bg-white/10 hover:text-theme-secondary-hover 
                data-[state=open]:text-theme-secondary-hover transition-all duration-200"
              aria-label="Stock List Menu"
            >
              Stock List
            </NavigationMenuTrigger>
            <NavigationMenuContent className="z-[60]">
              <div className="w-[700px] p-3 bg-white/95 backdrop-blur-sm rounded-lg 
                shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100/50">
                <div className="grid grid-cols-[2fr_2fr_1.5fr] divide-x divide-gray-200/60">
                  {/* Search By Make */}
                  <div className="pr-3 border-r border-gray-200/60">
                    <h3 className="text-[16px] font-medium text-theme-primary mb-2 pb-2 border-b border-gray-200/60">
                      Search By Make
                    </h3>
                    <div className="space-y-0.5" role="menu">
                      {staticMakes.map((make) => (
                        <Link 
                          key={make._id}
                          href={`/cars?make=${make.name}`}
                          className="flex items-center justify-between gap-4 px-3 py-2 text-[14px] text-gray-700 rounded-md hover:bg-gradient-to-r from-theme-secondary-hover to-transparent hover:text-theme-primary hover:shadow-sm transition-all duration-200 group"
                          role="menuitem"
                        >
                          <span className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-[#629584]" />
                            <span className="font-medium">{make.name}</span>
                          </span>
                        </Link>
                      ))}
                      <Link 
                        href="/cars"
                        className="flex items-center justify-between gap-4 px-3 py-2 mt-2 text-[14px] text-theme-primary rounded-md hover:bg-gradient-to-r from-theme-secondary-hover to-transparent hover:shadow-sm transition-all duration-200 border-t border-gray-200/60"
                        role="menuitem"
                      >
                        View All Makes
                      </Link>
                    </div>
                  </div>

                  {/* Search By Type */}
                  <div className="px-3 border-r border-gray-200/60">
                    <h3 className="text-[16px] font-medium text-theme-primary mb-2 pb-2 border-b border-gray-200/60">
                      Search By Type
                    </h3>
                    <div className="space-y-0.5" role="menu">
                      {staticVehicleTypes.map((vehicle) => (
                        <Link 
                          key={vehicle.type}
                          href={`/cars?type=${vehicle.type}`}
                          className="flex items-center justify-between gap-4 px-3 py-2 text-[14px] text-gray-700 rounded-md hover:bg-gradient-to-r from-theme-secondary-hover to-transparent hover:text-theme-primary hover:shadow-sm transition-all duration-200 group"
                          role="menuitem"
                        >
                          <span className="flex items-center gap-2">
                            <vehicle.icon className="h-4 w-4 text-[#629584]" />
                            <span className="font-medium">{vehicle.type}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Country List */}
                  <div className="pl-3">
                    <h3 className="text-[16px] font-medium text-theme-primary mb-2 pb-2 border-b border-gray-200/60">
                      Country List
                    </h3>
                    <div className="space-y-0.5" role="menu">
                      {staticCountries.map((country) => (
                        <Link 
                          key={country.name}
                          href={`/cars?country=${country.name}`}
                          className="flex items-center justify-between gap-4 px-3 py-2 text-[14px] text-gray-700 rounded-md hover:bg-gradient-to-r from-theme-secondary-hover to-transparent hover:text-theme-primary hover:shadow-sm transition-all duration-200 group"
                          role="menuitem"
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-base" aria-hidden="true">{country.flag}</span>
                            <span className="font-medium">{country.name}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Regular Links */}
          <NavigationMenuItem>
            <Link 
              href="/auction" 
              className="text-base font-medium text-white hover:text-theme-secondary-hover px-4 py-2 transition-all duration-200"
              role="menuitem"
            >
              Auction
            </Link>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <Link 
              href="/shipping-schedule" 
              className="text-base font-medium text-white hover:text-theme-secondary-hover px-4 py-2 transition-all duration-200"
              role="menuitem"
            >
              Shipping Schedule
            </Link>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <Link 
              href="/contact-us" 
              className="text-base font-medium text-white hover:text-theme-secondary-hover px-4 py-2 transition-all duration-200"
              role="menuitem"
            >
              Contact Us
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
} 