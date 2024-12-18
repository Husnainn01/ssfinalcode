"use client"
import { useState, useEffect } from 'react';
import { Input, Button, Select, SelectItem } from "@nextui-org/react";
import { ToastContainer, toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { ADMIN_ROLES } from '@/lib/permissions';

export default function EditUser({ isOpen, onClose, onSuccess, user }) {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    lastName: '',
    email: '',
    role: '',
    isActive: true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        name: user.name || '',
        lastName: user.lastName || '',
        email: user.email || '',
        role: user.role || '',
        isActive: user.isActive
      });
      setErrors({});
    }
  }, [user]);

  // Validate single field
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'First name is required';
        if (value.length < 2) return 'First name must be at least 2 characters';
        return '';
      
      case 'lastName':
        if (!value.trim()) return 'Last name is required';
        if (value.length < 2) return 'Last name must be at least 2 characters';
        return '';
      
      case 'email':
        if (!value) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return '';
      
      default:
        return '';
    }
  };

  // Handle input change with immediate validation
  const handleInputChange = (e, fieldName) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Validate the field immediately
    const error = validateField(fieldName, value);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate all fields
    Object.keys(formData).forEach(key => {
      if (key !== 'role' && key !== 'isActive') { // Skip role and isActive validation
        const error = validateField(key, formData[key]);
        if (error) {
          newErrors[key] = error;
        }
      }
    });

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      toast.error(
        <div>
          <div>Please fix the following errors:</div>
          {Object.entries(newErrors).map(([field, error]) => (
            <div key={field}>• {error}</div>
          ))}
        </div>,
        {
          position: "bottom-right",
          autoClose: 5000
        }
      );
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, _id: user._id }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'Email already exists') {
          setErrors(prev => ({ ...prev, email: 'Email already exists' }));
          toast.error('Email already exists', {
            position: "bottom-right",
            autoClose: 3000
          });
          return;
        }
        throw new Error(data.error || 'Failed to update user');
      }

      toast.success('User updated successfully!', {
        position: "bottom-right",
        autoClose: 2000
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Failed to update user', {
        position: "bottom-right",
        autoClose: 3000
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white p-8 rounded-xl w-[450px] shadow-2xl transform"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Edit User</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Input
                  label="Username"
                  value={formData.username}
                  onChange={(e) => handleInputChange(e, 'username')}
                  isInvalid={!!errors.username}
                  errorMessage={errors.username}
                  required
                  className="w-full"
                />
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Input
                  label="First Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange(e, 'name')}
                  onBlur={(e) => handleInputChange(e, 'name')}
                  isInvalid={!!errors.name}
                  errorMessage={errors.name}
                  required
                  className="w-full"
                />
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Input
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange(e, 'lastName')}
                  onBlur={(e) => handleInputChange(e, 'lastName')}
                  isInvalid={!!errors.lastName}
                  errorMessage={errors.lastName}
                  required
                  className="w-full"
                />
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Select
                  label="Role"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full"
                >
                  {Object.entries(ADMIN_ROLES).map(([key, value]) => (
                    <SelectItem key={value} value={value}>
                      {key.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </Select>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Select
                  label="Status"
                  selectedKeys={[formData.isActive.toString()]}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                  className="w-full"
                >
                  <SelectItem key="true" value="true">Active</SelectItem>
                  <SelectItem key="false" value="false">Inactive</SelectItem>
                </Select>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex justify-end gap-3 mt-8"
              >
                <Button
                  color="danger"
                  onClick={onClose}
                  className="transition-transform duration-200 hover:scale-105"
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  className="transition-transform duration-200 hover:scale-105"
                >
                  Update User
                </Button>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      )}
      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="transition-transform duration-200"
      />
    </AnimatePresence>
  );
} 