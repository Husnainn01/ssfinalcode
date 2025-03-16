"use client";
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaInfoCircle, FaExclamationTriangle, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

export default function NoticeBar() {
  const [notices, setNotices] = useState([]);
  const [visibleNotices, setVisibleNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    fetchNotices();
  }, []);

  useEffect(() => {
    if (notices.length > 0) {
      filterNoticesByPage();
    }
  }, [notices, pathname]);

  const fetchNotices = async () => {
    try {
      const response = await fetch('/api/notices');
      if (!response.ok) throw new Error('Failed to fetch notices');
      
      const data = await response.json();
      
      // Filter active notices that haven't expired
      const now = new Date();
      const activeNotices = data.filter(notice => 
        notice.isActive && new Date(notice.expiresAt) > now
      );
      
      setNotices(activeNotices);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notices:', error);
      setLoading(false);
    }
  };

  const filterNoticesByPage = () => {
    // Get current page path without leading slash
    const currentPage = pathname.substring(1) || 'home';
    
    // Filter notices that should be shown on this page
    const filtered = notices.filter(notice => 
      notice.showOnPages.includes('all') || 
      notice.showOnPages.includes(currentPage)
    );
    
    setVisibleNotices(filtered);
  };

  const dismissNotice = (id) => {
    setVisibleNotices(prev => prev.filter(notice => notice._id !== id));
  };

  const getNoticeIcon = (type) => {
    switch (type) {
      case 'info': return <FaInfoCircle className="w-4 h-4" />;
      case 'warning': return <FaExclamationTriangle className="w-4 h-4" />;
      case 'success': return <FaCheckCircle className="w-4 h-4" />;
      case 'error': return <FaExclamationCircle className="w-4 h-4" />;
      default: return <FaInfoCircle className="w-4 h-4" />;
    }
  };

  const getNoticeStyles = (type) => {
    switch (type) {
      case 'info': return 'bg-blue-600 text-white';
      case 'warning': return 'bg-amber-500 text-white';
      case 'success': return 'bg-green-600 text-white';
      case 'error': return 'bg-red-600 text-white';
      default: return 'bg-blue-600 text-white';
    }
  };

  if (loading || visibleNotices.length === 0) {
    return null;
  }

  // Group notices by position
  const topNotices = visibleNotices.filter(notice => notice.position === 'top');
  const bottomNotices = visibleNotices.filter(notice => notice.position === 'bottom');

  return (
    <>
      {/* Top Notices */}
      {topNotices.length > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <AnimatePresence>
            {topNotices.map((notice) => (
              <motion.div
                key={notice._id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`${getNoticeStyles(notice.type)} shadow-md`}
              >
                <div className="container mx-auto py-2 px-4 text-sm flex items-center justify-between">
                  <div className="flex items-center space-x-2 flex-1 max-w-full overflow-hidden">
                    <span className="flex-shrink-0">{getNoticeIcon(notice.type)}</span>
                    <div className="overflow-hidden">
                      {notice.title && (
                        <span className="font-medium mr-1">{notice.title}:</span>
                      )}
                      <span 
                        className="notice-content inline"
                        dangerouslySetInnerHTML={{ 
                          __html: notice.content.replace(/<\/?p>/g, '').replace(/<br\s*\/?>/g, ' ') 
                        }} 
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => dismissNotice(notice._id)}
                    className="ml-3 text-white/80 hover:text-white flex-shrink-0 transition-colors"
                    aria-label="Dismiss"
                  >
                    <FaTimes className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Bottom Notices */}
      {bottomNotices.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <AnimatePresence>
            {bottomNotices.map((notice) => (
              <motion.div
                key={notice._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className={`${getNoticeStyles(notice.type)} shadow-md`}
              >
                <div className="container mx-auto py-2 px-4 text-sm flex items-center justify-between">
                  <div className="flex items-center space-x-2 flex-1 max-w-full overflow-hidden">
                    <span className="flex-shrink-0">{getNoticeIcon(notice.type)}</span>
                    <div className="overflow-hidden">
                      {notice.title && (
                        <span className="font-medium mr-1">{notice.title}:</span>
                      )}
                      <span 
                        className="notice-content inline"
                        dangerouslySetInnerHTML={{ 
                          __html: notice.content.replace(/<\/?p>/g, '').replace(/<br\s*\/?>/g, ' ') 
                        }} 
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => dismissNotice(notice._id)}
                    className="ml-3 text-white/80 hover:text-white flex-shrink-0 transition-colors"
                    aria-label="Dismiss"
                  >
                    <FaTimes className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <style jsx global>{`
        .notice-content p {
          display: inline;
          margin: 0;
          padding: 0;
        }
        .notice-content a {
          text-decoration: underline;
        }
        .notice-content strong, .notice-content b {
          font-weight: 600;
        }
      `}</style>
    </>
  );
} 