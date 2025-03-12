import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaUpload, FaFileExcel, FaDownload } from 'react-icons/fa';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';

export default function PortFileUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (
      selectedFile.type === 'application/vnd.ms-excel' || 
      selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      selectedFile.type === 'text/csv'
    )) {
      setFile(selectedFile);
    } else {
      toast.error('Please select a valid Excel or CSV file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/ports/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast.success(`Ports uploaded successfully! ${data.count} ports processed.`);
      onUploadSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to upload ports');
    } finally {
      setLoading(false);
      setFile(null);
    }
  };

  const downloadTemplate = () => {
    try {
      // Sample data
      const sampleData = [
        // Headers
        [
          'Region',
          'Port Name',
          'Country',
          'Is Active'
        ],
        // Sample data
        ['Asia', 'SINGAPORE', 'Singapore', 'TRUE'],
        ['Asia', 'HONG KONG', 'China', 'TRUE'],
        ['Europe', 'ROTTERDAM', 'Netherlands', 'TRUE'],
        ['Middle East', 'DUBAI', 'UAE', 'TRUE'],
        ['Africa', 'DURBAN', 'South Africa', 'TRUE'],
        ['Oceania', 'SYDNEY', 'Australia', 'TRUE']
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(sampleData);

      // Set column widths
      ws['!cols'] = [
        { wch: 15 },  // Region
        { wch: 20 },  // Port Name
        { wch: 20 },  // Country
        { wch: 10 }   // Is Active
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Ports Template');

      // Add instructions sheet
      const instructionsData = [
        ['Ports Data Template Instructions'],
        [''],
        ['Valid Regions:'],
        ['- Africa'],
        ['- Asia'],
        ['- Europe'],
        ['- Middle East'],
        ['- Oceania'],
        [''],
        ['Format Requirements:'],
        ['1. Region: Must be exactly as listed above'],
        ['2. Port Name: Use UPPERCASE letters'],
        ['3. Country: Use proper country names'],
        ['4. Is Active: Use TRUE or FALSE'],
      ];

      const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
      wsInstructions['!cols'] = [{ wch: 60 }];
      XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

      XLSX.writeFile(wb, 'ports_template.xlsx');
      toast.success('Template downloaded successfully');
    } catch (error) {
      toast.error('Failed to download template');
    }
  };

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
          className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
        >
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-semibold text-gray-800">Upload Ports Data</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Download Template Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={downloadTemplate}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white 
                  rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaDownload className="w-4 h-4" />
                <span>Download Template</span>
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Required Columns:</h3>
              <ul className="text-sm text-blue-700 list-disc list-inside">
                <li>Region (Africa, Asia, Europe, Middle East, Oceania)</li>
                <li>Port Name (in UPPERCASE)</li>
                <li>Country</li>
                <li>Is Active (TRUE/FALSE)</li>
              </ul>
            </div>

            {/* File Upload Area */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Excel or CSV File
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg 
                  border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-500">
                  {file ? (
                    <>
                      <FaFileExcel className="w-8 h-8 text-green-500" />
                      <span className="mt-2 text-sm text-gray-500">{file.name}</span>
                    </>
                  ) : (
                    <>
                      <FaUpload className="w-8 h-8 text-gray-400" />
                      <span className="mt-2 text-sm text-gray-500">
                        Click to select a file
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 
                  transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !file}
                className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center space-x-2
                  ${loading || !file
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <FaUpload className="w-4 h-4" />
                    <span>Upload</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 