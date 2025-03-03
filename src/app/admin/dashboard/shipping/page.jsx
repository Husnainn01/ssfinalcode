'use client';
import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import PortModal from './components/PortModal';

const regions = [
  { id: 'japan', name: 'Japan' },
  { id: 'africa', name: 'Africa' },
  { id: 'europe', name: 'Europe' },
  { id: 'middleEast', name: 'Middle East' },
  { id: 'asia', name: 'Asia' },
  { id: 'oceania', name: 'Oceania' },
];

export default function ShippingSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [portData, setPortData] = useState({
    voyageNo: '',
    company: '',
    shipName: '',
    japanPorts: [],
    selectedRegion: '',
    destinationPorts: [],
    estimatedTime: '',
    departureDate: '',
    isActive: true
  });

  // Fetch all schedules
  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/shipping');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSchedules(data);
    } catch (error) {
      toast.error('Failed to fetch schedules');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // Handle form submission (create/update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingSchedule 
        ? `/api/shipping/${editingSchedule._id}`
        : '/api/shipping';
      
      const method = editingSchedule ? 'PUT' : 'POST';
      
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
        editingSchedule 
          ? 'Schedule updated successfully' 
          : 'Schedule created successfully'
      );
      
      setIsModalOpen(false);
      setEditingSchedule(null);
      resetForm();
      fetchSchedules();
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
      console.error('Error:', error);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;

    try {
      const response = await fetch(`/api/shipping/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast.success('Schedule deleted successfully');
      fetchSchedules();
    } catch (error) {
      toast.error('Failed to delete schedule');
      console.error('Error:', error);
    }
  };

  // Handle edit
  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setPortData({
      voyageNo: schedule.voyageNo,
      company: schedule.company,
      shipName: schedule.shipName,
      japanPorts: schedule.japanPorts,
      destinationPorts: schedule.destinationPorts,
      estimatedTime: schedule.estimatedTime,
      departureDate: new Date(schedule.departureDate).toISOString().split('T')[0],
      isActive: schedule.isActive
    });
    setIsModalOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setPortData({
      voyageNo: '',
      company: '',
      shipName: '',
      japanPorts: [],
      selectedRegion: '',
      destinationPorts: [],
      estimatedTime: '',
      departureDate: '',
      isActive: true
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Shipping Schedule Management</h1>
          <p className="text-gray-600">Manage shipping routes and schedules</p>
        </div>
      </div>

      {/* Add Schedule Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          resetForm();
          setIsModalOpen(true);
        }}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
          transition-colors flex items-center gap-2"
      >
        <FaPlus className="w-4 h-4" />
        Add New Schedule
      </motion.button>

      {/* Schedules Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                VOY NO
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ship Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Japan Ports
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Destination Ports
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Est. Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Departure
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="9" className="px-6 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : schedules.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-4 text-center">
                  No schedules found
                </td>
              </tr>
            ) : (
              schedules.map((schedule) => (
                <motion.tr
                  key={schedule._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">{schedule.voyageNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{schedule.company}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{schedule.shipName}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {schedule.japanPorts.map((port) => (
                        <span key={port} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {port}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {schedule.destinationPorts.map((port) => (
                        <span key={port} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {port}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {schedule.estimatedTime} days
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(schedule.departureDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      schedule.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {schedule.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(schedule)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <FaEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(schedule._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Port Modal */}
      <PortModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSchedule(null);
          resetForm();
        }}
        onSubmit={handleSubmit}
        portData={portData}
        setPortData={setPortData}
        isEditing={!!editingSchedule}
      />
    </motion.div>
  );
} 