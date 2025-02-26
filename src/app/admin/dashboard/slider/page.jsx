"use client";
import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSort } from 'react-icons/fa';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function SliderManagement() {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      const response = await fetch('/api/slider');
      const data = await response.json();
      setSliders(data.sort((a, b) => a.order - b.order));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sliders:', error);
      toast.error('Failed to load sliders');
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/slider/${deleteId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setSliders(sliders.filter(slider => slider._id !== deleteId));
        toast.success('Slider deleted successfully');
      } else {
        throw new Error('Failed to delete slider');
      }
    } catch (error) {
      console.error('Error deleting slider:', error);
      toast.error('Failed to delete slider');
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 max-w-7xl mx-auto"
      >
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-between items-center mb-6"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Slider Management</h1>
            <p className="text-gray-600 mt-1">Manage your homepage slider content</p>
          </div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link 
              href="/admin/dashboard/slider/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 
                transition-colors duration-200 flex items-center gap-2 shadow-sm"
            >
              <FaPlus className="w-4 h-4" />
              Add New Slider
            </Link>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    Title <FaSort className="w-3 h-3" />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    Order <FaSort className="w-3 h-3" />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {sliders.map((slider, index) => (
                    <motion.tr 
                      key={slider._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <motion.div 
                          className="relative h-20 w-32 group"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <img 
                            src={slider.imageUrl} 
                            alt={slider.title} 
                            className="h-20 w-32 object-cover rounded-lg shadow-sm"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 
                            transition-opacity duration-200 rounded-lg" 
                          />
                        </motion.div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{slider.title}</div>
                        {slider.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {slider.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {slider.order}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <motion.span 
                          whileHover={{ scale: 1.05 }}
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            slider.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {slider.isActive ? 'Active' : 'Inactive'}
                        </motion.span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <motion.div whileHover={{ scale: 1.1 }}>
                            <Link 
                              href={`/admin/dashboard/slider/edit/${slider._id}`}
                              className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                            >
                              <FaEdit className="w-5 h-5" />
                            </Link>
                          </motion.div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            onClick={() => handleDeleteClick(slider._id)}
                            className="text-red-600 hover:text-red-900 transition-colors duration-200"
                          >
                            <FaTrash className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          {sliders.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <p className="text-gray-500">No sliders found. Create your first slider!</p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm Deletion
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this slider? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 
                    transition-colors duration-200"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDelete}
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 
                    transition-colors duration-200"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 