"use client"
import { useState } from 'react';
import { Input, Button, Select, SelectItem } from "@nextui-org/react";
import { ToastContainer, toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

export default function AddUser({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    lastName: '',
    email: '',
    password: '',
    isActive: true
  });

  const [errors, setErrors] = useState({});

  // Validate single field
  const validateField = (name, value) => {
    switch (name) {
      case 'username':
        if (!value.trim()) return 'Username is required';
        if (value.length < 3) return 'Username must be at least 3 characters';
        return '';
      
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
      
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      
      default:
        return '';
    }
  };

  const handleInputChange = (e, fieldName) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Validate field and update errors
    const error = validateField(fieldName, value);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'Email already exists') {
          setErrors(prev => ({ ...prev, email: 'Email already exists' }));
          toast.error('Email already exists', {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          return;
        }
        throw new Error(data.message || data.error || 'Failed to add user');
      }

      // Show success message before closing the modal
      toast.success('User added successfully!', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Small delay to ensure toast is visible before modal closes
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }, 500);

    } catch (error) {
      console.error('Error details:', error);
      toast.error(error.message || 'Failed to add user', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h2 className="text-2xl font-bold mb-4">Add New User</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Username"
                value={formData.username}
                onChange={(e) => handleInputChange(e, 'username')}
                errorMessage={errors.username}
                isInvalid={!!errors.username}
              />
              
              <Input
                label="First Name"
                value={formData.name}
                onChange={(e) => handleInputChange(e, 'name')}
                errorMessage={errors.name}
                isInvalid={!!errors.name}
              />
              
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleInputChange(e, 'lastName')}
                errorMessage={errors.lastName}
                isInvalid={!!errors.lastName}
              />
              
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange(e, 'email')}
                errorMessage={errors.email}
                isInvalid={!!errors.email}
              />
              
              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange(e, 'password')}
                errorMessage={errors.password}
                isInvalid={!!errors.password}
              />
              
              <Select
                label="Status"
                value={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
              >
                <SelectItem key="true" value="true">Active</SelectItem>
                <SelectItem key="false" value="false">Inactive</SelectItem>
              </Select>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  type="submit"
                >
                  Add User
                </Button>
              </div>
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
      />
    </AnimatePresence>
  );
} 