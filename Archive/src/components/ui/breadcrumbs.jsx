import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Breadcrumbs({ items }) {
  return (
    <motion.nav 
      className="flex mb-8" 
      aria-label="Breadcrumb"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ol className="inline-flex items-center space-x-1 md:space-x-3 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-gray-100">
        <motion.li 
          className="inline-flex items-center"
          whileHover={{ scale: 1.02 }}
        >
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-[#14225D] transition-colors duration-200"
          >
            <div className="bg-gray-50 p-1 rounded-md mr-2">
              <Home className="w-4 h-4" />
            </div>
            <span className="font-medium">Home</span>
          </Link>
        </motion.li>
        
        {items.map((item, index) => (
          <motion.li 
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
              {index === items.length - 1 ? (
                <span className="text-sm font-semibold text-[#14225D] md:ml-1 bg-[#14225D]/5 px-3 py-1 rounded-lg">
                  {item.label}
                </span>
              ) : (
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-600 hover:text-[#14225D] transition-colors duration-200 md:ml-1"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.li>
        ))}
      </ol>
    </motion.nav>
  )
} 