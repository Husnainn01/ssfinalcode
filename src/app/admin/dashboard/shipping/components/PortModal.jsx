import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaUpload } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import PortFileUploadModal from './PortFileUploadModal';

export default function PortModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  portData, 
  setPortData, 
  isEditing = false 
}) {
  // Hardcoded Japan ports
  const japanPorts = [
    'YOKOHAMA',
    'KISARAZU',
    'KAWASAKI',
    'HITACHINAKA',
    'HAKATA',
    'KANDA',
    'FUKUOKA',
    'KOBE',
    'MOJI',
    'NAGOYA',
    'AICHI',
    'OSAKA',
    'SAKAI',
    'SHIMONOSEKI',
    'TOYAMA'
  ];

  const [destinationPorts, setDestinationPorts] = useState({});
  const [loading, setLoading] = useState(true);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);

  // Fetch only destination ports from the database
  const fetchDestinationPorts = async () => {
    try {
      const response = await fetch('/api/ports');
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);

      // Group ports by region (excluding Japan)
      const groupedPorts = data
        .filter(port => port.isActive)
        .reduce((acc, port) => {
          if (!acc[port.region]) {
            acc[port.region] = [];
          }
          acc[port.region].push(port.name);
          return acc;
        }, {});

      setDestinationPorts(groupedPorts);
    } catch (error) {
      toast.error('Failed to load destination ports');
      console.error('Error loading ports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUploadSuccess = () => {
    fetchDestinationPorts();
  };

  useEffect(() => {
    if (isOpen) {
      fetchDestinationPorts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-semibold text-gray-800">
              {isEditing ? 'Edit Schedule' : 'Add New Schedule'}
            </h2>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setIsFileModalOpen(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                  transition-colors flex items-center space-x-2"
              >
                <FaUpload className="w-4 h-4" />
                <span>Upload Ports</span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={onSubmit} className="p-6 space-y-6">
            {/* Voyage Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                VOY NO *
              </label>
              <input
                type="text"
                required
                value={portData.voyageNo}
                onChange={(e) => setPortData({ ...portData, voyageNo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                  focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter voyage number"
              />
            </div>

            {/* Shipping Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Company *
              </label>
              <input
                type="text"
                required
                value={portData.company}
                onChange={(e) => setPortData({ ...portData, company: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                  focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter shipping company name"
              />
            </div>

            {/* Ship Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ship Name *
              </label>
              <input
                type="text"
                required
                value={portData.shipName}
                onChange={(e) => setPortData({ ...portData, shipName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                  focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter ship name"
              />
            </div>

            {/* Japan Ports */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Japan Ports *
              </label>
              <div className="grid grid-cols-2 gap-4">
                {japanPorts.map((port) => (
                  <div key={port} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`japan-${port}`}
                      checked={portData.japanPorts?.includes(port)}
                      onChange={(e) => {
                        const updatedPorts = e.target.checked
                          ? [...(portData.japanPorts || []), port]
                          : portData.japanPorts?.filter(p => p !== port);
                        setPortData({ ...portData, japanPorts: updatedPorts });
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor={`japan-${port}`} className="text-sm text-gray-700">
                      {port}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Destination Ports Section */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Destination Ports *
              </label>
              
              {/* Region tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.keys(destinationPorts).map((region) => (
                  <button
                    key={region}
                    type="button"
                    onClick={() => setPortData({
                      ...portData,
                      selectedRegion: region
                    })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${portData.selectedRegion === region 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {region}
                  </button>
                ))}
              </div>

              {/* Ports selection */}
              {portData.selectedRegion && destinationPorts[portData.selectedRegion] && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">{portData.selectedRegion} Ports</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {destinationPorts[portData.selectedRegion].map((port) => (
                      <div key={port} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`dest-${port}`}
                          checked={portData.destinationPorts?.includes(port)}
                          onChange={(e) => {
                            const updatedPorts = e.target.checked
                              ? [...(portData.destinationPorts || []), port]
                              : portData.destinationPorts?.filter(p => p !== port);
                            setPortData({ ...portData, destinationPorts: updatedPorts });
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                        />
                        <label htmlFor={`dest-${port}`} className="text-sm text-gray-700">
                          {port}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected ports summary */}
              {portData.destinationPorts?.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Ports:</h4>
                  <div className="flex flex-wrap gap-2">
                    {portData.destinationPorts.map((port) => (
                      <span
                        key={port}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {port}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Estimated Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Time (in days) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={portData.estimatedTime}
                onChange={(e) => setPortData({ ...portData, estimatedTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                  focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter estimated time"
              />
            </div>

            {/* Departure Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Departure Date *
              </label>
              <input
                type="date"
                required
                value={portData.departureDate}
                onChange={(e) => setPortData({ ...portData, departureDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                  focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={onClose}
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
                {isEditing ? 'Update Schedule' : 'Add Schedule'}
              </button>
            </div>
          </form>

          <PortFileUploadModal
            isOpen={isFileModalOpen}
            onClose={() => setIsFileModalOpen(false)}
            onUploadSuccess={handleFileUploadSuccess}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 