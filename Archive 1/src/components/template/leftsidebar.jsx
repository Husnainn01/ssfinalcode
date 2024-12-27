'use client'

import * as React from "react"
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
  ChevronRight,
  Globe,
  CircleUserRound,
  Leaf,
  Battery,
  Zap,
  Fuel,
  Gauge,
  Accessibility
} from "lucide-react"
import Link from 'next/link'

export default function Component() {
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
    { _id: '11', name: 'BMW' },
    { _id: '12', name: 'Isuzu' },
    { _id: '13', name: 'Lexus' },
    { _id: '14', name: 'Mercedes-Benz' },
    { _id: '15', name: 'Audi' },
    { _id: '16', name: 'Volvo' },
    { _id: '17', name: 'Land Rover' },
    { _id: '18', name: 'Ford' },
    { _id: '19', name: 'Peugeot' },
    { _id: '20', name: 'Jeep' },
    { _id: '21', name: 'Citroen' },
    { _id: '22', name: 'Jaguar' },
    { _id: '23', name: 'Hyundai' },
    { _id: '24', name: 'KIA' },
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
    { name: 'Australia', flag: '🇦🇺' },
    { name: 'USA', flag: '🇺🇸' },
    { name: 'New Zealand', flag: '🇳🇿' },
    { name: 'Ireland', flag: '🇮🇪' },
    { name: 'UAE', flag: '🇦🇪' },
    { name: 'Kenya', flag: '🇰🇳' },
    { name: 'Uganda', flag: '🇺🇬' },
    { name: 'Zambia', flag: '🇿🇲' },
    { name: 'Malawi', flag: '🇲🇼' },
    { name: 'Guinea', flag: '🇬🇳' },
    { name: 'Papua New Guinea', flag: '🇵🇬' },
    { name: 'DR Congo', flag: '🇨🇩' },
    { name: 'Pakistan', flag: '🇵🇰' },
    { name: 'South Africa', flag: '🇿🇦' },
    { name: 'Thailand', flag: '🇹🇭' },
    { name: 'Georgia', flag: '🇬🇪' },
    { name: 'UK', flag: '🇬🇧' },
    { name: 'Rwanda', flag: '🇰🇼' },
    { name: 'Fiji', flag: '🇫🇯' },
    { name: 'Sri Lanka', flag: '🇱🇰' },
    { name: 'Russia', flag: '🇷🇺' },
    { name: 'Mongolia', flag: '🇲🇳' },
    { name: 'Philippines', flag: '🇵🇭' },
    { name: 'Japan', flag: '🇯🇵' },
  ]

  const otherCategories = [
    { type: 'Left Hand Drive', icon: CircleUserRound },
    { type: 'Fuel Efficient Vehicles', icon: Leaf },
    { type: 'Hybrid', icon: Battery },
    { type: 'Electric', icon: Zap },
    { type: 'Diesel', icon: Fuel },
    { type: 'Manual', icon: Gauge },
    { type: 'For Handicapped', icon: Accessibility },
  ]

  return (
    <div className="bg-theme-primary h-full sticky top-0 pt-4 shadow-xl border-r border-gray-700">
      <div className="flex flex-col">
        {/* Vehicles In Stock */}
        <div className="mb-8">
          <h2 className="bg-[#243642] px-4 py-2 text-[#E2F1E7] font-medium flex items-center gap-2 shadow-md relative z-10">
            <Globe className="h-4 w-4 text-[#629584]" />
            <span>Vehicles In Stock</span>
          </h2>
          <div className="mt-3 relative">
            {staticCountries.map((country) => (
              <Link 
                key={country.name} 
                href={`/cars?country=${country.name}`}
                className="flex items-center gap-3 px-4 py-2 hover:bg-[#2d4050] transition-all duration-200 group hover:shadow-md"
              >
                <span className="w-6 h-6 flex items-center justify-center text-lg">
                  {country.flag}
                </span>
                <span className="flex-1 text-[#E2F1E7] group-hover:text-[#E2F1E7]">
                  {country.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Shop By Make */}
        <div className="mb-8">
          <h2 className="bg-[#243642] px-4 py-2 text-[#E2F1E7] font-medium flex items-center gap-2 shadow-md relative z-10">
            <Car className="h-4 w-4 text-[#629584]" />
            <span>Shop By Make</span>
          </h2>
          <div className="mt-3">
            {staticMakes.map((make) => (
              <Link 
                key={make._id} 
                href={`/cars?make=${make.name}`}
                className="flex items-center gap-3 px-4 py-2 hover:bg-[#2d4050] transition-all duration-200 group hover:shadow-md"
              >
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-[#2d4050] group-hover:bg-[#243642] transition-colors duration-200 shadow-sm">
                  <Car className="h-3.5 w-3.5 text-[#629584]" />
                </div>
                <span className="flex-1 text-[#E2F1E7] group-hover:text-[#E2F1E7]">
                  {make.name}
                </span>
              </Link>
            ))}
            <div className="px-4 pt-4 pb-2">
              <Link 
                href="/cars"
                className="group flex flex-col items-center gap-1.5 transition-all duration-300"
              >
                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#629584] to-transparent mb-1" />
                <div className="flex items-center gap-2 text-[#629584] hover:text-[#E2F1E7] font-medium hover:shadow-sm py-1 px-3 rounded-full transition-all duration-200">
                  <span>View All Makes</span>
                  <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
                <div className="text-xs text-[#E2F1E7]">
                  Explore our complete collection
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Shop By Type */}
        <div className="mb-8">
          <h2 className="bg-[#243642] px-4 py-2 text-[#E2F1E7] font-medium flex items-center gap-2 shadow-md relative z-10">
            <CarFront className="h-4 w-4 text-[#629584]" />
            <span>Shop By Type</span>
          </h2>
          <div className="mt-3">
            {staticVehicleTypes.map((vehicle) => (
              <Link 
                key={vehicle.type} 
                href={`/cars?type=${vehicle.type}`}
                className="flex items-center gap-3 px-4 py-2 hover:bg-[#2d4050] transition-all duration-200 group hover:shadow-md"
              >
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-[#2d4050] group-hover:bg-[#243642] transition-colors duration-200 shadow-sm">
                  <vehicle.icon className="h-3.5 w-3.5 text-[#629584]" />
                </div>
                <span className="flex-1 text-[#E2F1E7] group-hover:text-[#E2F1E7]">
                  {vehicle.type}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Other Categories Section */}
        <div className="mb-8">
          <h2 className="bg-[#243642] px-4 py-2 text-[#E2F1E7] font-medium flex items-center gap-2 shadow-md relative z-10">
            <Car className="h-4 w-4 text-[#629584]" />
            <span>Other Categories</span>
          </h2>
          <div className="mt-3">
            {otherCategories.map((category) => (
              <Link 
                key={category.type} 
                href={`/cars?othercategory=${encodeURIComponent(category.type)}`}
                className="flex items-center gap-3 px-4 py-2 hover:bg-[#2d4050] transition-all duration-200 group hover:shadow-md"
              >
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-[#2d4050] group-hover:bg-[#243642] transition-colors duration-200 shadow-sm">
                  <category.icon className="h-3.5 w-3.5 text-[#629584]" />
                </div>
                <span className="flex-1 text-[#E2F1E7] group-hover:text-[#E2F1E7]">
                  {category.type}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}