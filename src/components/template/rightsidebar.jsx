'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FaShip, FaGlobeAmericas, FaWarehouse, FaChevronRight } from 'react-icons/fa'

const staticCountries = [
  { name: 'Australia', flag: '🇦🇺', slug: 'australia' },
  { name: 'Bahamas', flag: '🇧🇸', slug: 'bahamas' },
  { name: 'Canada', flag: '🇨🇦', slug: 'canada' },
  { name: 'Chile', flag: '🇨🇱', slug: 'chile' },
  { name: 'Cyprus', flag: '🇨🇾', slug: 'cyprus' },
  { name: 'DR Congo', flag: '🇨🇩', slug: 'dr-congo' },
  { name: 'Fiji', flag: '🇫🇯', slug: 'fiji' },
  { name: 'Guyana', flag: '🇬🇾', slug: 'guyana' },
  { name: 'Ireland', flag: '🇮🇪', slug: 'ireland' },
  { name: 'Jamaica', flag: '🇯🇲', slug: 'jamaica' },
  { name: 'Kenya', flag: '🇰🇪', slug: 'kenya' },
  { name: 'Mauritius', flag: '🇲🇺', slug: 'mauritius' },
  { name: 'Pakistan', flag: '🇵🇰', slug: 'pakistan' },
  { name: 'Russia', flag: '🇷🇺', slug: 'russia' },
  { name: 'Rwanda', flag: '🇷🇼', slug: 'rwanda' },
  { name: 'South Africa', flag: '🇿🇦', slug: 'south-africa' },
  { name: 'Sri Lanka', flag: '🇱🇰', slug: 'sri-lanka' },
  { name: 'Tanzania', flag: '🇹🇿', slug: 'tanzania' },
  { name: 'Uganda', flag: '🇺🇬', slug: 'uganda' },
  { name: 'UK', flag: '🇬🇧', slug: 'uk' },
  { name: 'USA', flag: '🇺🇸', slug: 'usa' }
]

const RightSidebar = () => {
  return (
    <div className="w-full space-y-6 p-4 bg-[#E2F1E7] flex flex-col">
      {/* Top Banner */}
      {/* <motion.div
        className="banner-container relative"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Link href="/promotion/1" className="block w-full h-[200px] rounded-xl overflow-hidden shadow-lg">
          <img 
            src="/ban1.jpg"
            alt="Special Promotion"
            className="w-full h-full object-cover"
          />
        </Link>
      </motion.div> */}

      {/* Enhanced Stock Sections */}
      <div className="grid grid-cols-2 gap-4">
        {/* Korea Stock */}
        <Link 
          href="/cars?country=Korea" 
          className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium text-sm">KOREA</span>
              <FaWarehouse className="text-[#629584] w-4 h-4" />
            </div>
          </div>
          <div className="p-3 flex items-center justify-between group-hover:bg-gray-50 transition-colors">
            <span className="text-xs text-gray-600">View Stock</span>
            <FaChevronRight className="w-3 h-3 text-gray-400 group-hover:text-[#629584] group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </Link>

        {/* USA Stock */}
        <Link 
          href="/cars?country=USA" 
          className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium text-sm">USA</span>
              <FaWarehouse className="text-[#629584] w-4 h-4" />
            </div>
          </div>
          <div className="p-3 flex items-center justify-between group-hover:bg-gray-50 transition-colors">
            <span className="text-xs text-gray-600">View Stock</span>
            <FaChevronRight className="w-3 h-3 text-gray-400 group-hover:text-[#629584] group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </Link>
      </div>

      {/* Shipping Schedule */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center gap-2 mb-3">
          <FaShip className="text-blue-600 text-xl" />
          <h3 className="text-lg font-semibold text-blue-900">Shipping Schedule</h3>
        </div>
        <Link href="/shipping-schedule" className="text-sm text-blue-600 hover:underline">
          View full schedule →
        </Link>
      </div>

      {/* Countries List using left sidebar styling */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-3 bg-[#243642]">
          <div className="flex items-center gap-2">
            <FaGlobeAmericas className="text-[#629584] text-lg" />
            <h3 className="text-base font-medium text-[#E2F1E7]">Countries We Serve</h3>
          </div>
        </div>
        
        <div className="p-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {staticCountries.map((country) => (
              <Link 
                key={country.name}
                href={`/cars?country=${country.name}`}
                className="flex items-center gap-2 hover:bg-gray-50 rounded-md px-2 py-1 transition-colors group"
              >
                <span className="text-base">{country.flag}</span>
                <span className="text-xs font-medium text-gray-700 group-hover:text-[#629584] transition-colors">
                  {country.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
        
        <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
          <Link 
            href="/cars"
            className="flex items-center justify-center text-xs text-[#629584] hover:text-[#243642] font-medium"
          >
            View All Destinations
          </Link>
        </div>
      </div>

      {/* Bottom Advertisement Banner */}
      <motion.div
        className="banner-container relative"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Link href="/promotion/2" className="block w-full h-[300px] rounded-xl overflow-hidden shadow-lg">
          <img 
            src="/ban1.jpg"
            alt="Advertisement"
            className="w-full h-full object-cover"
          />
        </Link>
      </motion.div>
    </div>
  )
}

export default RightSidebar
