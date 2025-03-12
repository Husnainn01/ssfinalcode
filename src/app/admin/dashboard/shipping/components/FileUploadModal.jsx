import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaUpload, FaFileExcel, FaDownload } from 'react-icons/fa';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';

export default function FileUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const downloadTemplate = () => {
    try {
      // Sample data
      const sampleData = [
        // Headers
        [
          'VOY NO',
          'Company',
          'Ship Name',
          'Japan Ports',
          'Destination Ports',
          'Estimated Time',
          'Departure Date'
        ],
        // Sample row 1
        [
          'VOY001',
          'Ocean Shipping Co.',
          'Star Voyager',
          'YOKOHAMA, KOBE, NAGOYA',
          'SINGAPORE, HONG KONG',
          '14',
          '2024-03-25'
        ],
        // Sample row 2
        [
          'VOY002',
          'Pacific Lines',
          'Sea Pioneer',
          'TOKYO, OSAKA',
          'BUSAN, SHANGHAI',
          '10',
          '2024-04-01'
        ],
        // Sample row 3
        [
          'VOY003',
          'Global Maritime',
          'Ocean Queen',
          'YOKOHAMA, SHIMIZU',
          'MANILA, JAKARTA',
          '12',
          '2024-04-15'
        ]
      ];

      // Create a new workbook
      const wb = XLSX.utils.book_new();
      
      // Create the worksheet with sample data
      const ws = XLSX.utils.aoa_to_sheet(sampleData);

      // Set column widths
      const colWidths = [
        { wch: 10 },  // VOY NO
        { wch: 20 },  // Company
        { wch: 15 },  // Ship Name
        { wch: 30 },  // Japan Ports
        { wch: 30 },  // Destination Ports
        { wch: 15 },  // Estimated Time
        { wch: 15 }   // Departure Date
      ];
      ws['!cols'] = colWidths;

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Schedule Template');

      // Add a new sheet with instructions
      const instructionsData = [
        ['Shipping Schedule Template Instructions'],
        [''],
        ['Required Fields:'],
        ['1. VOY NO - Unique voyage number'],
        ['2. Company - Shipping company name'],
        ['3. Ship Name - Name of the vessel'],
        ['4. Japan Ports - Comma-separated list of ports in Japan'],
        ['5. Destination Ports - Comma-separated list of destination ports'],
        ['6. Estimated Time - Transit time in days (numbers only)'],
        ['7. Departure Date - Date format: YYYY-MM-DD'],
        [''],
        ['Notes:'],
        ['- All fields are required'],
        ['- For ports, separate multiple values with commas'],
        ['- Date must be in YYYY-MM-DD format'],
        ['- Estimated time must be a number'],
        [''],
        ['Available Japan Ports:'],
        ['YOKOHAMA, KISARAZU, KAWASAKI, HITACHINAKA, HAKATA'],
        ['KANDA, FUKUOKA, KOBE, MOJI, NAGOYA'],
        ['AICHI, OSAKA, SAKAI, SHIMONOSEKI, TOYAMA']
      ];

      const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
      wsInstructions['!cols'] = [{ wch: 60 }]; // Set column width for instructions
      XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

      // Save the file
      XLSX.writeFile(wb, 'shipping_schedule_template.xlsx');
      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download template');
    }
  };

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
      const response = await fetch('/api/shipping/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast.success(`File uploaded successfully! ${data.count} records processed.`);
      onUploadSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setLoading(false);
      setFile(null);
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
            <h2 className="text-2xl font-semibold text-gray-800">Upload Schedule File</h2>
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
                <span>Download Template with Sample Data</span>
              </button>
            </div>

            {/* Helper text */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Required Excel Columns:</h3>
              <ul className="text-sm text-blue-700 list-disc list-inside">
                <li>VOY NO (Voyage Number)</li>
                <li>Company (Shipping Company)</li>
                <li>Ship Name (Vessel Name)</li>
                <li>Japan Ports (comma-separated)</li>
                <li>Destination Ports (comma-separated)</li>
                <li>Estimated Time (in days)</li>
                <li>Departure Date (YYYY-MM-DD format)</li>
              </ul>
            </div>

            {/* File Upload Area */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Excel or CSV File
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-500 transition-colors">
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
            <div className="flex justify-end space-x-4 pt-4">
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