'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const banners = [
  {
    id: 1,
    image: '/ban1.jpg',
    link: '/promotion/1',
    alt: 'Special Promotion 1',
  },
  {
    id: 2,
    image: '/ban1.jpg',
    link: '/promotion/2',
    alt: 'Special Promotion 2',
  },
  {
    id: 3,
    image: '/ban1.jpg',
    link: '/promotion/3',
    alt: 'Special Promotion 3',
  },
]

const RightSidebar = () => {
  return (
    <div className="w-full space-y-6 p-4 bg-[#E2F1E7] flex flex-col items-end">
      {banners.map((banner) => (
        <motion.div
          key={banner.id}
          className="banner-container relative"
          whileHover={{ scale: 1.02, translateX: -5 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Link 
            href={banner.link}
            className="block w-[240px] h-[500px] rounded-xl overflow-hidden 
              shadow-lg hover:shadow-2xl transition-all duration-300 
              relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent 
              opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <img 
              src={banner.image}
              alt={banner.alt}
              className="w-full h-full object-cover transform transition-transform duration-500 
                group-hover:scale-105"
            />

            {/* Optional: Add a subtle shine effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 
              transition-opacity duration-700">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}

export default RightSidebar
