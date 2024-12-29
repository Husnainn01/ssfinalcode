"use client";
import { useState } from "react";
import Link from "next/link";
import { FiMenu, FiX, FiBell, FiSettings } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from 'next/navigation';
import ProfileDropdown from "@/app/admin/dashboard/profile/ProfileDropdown";
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        router.push('/admin/login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg">
        <div className="max-w-[2520px] mx-auto">
          <div className="flex items-center justify-between px-4 md:px-8 py-4">
            <Link href="/" className="flex items-center space-x-3">
              <img 
                src="/ss-logo6.png" 
                alt="Logo" 
                className="h-8 w-auto transition-transform duration-200 hover:scale-105" 
              />
              <span className="hidden md:block font-semibold text-xl">
                Admin Dashboard
              </span>
            </Link>

            <div className="flex items-center gap-4">
              {/* Icons */}
              <div className="hidden md:flex items-center gap-3">
                <FiBell className="w-5 h-5 text-gray-300 hover:text-white cursor-pointer" />
                <FiSettings className="w-5 h-5 text-gray-300 hover:text-white cursor-pointer" />
              </div>

              {/* Profile Dropdown */}
              <div className="relative z-50">
                <ProfileDropdown 
                  onLogout={handleLogout} 
                  userEmail={user?.email}
                  userName={user?.name}
                  userRole={user?.role}
                />
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg md:hidden bg-gray-700 hover:bg-gray-600 transition-colors"
                onClick={toggleMenu}
              >
                {menuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={toggleMenu}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-gray-900 z-50 md:hidden overflow-y-auto"
            >
              <div className="px-4 py-6">
                <div className="flex justify-end mb-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleMenu}
                    className="p-2 rounded-lg text-gray-400 hover:text-white"
                  >
                    <FiX className="w-5 h-5" />
                  </motion.button>
                </div>
                {/* Mobile Navigation Menu */}
                <nav className="space-y-4">
                  {/* Menu items will be rendered here by AdminMenu component */}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
