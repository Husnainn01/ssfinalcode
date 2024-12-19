"use client"
import React, { useState } from 'react';
import { Input, Button } from "@nextui-org/react";
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      const data = await response.json();
      console.log('Login response:', data);
      
      if (response.ok && data.success) {
        console.log('Login successful');
        auth.setIsAuthenticated(true);
        auth.setAuthChecked(true);
        router.replace('/admin/dashboard');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <form onSubmit={handleLogin} className="bg-white/10 backdrop-blur-lg p-8 rounded-xl shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-6">Admin Login</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-500">
              {error}
            </div>
          )}

          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            startContent={<MailIcon className="text-gray-400" />}
            className="mb-4"
            required
          />

          <Input
            type={isVisible ? "text" : "password"}
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            startContent={<LockIcon className="text-gray-400" />}
            endContent={
              <button type="button" onClick={() => setIsVisible(!isVisible)}>
                {isVisible ? (
                  <EyeOffIcon className="text-gray-400" />
                ) : (
                  <EyeIcon className="text-gray-400" />
                )}
              </button>
            }
            className="mb-6"
            required
          />

          <Button
            type="submit"
            color="primary"
            className="w-full"
            isLoading={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
