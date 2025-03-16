"use client";
import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaExclamationTriangle } from 'react-icons/fa';
import Link from 'next/link';
import AdminMenu from '@/app/admin/components/template/adminMenu';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function QnaListPage() {
  const [qnaItems, setQnaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });

  useEffect(() => {
    fetchQnaItems();
  }, []);

  const fetchQnaItems = async () => {
    try {
      const response = await fetch('/api/qna');
      if (!response.ok) throw new Error('Failed to fetch Q&A items');
      
      const data = await response.json();
      setQnaItems(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching Q&A items:', error);
      toast.error('Failed to load Q&A items');
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
      const response = await fetch(`/api/qna/${deleteConfirm.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete Q&A item');
      
      toast.success('Q&A item deleted successfully');
      fetchQnaItems(); // Refresh the list
      hideDeleteConfirmation();
    } catch (error) {
      console.error('Error deleting Q&A item:', error);
      toast.error('Failed to delete Q&A item');
      hideDeleteConfirmation();
    }
  };

  const filteredItems = qnaItems.filter(item => {
    const matchesSearch = 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      categoryFilter === '' || item.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories from items
  const categories = ['', ...new Set(qnaItems.map(item => item.category))];

  // Sort categories according to predefined order
  const categoryOrder = [
    'General Questions',
    'Vehicles & Inventory',
    'Buying & Paying',
    'Booking & Shipping',
    'Documentation',
    'Receiving Your Cargo',
    'Country Regulations',
    'Glossary Of Terms',
    'Other'
  ];

  const sortedCategories = ['', ...categories.filter(cat => cat !== '').sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    
    // If category is not in the order list, put it at the end
    const posA = indexA === -1 ? 999 : indexA;
    const posB = indexB === -1 ? 999 : indexB;
    
    return posA - posB;
  })];

  return (
    <AdminMenu>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Q&A Management</h1>
          <Link 
            href="/admin/dashboard/qna/new" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FaPlus className="mr-2" /> Add New Q&A
          </Link>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <input
              type="text"
              placeholder="Search Q&A..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {sortedCategories.filter(cat => cat !== '').map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500">No Q&A items found. Add your first one!</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Answer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {item.question}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {item.answer}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{item.category || 'General Questions'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link 
                          href={`/admin/dashboard/qna/edit/${item._id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <FaEdit className="w-5 h-5" />
                        </Link>
                        <button 
                          onClick={() => showDeleteConfirmation(item._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                  Are you sure you want to delete this Q&A item? This action cannot be undone.
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