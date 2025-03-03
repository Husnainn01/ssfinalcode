'use client';
import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaGlobe } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';

const regions = [
  { id: 'Africa', name: 'Africa' },
  { id: 'Europe', name: 'Europe' },
  { id: 'Middle East', name: 'Middle East' },
  { id: 'Asia', name: 'Asia' },
  { id: 'Oceania', name: 'Oceania' },
];

export default function PortsManagement() {
  const [ports, setPorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPort, setEditingPort] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [portData, setPortData] = useState({
    name: '',
    country: '',
    region: '',
    isActive: true
  });

  // Fetch ports
  const fetchPorts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ports');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setPorts(data);
    } catch (error) {
      toast.error('Failed to fetch ports');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPorts();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingPort 
        ? `/api/ports/${editingPort._id}`
        : '/api/ports';
      
      const method = editingPort ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(portData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast.success(
        editingPort 
          ? 'Port updated successfully' 
          : 'Port created successfully'
      );
      
      setIsModalOpen(false);
      setEditingPort(null);
      resetForm();
      fetchPorts();
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
      console.error('Error:', error);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this port?')) return;

    try {
      const response = await fetch(`/api/ports/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast.success('Port deleted successfully');
      fetchPorts();
    } catch (error) {
      toast.error('Failed to delete port');
      console.error('Error:', error);
    }
  };

  // Handle edit
  const handleEdit = (port) => {
    setEditingPort(port);
    setPortData({
      name: port.name,
      country: port.country,
      region: port.region,
      isActive: port.isActive
    });
    setIsModalOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setPortData({
      name: '',
      country: '',
      region: '',
      isActive: true
    });
  };

  // Filter ports
  const filteredPorts = ports.filter(port => {
    const matchesRegion = !selectedRegion || port.region === selectedRegion;
    const matchesSearch = !searchQuery || 
      port.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      port.country.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  // Group ports by region and country
  const groupedPorts = filteredPorts.reduce((acc, port) => {
    if (!acc[port.region]) {
      acc[port.region] = {};
    }
    if (!acc[port.region][port.country]) {
      acc[port.region][port.country] = [];
    }
    acc[port.region][port.country].push(port);
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto p-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ports Management</h1>
          <p className="text-gray-600">Manage shipping ports and their details</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
            transition-colors flex items-center gap-2"
        >
          <FaPlus className="w-4 h-4" />
          Add New Port
        </motion.button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
              focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Regions</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ports..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg 
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Ports List */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(groupedPorts).map(([region, countries]) => (
            <div key={region} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaGlobe className="text-blue-600" />
                {region}
              </h2>
              
              <div className="space-y-6">
                {Object.entries(countries).map(([country, ports]) => (
                  <div key={country} className="border-t pt-4">
                    <h3 className="font-medium text-gray-700 mb-3">{country}</h3>
                    <div className="space-y-4">
                      {ports.map((port) => (
                        <div
                          key={port._id}
                          className="bg-gray-50 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-gray-900">{port.name}</h4>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEdit(port)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <FaEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(port._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2
                            ${port.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {port.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Port Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4"
            >
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {editingPort ? 'Edit Port' : 'Add New Port'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingPort(null);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Port Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={portData.name}
                    onChange={(e) => setPortData({ ...portData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                      focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={portData.country}
                    onChange={(e) => setPortData({ ...portData, country: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                      focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Region *
                  </label>
                  <select
                    required
                    value={portData.region}
                    onChange={(e) => setPortData({ ...portData, region: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                      focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Region</option>
                    {regions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={portData.isActive}
                    onChange={(e) => setPortData({ ...portData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded 
                      focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Active
                  </label>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingPort(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg 
                      hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg 
                      hover:bg-blue-700 transition-colors"
                  >
                    {editingPort ? 'Update Port' : 'Add Port'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 