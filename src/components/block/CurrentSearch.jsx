"use client";
import React, { useState, useEffect } from 'react';
import { FaSearch, FaBell, FaBookmark, FaCheckCircle, FaTimesCircle, FaUndo } from 'react-icons/fa';
import { useSearchParams, useRouter } from 'next/navigation';
import { Modal, ModalContent, Select, SelectItem } from "@nextui-org/react";

const CurrentSearch = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // States for form data
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch makes on component mount
  useEffect(() => {
    const fetchMakes = async () => {
      try {
        console.log('Fetching makes...');
        const response = await fetch('/api/vehicles/makes');
        console.log('Makes API response:', response);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received makes:', data);
        
        if (Array.isArray(data)) {
          setMakes(data);
        } else {
          console.error('Received invalid makes data:', data);
        }
      } catch (error) {
        console.error('Error fetching makes:', error);
      }
    };
    fetchMakes();
  }, []);

  // Fetch models when make changes
  useEffect(() => {
    const fetchModels = async () => {
      if (!selectedMake) return;
      try {
        const response = await fetch(`/api/vehicles/models?make=${selectedMake}`);
        const data = await response.json();
        setModels(data);
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    };
    fetchModels();
  }, [selectedMake]);

  // Fetch years when model changes
  useEffect(() => {
    const fetchYears = async () => {
      if (!selectedMake || !selectedModel) return;
      try {
        const response = await fetch(`/api/vehicles/years?make=${selectedMake}&model=${selectedModel}`);
        const data = await response.json();
        setYears(data);
      } catch (error) {
        console.error('Error fetching years:', error);
      }
    };
    fetchYears();
  }, [selectedMake, selectedModel]);

  // Handle search updates
  const updateSearch = () => {
    const params = new URLSearchParams(searchParams);
    if (selectedMake) params.set('make', selectedMake);
    if (selectedModel) params.set('model', selectedModel);
    if (selectedYear) params.set('year', selectedYear);
    router.push(`?${params.toString()}`);
  };

  // Handle email alert subscription
  const handleEmailAlert = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchParams: {
            make: selectedMake,
            model: selectedModel,
            year: selectedYear
          }
        }),
      });

      if (!response.ok) throw new Error('Failed to set alert');

      setModalStatus({
        type: 'success',
        message: 'You will receive email notifications for new vehicles matching your search criteria.'
      });
      setShowModal(true);

    } catch (error) {
      console.error('Error setting alert:', error);
      setModalStatus({
        type: 'error',
        message: 'We couldn\'t set up your email alerts. Please try again.'
      });
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle save search
  const handleSaveSearch = async () => {
    try {
      const response = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchParams: {
            make: selectedMake,
            model: selectedModel,
            year: selectedYear
          }
        }),
      });

      if (!response.ok) throw new Error('Failed to save search');

      setModalStatus({
        type: 'success',
        message: 'Your search has been saved successfully.'
      });
      setShowModal(true);

    } catch (error) {
      setModalStatus({
        type: 'error',
        message: 'Failed to save your search. Please try again.'
      });
      setShowModal(true);
    }
  };

  // Add reset function
  const handleReset = () => {
    setSelectedMake('');
    setSelectedModel('');
    setSelectedYear('');
    setModels([]);
    setYears([]);
    
    // Reset URL params
    const params = new URLSearchParams(searchParams);
    params.delete('make');
    params.delete('model');
    params.delete('year');
    router.push(`?${params.toString()}`);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden w-[520px]">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaSearch className="text-orange-500" />
              <h2 className="text-sm font-semibold text-gray-800">Current search</h2>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            >
              <FaUndo className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-4">
            {/* Search Filters */}
            <div className="grid grid-cols-3 gap-4">
              <Select
                label="Make"
                placeholder="Select make"
                value={selectedMake}
                onChange={(e) => setSelectedMake(e.target.value)}
                className="w-full"
              >
                {makes.map((make) => (
                  <SelectItem key={make} value={make}>
                    {make}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Model"
                placeholder="Select model"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                isDisabled={!selectedMake}
                className="w-full"
              >
                {models.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Year"
                placeholder="Select year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                isDisabled={!selectedModel}
                className="w-full"
              >
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
              <button 
                onClick={handleEmailAlert}
                disabled={isLoading || (!selectedMake && !selectedModel && !selectedYear)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs ${
                  (!selectedMake && !selectedModel && !selectedYear)
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                } rounded-md transition-colors`}
              >
                <FaBell className="w-3 h-3" />
                <span>{isLoading ? 'Setting up...' : 'Get email alerts'}</span>
              </button>

              <button 
                onClick={handleSaveSearch}
                disabled={!selectedMake && !selectedModel && !selectedYear}
                className={`flex items-center gap-2 px-4 py-1.5 text-xs ${
                  (!selectedMake && !selectedModel && !selectedYear)
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'text-white bg-[#629584] hover:bg-[#387478]'
                } rounded-md transition-colors`}
              >
                <FaBookmark className="w-3 h-3" />
                <span>Save search</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Modal */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        size="sm"
      >
        <ModalContent>
          <div className="p-6">
            <div className="flex flex-col items-center text-center">
              {modalStatus.type === 'success' ? (
                <div className="mb-4 text-green-500">
                  <FaCheckCircle size={48} />
                </div>
              ) : (
                <div className="mb-4 text-red-500">
                  <FaTimesCircle size={48} />
                </div>
              )}

              <h3 className={`text-lg font-semibold mb-2 ${
                modalStatus.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {modalStatus.type === 'success' ? 'Success!' : 'Error'}
              </h3>

              <p className="text-gray-600 text-sm mb-6">
                {modalStatus.message}
              </p>

              <button
                className={`px-4 py-2 rounded-md text-white ${
                  modalStatus.type === 'success' 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-red-500 hover:bg-red-600'
                }`}
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CurrentSearch; 