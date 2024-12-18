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
    { _id: '1', name: 'Toyota', count: 15023 },
    { _id: '2', name: 'Honda', count: 12045 },
    { _id: '3', name: 'Nissan', count: 10234 },
    { _id: '4', name: 'Mazda', count: 8567 },
    { _id: '5', name: 'Suzuki', count: 7890 },
    { _id: '6', name: 'Mitsubishi', count: 6543 },
    { _id: '7', name: 'Daihatsu', count: 5987 },
    { _id: '8', name: 'Subaru', count: 5432 },
    { _id: '9', name: 'Hino', count: 4876 },
    { _id: '10', name: 'Volkswagen', count: 4567 },
    { _id: '11', name: 'BMW', count: 4321 },
    { _id: '12', name: 'Isuzu', count: 4123 },
    { _id: '13', name: 'Lexus', count: 3987 },
    { _id: '14', name: 'Mercedes-Benz', count: 3765 },
    { _id: '15', name: 'Audi', count: 3456 },
    { _id: '16', name: 'Volvo', count: 3234 },
    { _id: '17', name: 'Land Rover', count: 2987 },
    { _id: '18', name: 'Ford', count: 2765 },
    { _id: '19', name: 'Peugeot', count: 2543 },
    { _id: '20', name: 'Jeep', count: 2321 },
    { _id: '21', name: 'Citroen', count: 2123 },
    { _id: '22', name: 'Jaguar', count: 1987 },
    { _id: '23', name: 'Hyundai', count: 1765 },
    { _id: '24', name: 'KIA', count: 1543 },
  ]

  const staticVehicleTypes = [
    { type: 'Sedan', icon: CarFront, count: 25678 },
    { type: 'SUV', icon: Car, count: 20456 },
    { type: 'Truck', icon: Truck, count: 15789 },
    { type: 'Van', icon: Bus, count: 12345 },
    { type: 'Mini Van', icon: CarTaxiFront, count: 10234 },
    { type: 'Commercial', icon: Container, count: 9876 },
    { type: 'Agricultural', icon: Tractor, count: 8765 },
    { type: 'Construction', icon: Forklift, count: 6543 },
    { type: 'Machinery', icon: Combine, count: 4321 },
    { type: 'Motorcycle', icon: Bike, count: 3210 },
  ]

  const staticCountries = [
    { name: 'Japan', flag: '🇯🇵', count: 45678 },
    { name: 'USA', flag: '🇺🇸', count: 32456 },
    { name: 'Germany', flag: '🇩🇪', count: 28901 },
    { name: 'UK', flag: '🇬🇧', count: 15678 },
    { name: 'South Korea', flag: '🇰🇷', count: 12345 },
    { name: 'Thailand', flag: '🇹🇭', count: 10234 },
    { name: 'Singapore', flag: '🇸🇬', count: 8765 },
    { name: 'Malaysia', flag: '🇲🇾', count: 7654 },
    { name: 'Australia', flag: '🇦🇺', count: 6543 },
    { name: 'UAE', flag: '🇦🇪', count: 5432 },
    { name: 'Canada', flag: '🇨🇦', count: 4321 },
    { name: 'France', flag: '🇫🇷', count: 3210 },
  ]

  const staticCategories = [
    { name: 'New Arrivals', icon: Globe, count: 45678 },
    { name: 'Best Sellers', icon: Car, count: 32456 },
    { name: 'Featured', icon: Truck, count: 28901 },
    { name: 'Sale', icon: Truck, count: 28901 },
    { name: 'Featured', icon: Truck, count: 28901 },
  ]

  const otherCategories = [
    { type: 'Left Hand Drive', icon: CircleUserRound, count: 4567 },
    { type: 'Fuel Efficient Vehicles', icon: Leaf, count: 3890 },
    { type: 'Hybrid', icon: Battery, count: 2987 },
    { type: 'Electric', icon: Zap, count: 1876 },
    { type: 'Diesel', icon: Fuel, count: 5432 },
    { type: 'Manual', icon: Gauge, count: 4321 },
    { type: 'For Handicapped', icon: Accessibility, count: 876 },
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
              <a 
                key={country.name} 
                href={`#${country.name.toLowerCase()}`}
                className="flex items-center gap-3 px-4 py-2 hover:bg-[#2d4050] transition-all duration-200 group hover:shadow-md"
              >
                <span className="w-6 h-6 flex items-center justify-center text-lg">{country.flag}</span>
                <span className="flex-1 text-[#E2F1E7] group-hover:text-[#E2F1E7]">{country.name}</span>
                <span className="text-sm font-medium text-[#E2F1E7] group-hover:text-[#629584]">
                  {country.count.toLocaleString()}
                </span>
              </a>
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
              <a 
                key={make._id} 
                href={`/cars/make/${make.name.toLowerCase()}`}
                className="flex items-center gap-3 px-4 py-2 hover:bg-[#2d4050] transition-all duration-200 group hover:shadow-md"
              >
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-[#2d4050] group-hover:bg-[#243642] transition-colors duration-200 shadow-sm">
                  <Car className="h-3.5 w-3.5 text-[#629584]" />
                </div>
                <span className="flex-1 text-[#E2F1E7] group-hover:text-[#E2F1E7]">{make.name}</span>
                <span className="text-sm font-medium text-[#E2F1E7] group-hover:text-[#629584]">
                  {make.count.toLocaleString()}
                </span>
              </a>
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
              <a 
                key={vehicle.type} 
                href={`#${vehicle.type.toLowerCase()}`}
                className="flex items-center gap-3 px-4 py-2 hover:bg-[#2d4050] transition-all duration-200 group hover:shadow-md"
              >
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-[#2d4050] group-hover:bg-[#243642] transition-colors duration-200 shadow-sm">
                  <vehicle.icon className="h-3.5 w-3.5 text-[#629584]" />
                </div>
                <span className="flex-1 text-[#E2F1E7] group-hover:text-[#E2F1E7]">{vehicle.type}</span>
                <span className="text-sm font-medium text-[#E2F1E7] group-hover:text-[#629584]">
                  {vehicle.count.toLocaleString()}
                </span>
              </a>
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
              <a 
                key={category.type} 
                href={`/category/${category.type.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex items-center gap-3 px-4 py-2 hover:bg-[#2d4050] transition-all duration-200 group hover:shadow-md"
              >
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-[#2d4050] group-hover:bg-[#243642] transition-colors duration-200 shadow-sm">
                  <category.icon className="h-3.5 w-3.5 text-[#629584]" />
                </div>
                <span className="flex-1 text-[#E2F1E7] group-hover:text-[#E2F1E7]">{category.type}</span>
                <span className="text-sm font-medium text-[#E2F1E7] group-hover:text-[#629584]">
                  {category.count.toLocaleString()}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}