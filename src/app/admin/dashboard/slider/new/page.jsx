'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaUpload, FaArrowLeft, FaSave } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function AddSlider() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 0,
    isActive: true,
    link: '',
    highlight: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateImage = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload only JPG or PNG images');
      return false;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size should be less than 5MB');
      return false;
    }
    return true;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && validateImage(file)) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file && validateImage(file)) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!imageFile) {
        toast.error('Please select an image');
        setLoading(false);
        return;
      }

      // Create form data for Cloudinary upload
      const imageFormData = new FormData();
      imageFormData.append('file', imageFile);
      imageFormData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

      // Upload image to Cloudinary
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: imageFormData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const uploadData = await uploadResponse.json();
      console.log('Cloudinary response:', uploadData); // For debugging

      // Create slider with the uploaded image data and form data
      const sliderResponse = await fetch('/api/slider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          order: formData.order,
          isActive: formData.isActive,
          link: formData.link,
          highlight: formData.highlight,
          imageUrl: uploadData.secure_url,
          public_id: uploadData.public_id,
        }),
      });

      if (!sliderResponse.ok) {
        const error = await sliderResponse.json();
        throw new Error(error.message || 'Failed to create slider');
      }

      toast.success('Slider created successfully');
      router.push('/admin/dashboard/slider');
      router.refresh();
    } catch (error) {
      console.error('Error creating slider:', error);
      toast.error(error.message || 'Error creating slider');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto p-6"
    >
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaArrowLeft className="w-5 h-5" />
          </motion.button>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold"
          >
            Add New Slider
          </motion.h1>
        </div>
      </motion.div>

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit} 
        className="bg-white rounded-xl shadow-sm border p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Image Upload */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200
                ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                ${preview ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleImageChange}
                className="hidden"
                id="slider-image"
              />
              
              <AnimatePresence mode="wait">
                {preview ? (
                  <motion.div 
                    key="preview"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="space-y-4"
                  >
                    <motion.img
                      src={preview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                      layoutId="previewImage"
                    />
                    <motion.label
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      htmlFor="slider-image"
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm text-blue-600 
                        hover:text-blue-700 cursor-pointer"
                    >
                      <FaUpload className="w-4 h-4" />
                      Change Image
                    </motion.label>
                  </motion.div>
                ) : (
                  <motion.label
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    htmlFor="slider-image"
                    className="flex flex-col items-center gap-3 cursor-pointer p-8"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <FaUpload className="w-10 h-10 text-gray-400" />
                    </motion.div>
                    <div className="text-gray-600">
                      <span className="text-blue-600 hover:text-blue-700">Upload an image</span>
                      {' '}or drag and drop
                    </div>
                    <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                  </motion.label>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Right Column - Form Fields */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Title Input */}
            <motion.div whileHover={{ scale: 1.01 }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title (optional)
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                  focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </motion.div>

            {/* Description Input */}
            <motion.div whileHover={{ scale: 1.01 }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                  focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </motion.div>

            {/* Highlight Text Input */}
            <motion.div whileHover={{ scale: 1.01 }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Highlight Text
              </label>
              <input
                type="text"
                name="highlight"
                value={formData.highlight}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                  focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              {/* Order Input */}
              <motion.div whileHover={{ scale: 1.01 }}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                    focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </motion.div>

              {/* Link Input */}
              <motion.div whileHover={{ scale: 1.01 }}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link (optional)
                </label>
                <input
                  type="text"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                    focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </motion.div>
            </div>

            {/* Active Checkbox */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2"
            >
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Active
              </label>
            </motion.div>
          </motion.div>
        </div>

        {/* Form Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex justify-end gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 
              transition-all duration-200"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className={`px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 
              transition-all duration-200 flex items-center gap-2
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FaSave className="w-4 h-4" />
            {loading ? 'Creating...' : 'Create Slider'}
          </motion.button>
        </motion.div>
      </motion.form>
    </motion.div>
  );
} 