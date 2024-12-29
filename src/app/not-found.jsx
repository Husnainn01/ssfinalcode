"use client"

import { motion } from 'framer-motion'
import { Home, Search, ArrowLeft, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div 
        className="max-w-2xl w-full text-center space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* 404 Image/Icon */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative"
        >
          <div className="w-32 h-32 mx-auto bg-[#14225D]/5 rounded-full flex items-center justify-center">
            <HelpCircle className="w-16 h-16 text-[#14225D]" />
          </div>
        </motion.div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-[#14225D]">
            Page Not Found
          </h1>
          <p className="text-gray-600 text-lg max-w-md mx-auto">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
        </div>

        {/* Action Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            asChild
            className="bg-[#14225D] hover:bg-[#14225D]/90 text-white px-6 py-6 rounded-xl flex items-center gap-2 text-lg"
          >
            <Link href="/">
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
          </Button>
          
          <Button
            asChild
            variant="outline"
            className="border-2 border-[#14225D] text-[#14225D] hover:bg-[#14225D]/5 px-6 py-6 rounded-xl flex items-center gap-2 text-lg"
          >
            <Link href="/contact">
              <Search className="w-5 h-5" />
              Search Site
            </Link>
          </Button>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="pt-8 border-t border-gray-200"
        >
          <p className="text-gray-600 mb-4">Popular Pages</p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { label: 'Cars', href: '/cars' },
              { label: 'How to Buy', href: '/how-to-buy' },
              { label: 'Auction', href: '/auction' },
              { label: 'Contact', href: '/contact' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[#14225D] hover:text-[#14225D]/80 text-sm bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
} 