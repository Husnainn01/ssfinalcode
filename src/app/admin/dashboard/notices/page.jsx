"use client";
import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaExclamationTriangle, FaBullhorn } from 'react-icons/fa';
import Link from 'next/link';
import AdminMenu from '@/app/admin/components/template/adminMenu';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function NoticesListPage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const response = await fetch('/api/notices');
      if (!response.ok) throw new Error('Failed to fetch notices');
      
      const data = await response.json();
      setNotices(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notices:', error);
      toast.error('Failed to load notices');
      setLoading(false);
    }
  };

  const showDeleteConfirmation = (id) => {
    setDeleteConfirm({ show: true, id });
  };

  const hideDeleteConfirmation = () => {
    setDeleteConfirm({ show: false, id: null });
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/notices/${deleteConfirm.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete notice');
      
      toast.success('Notice deleted successfully');
      fetchNotices(); // Refresh the list
      hideDeleteConfirmation();
    } catch (error) {
      console.error('Error deleting notice:', error);
      toast.error('Failed to delete notice');
      hideDeleteConfirmation();
    }
  };

  const filteredNotices = notices.filter(notice => {
    const matchesSearch = 
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = 
      typeFilter === '' || notice.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminMenu>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Notice Management</h1>
            <p className="text-gray-600">Manage site-wide notices and announcements</p>
          </div>
          <Link 
            href="/admin/dashboard/notices/new" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FaPlus className="mr-2" /> Add New Notice
          </Link>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <input
              type="text"
              placeholder="Search notices..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500">No notices found. Add your first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredNotices.map((notice) => (
              <div 
                key={notice._id} 
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <FaBullhorn className="text-blue-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-800">{notice.title}</h3>
                    </div>
                    <div className="flex space-x-2">
                      <Link 
                        href={`/admin/dashboard/notices/edit/${notice._id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <FaEdit className="w-5 h-5" />
                      </Link>
                      <button 
                        onClick={() => showDeleteConfirmation(notice._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div 
                    className="text-gray-600 mb-4"
                    dangerouslySetInnerHTML={{ __html: notice.content }}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(notice.type)}`}>
                      {notice.type.charAt(0).toUpperCase() + notice.type.slice(1)}
                    </span>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      Position: {notice.position}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${notice.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {notice.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    <p>Expires: {format(new Date(notice.expiresAt), 'MMM dd, yyyy')}</p>
                    <p>Pages: {notice.showOnPages.join(', ')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirm.show && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              >
                <div className="flex items-center text-red-600 mb-4">
                  <FaExclamationTriangle className="w-6 h-6 mr-2" />
                  <h3 className="text-lg font-bold">Confirm Deletion</h3>
                </div>
                
                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete this notice? This action cannot be undone.
                </p>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={hideDeleteConfirmation}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminMenu>
  );
} 