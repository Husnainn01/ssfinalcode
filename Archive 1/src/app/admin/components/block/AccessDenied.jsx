"use client"

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaLock, FaArrowLeft, FaHome, FaExclamationTriangle } from 'react-icons/fa';
import { MdSupportAgent } from 'react-icons/md';

const AccessDenied = () => {
  const router = useRouter();

  const handleDashboardClick = (e) => {
    e.stopPropagation();
    router.push('/admin/dashboard');
  };

  const handleGoBack = (e) => {
    e.stopPropagation();
    try {
      router.back();
    } catch (error) {
      console.error('Navigation error:', error);
      router.push('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl"
      >
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-40 h-40 transform translate-x-8 -translate-y-8">
              <div className="absolute inset-0 opacity-20">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="8"/>
                  <path d="M50 30V50L65 65" stroke="white" strokeWidth="8" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            <div className="relative z-10">
              <FaExclamationTriangle className="w-12 h-12 text-white/90 mb-4" />
              <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
              <p className="text-red-100 text-lg">Error Code: 403 | Forbidden Access</p>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6">
            <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm leading-relaxed">
                Access to this page has been denied.
              </p>
              <ul className="mt-2 space-y-1 text-sm text-red-600">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></span>
                  Please log in to continue
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleDashboardClick}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <FaHome className="w-4 h-4" />
                Return to Dashboard
              </button>
              <button
                onClick={handleGoBack}
                className="w-full bg-white text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300"
              >
                <FaArrowLeft className="w-4 h-4" />
                Go Back
              </button>
            </div>

            {/* Support Section */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <MdSupportAgent className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-900 font-medium">Need Help?</p>
                    <p className="text-gray-500">Contact system administrator</p>
                  </div>
                </div>
                <button 
                  onClick={() => window.location.mailto='support@example.com'}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Get Support
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-gray-500 text-sm mt-6"
        >
          If you believe this is a mistake, please verify your credentials and try again.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default AccessDenied; 