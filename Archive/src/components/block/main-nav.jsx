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

export function MainNav() {
  // Import static data from leftsidebar
  const staticMakes = [
    { _id: '1', name: 'Toyota', count: 15023 },
    { _id: '2', name: 'Honda', count: 12045 },
    { _id: '3', name: 'Nissan', count: 10234 },
    { _id: '4', name: 'Mazda', count: 8567 },
    { _id: '5', name: 'Suzuki', count: 7890 },
    { _id: '6', name: 'Mitsubishi', count: 6543 },
    { _id: '7', name: 'Daihatsu', count: 5987 },
    { _id: '8', name: 'Subaru', count: 5432 },
    { _id: '9', name: 'Lexus', count: 4321 },
    { _id: '10', name: 'Infiniti', count: 3210 },
    { _id: '11', name: 'Hyundai', count: 2109 },
    { _id: '12', name: 'Kia', count: 1987 },
    { _id: '13', name: 'Volkswagen', count: 1765 },
    { _id: '14', name: 'Volvo', count: 1543 },
    { _id: '15', name: 'Mercedes-Benz', count: 1321 },
  ]

  const staticVehicleTypes = [
    { type: 'Sedan', count: 25678 },
    { type: 'SUV', count: 20456 },
    { type: 'Truck', count: 15789 },
    { type: 'Van', count: 12345 },
    { type: 'Mini Van', count: 10234 },
    { type: 'Commercial', count: 9876 },
    { type: 'Coupe', count: 6543 },
    { type: 'Convertible', count: 5432 },
    { type: 'Hatchback', count: 4321 },
    { type: 'Wagon', count: 3210 },
    { type: 'Pickup', count: 2109 },
    { type: 'Bus', count: 1987 },
    { type: 'Other', count: 1765 },
  ]

  const staticCountries = [
    { name: 'Japan', flag: '🇯🇵', count: 45678 },
    { name: 'Singapore', flag: '🇸🇬', count: 8765 },
    { name: 'Dubai', flag: '🇦🇪', count: 5432 },
    { name: 'Thailand', flag: '🇹🇭', count: 3210 },
    { name: 'Korea', flag: '🇰🇷', count: 2109 },
    { name: 'Australia', flag: '🇦🇺', count: 1987 },
    { name: 'New Zealand', flag: '🇳🇿', count: 1765 },
    { name: 'Canada', flag: '🇨🇦', count: 1543 },
    { name: 'United States', flag: '🇺🇸', count: 1321 },
    { name: 'United Kingdom', flag: '🇬🇧', count: 1109 },
    { name: 'Germany', flag: '🇩🇪', count: 987 },
    { name: 'France', flag: '🇫🇷', count: 876 },
    { name: 'Italy', flag: '🇮🇹', count: 765 },
  ]
  

  return (
    <div className="mx-auto max-w-7xl px-4 py-2">
      <NavigationMenu>
        <NavigationMenuList className="gap-8">
          {/* About Dropdown */}
          <NavigationMenuItem>
            <NavigationMenuTrigger 
              className="text-base font-medium bg-transparent text-white hover:bg-white/10 data-[state=open]:bg-white/10 hover:text-theme-secondary-hover data-[state=open]:text-theme-secondary-hover transition-all duration-200"
            >
              About
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="w-64 p-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100/50">
                <Link 
                  href="/about" 
                  className="block px-4 py-2.5 text-[15px] text-gray-700 rounded-md hover:bg-gradient-to-r from-theme-secondary-hover to-transparent hover:text-theme-primary transition-all duration-200"
                >
                  About Us
                </Link>
                <Link 
                  href="/banking" 
                  className="block px-4 py-2.5 text-[15px] text-gray-700 rounded-md hover:bg-gradient-to-r from-theme-secondary-hover to-transparent hover:text-theme-primary transition-all duration-200"
                >
                  Banking Information
                </Link>
                <Link 
                  href="/how-to-buy" 
                  className="block px-4 py-2.5 text-[15px] text-gray-700 rounded-md hover:bg-gradient-to-r from-theme-secondary-hover to-transparent hover:text-theme-primary transition-all duration-200"
                >
                  How to Buy
                </Link>
                <Link 
                  href="/FAQ" 
                  className="block px-4 py-2.5 text-[15px] text-gray-700 rounded-md hover:bg-gradient-to-r from-theme-secondary-hover to-transparent hover:text-theme-primary transition-all duration-200"
                >
                  FAQ
                </Link>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Stock List Mega Menu */}
          <NavigationMenuItem>
            <NavigationMenuTrigger 
              className="text-base font-medium bg-transparent text-white hover:bg-white/10 data-[state=open]:bg-white/10 hover:text-theme-secondary-hover data-[state=open]:text-theme-secondary-hover transition-all duration-200"
            >
              Stock List
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="w-[700px] p-3 bg-white/95 backdrop-blur-sm rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100/50">
                <div className="grid grid-cols-[2fr_2fr_1.5fr] divide-x divide-gray-200/60">
                  {/* Search By Make */}
                  <div className="pr-3 border-r border-gray-200/60">
                    <h3 className="text-[16px] font-medium text-theme-primary mb-2 pb-2 border-b border-gray-200/60">
                      Search By Make
                    </h3>
                    <div className="space-y-0.5">
                      {staticMakes.map((make) => (
                        <Link 
                          key={make._id}
                          href={`/cars/make/${make.name.toLowerCase()}`}
                          className="flex items-center justify-between gap-4 px-3 py-2 text-[14px] text-gray-700 rounded-md hover:bg-gradient-to-r from-theme-secondary-hover to-transparent hover:text-theme-primary hover:shadow-sm transition-all duration-200 group"
                        >
                          <span className="font-medium">{make.name}</span>
                          <span className="text-gray-500 text-[13px] group-hover:text-theme-primary/70 shrink-0">
                            ({make.count.toLocaleString()})
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Search By Type */}
                  <div className="px-3 border-r border-gray-200/60">
                    <h3 className="text-[16px] font-medium text-theme-primary mb-2 pb-2 border-b border-gray-200/60">
                      Search By Type
                    </h3>
                    <div className="space-y-0.5">
                      {staticVehicleTypes.map((vehicle) => (
                        <Link 
                          key={vehicle.type}
                          href={`/type/${vehicle.type.toLowerCase()}`}
                          className="flex items-center justify-between gap-4 px-3 py-2 text-[14px] text-gray-700 rounded-md hover:bg-gradient-to-r from-theme-secondary-hover to-transparent hover:text-theme-primary hover:shadow-sm transition-all duration-200 group"
                        >
                          <span className="font-medium">{vehicle.type}</span>
                          <span className="text-gray-500 text-[13px] group-hover:text-theme-primary/70 shrink-0">
                            ({vehicle.count.toLocaleString()})
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
                    <div className="space-y-0.5">
                      {staticCountries.map((country) => (
                        <Link 
                          key={country.name}
                          href={`/country/${country.name.toLowerCase()}`}
                          className="flex items-center justify-between gap-4 px-3 py-2 text-[14px] text-gray-700 rounded-md hover:bg-gradient-to-r from-theme-secondary-hover to-transparent hover:text-theme-primary hover:shadow-sm transition-all duration-200 group"
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-base">{country.flag}</span>
                            <span className="font-medium">{country.name}</span>
                          </span>
                          <span className="text-gray-500 text-[13px] group-hover:text-theme-primary/70 shrink-0">
                            ({country.count.toLocaleString()})
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* Auction Link */}
          <NavigationMenuItem>
            <Link 
              href="/auction" 
              className="text-base font-medium text-white hover:text-theme-secondary-hover px-4 py-2 transition-all duration-200"
            >
              Auction
            </Link>
          </NavigationMenuItem>

          {/* Shipping Schedule Link */}
          <NavigationMenuItem>
            <Link 
              href="/shipping-schedule" 
              className="text-base font-medium text-white hover:text-theme-secondary-hover px-4 py-2 transition-all duration-200"
            >
              Shipping Schedule
            </Link>
          </NavigationMenuItem>

          {/* Contact Us Link */}
          <NavigationMenuItem>
            <Link 
              href="/contact-us" 
              className="text-base font-medium text-white hover:text-theme-secondary-hover px-4 py-2 transition-all duration-200"
            >
              Contact Us
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
} 