'use client'

import { useState } from 'react'
import { Menu, X, ChevronRight, ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet"
import Link from 'next/link'
import { motion, AnimatePresence } from "framer-motion"

export function MobileMenu({ isAuthenticated, user, favoritesCount, onLogout }) {
  const [isOpen, setIsOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState(null)

  // Define submenus
  const aboutSubmenu = [
    { title: 'About Us', href: '/about' },
    { title: 'Banking Information', href: '/banking' },
    { title: 'How to Buy', href: '/how-to-buy' },
    { title: 'FAQ', href: '/FAQ' }
  ]

  const stockListSubmenu = [
    { title: 'By Make', href: '/cars/make' },
    { title: 'By Type', href: '/cars/type' },
    { title: 'By Country', href: '/cars/country' }
  ]

  const menuAnimation = {
    hidden: { opacity: 0, x: 20 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
        staggerChildren: 0.1
      }
    }
  }

  const itemAnimation = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0 }
  }

  const submenuAnimation = {
    hidden: { height: 0, opacity: 0 },
    show: { 
      height: 'auto', 
      opacity: 1,
      transition: {
        height: {
          duration: 0.3
        },
        opacity: {
          duration: 0.2
        }
      }
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden text-white p-2">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="w-[300px] sm:w-[380px] p-0 bg-[#387478]"
        hideCloseButton
      >
        <SheetHeader className="p-4 border-b border-white/20">
          <div className="flex items-center justify-between">
            <Link href="/" onClick={() => setIsOpen(false)}>
              <img
                src="/sss-logo.png"
                alt="SS Holdings"
                className="h-8 w-auto"
              />
            </Link>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>

        <motion.nav 
          className="flex flex-col p-4"
          initial="hidden"
          animate="show"
          variants={menuAnimation}
        >
          {/* User Info */}
          {isAuthenticated && (
            <motion.div 
              variants={itemAnimation}
              className="border-b border-white/20 pb-4 mb-4"
            >
              <p className="font-medium text-white">{user?.name || 'Customer'}</p>
              <p className="text-sm text-white/80">{user?.email}</p>
            </motion.div>
          )}

          {/* Navigation Links */}
          <div className="flex flex-col gap-2">
            {/* About with Submenu */}
            <motion.div variants={itemAnimation}>
              <button
                onClick={() => setOpenSubmenu(openSubmenu === 'about' ? null : 'about')}
                className="flex items-center justify-between w-full p-2 text-white hover:bg-white/10 rounded-md"
              >
                <span>About</span>
                <ChevronDown 
                  className={`h-4 w-4 transition-transform ${
                    openSubmenu === 'about' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openSubmenu === 'about' && (
                  <motion.div
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    variants={submenuAnimation}
                    className="ml-4 overflow-hidden"
                  >
                    {aboutSubmenu.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center p-2 text-sm text-white/90 hover:bg-white/10 rounded-md"
                        onClick={() => setIsOpen(false)}
                      >
                        <ChevronRight className="h-4 w-4 mr-2" />
                        {item.title}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Stock List with Submenu */}
            <motion.div variants={itemAnimation}>
              <button
                onClick={() => setOpenSubmenu(openSubmenu === 'stock' ? null : 'stock')}
                className="flex items-center justify-between w-full p-2 text-white hover:bg-white/10 rounded-md"
              >
                <span>Stock List</span>
                <ChevronDown 
                  className={`h-4 w-4 transition-transform ${
                    openSubmenu === 'stock' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openSubmenu === 'stock' && (
                  <motion.div
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    variants={submenuAnimation}
                    className="ml-4 overflow-hidden"
                  >
                    {stockListSubmenu.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center p-2 text-sm text-white/90 hover:bg-white/10 rounded-md"
                        onClick={() => setIsOpen(false)}
                      >
                        <ChevronRight className="h-4 w-4 mr-2" />
                        {item.title}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Regular Links */}
            <motion.div variants={itemAnimation}>
              <Link 
                href="/auction" 
                className="block p-2 text-white hover:bg-white/10 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Auction
              </Link>
            </motion.div>

            <motion.div variants={itemAnimation}>
              <Link 
                href="/shipping-schedule" 
                className="block p-2 text-white hover:bg-white/10 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Shipping Schedule
              </Link>
            </motion.div>

            <motion.div variants={itemAnimation}>
              <Link 
                href="/contact-us" 
                className="block p-2 text-white hover:bg-white/10 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Contact Us
              </Link>
            </motion.div>
          </div>

          {/* Auth Actions */}
          <motion.div 
            variants={itemAnimation}
            className="mt-auto border-t border-white/20 pt-4 mt-4"
          >
            {isAuthenticated ? (
              <>
                <Link 
                  href="/customer-dashboard/favorites" 
                  className="flex items-center p-2 text-white hover:bg-white/10 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Favorites ({favoritesCount})
                </Link>
                <Link 
                  href="/customer-dashboard" 
                  className="p-2 text-white hover:bg-white/10 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <button 
                  onClick={() => {
                    onLogout();
                    setIsOpen(false);
                  }}
                  className="w-full text-left p-2 text-red-400 hover:bg-red-400/10 rounded-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                href="/auth/login"
                className="block w-full p-2 text-center bg-[#172656] text-white rounded-md hover:bg-[#172656]/90"
                onClick={() => setIsOpen(false)}
              >
                Login / Register
              </Link>
            )}
          </motion.div>
        </motion.nav>
      </SheetContent>
    </Sheet>
  )
}