"use client"
import React, { useState } from 'react';
import { Input, Button, Card, CardBody, Divider } from "@nextui-org/react";
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon, ShieldIcon, ActivityIcon, UserIcon, Settings2Icon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';

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
      
      if (response.ok && data.success) {
        auth.setIsAuthenticated(true);
        auth.setAuthChecked(true);
        auth.setUser(data.user);
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

  const features = [
    { 
      icon: UserIcon, 
      title: "User Management", 
      desc: "Manage user roles and permissions",
      gradient: "from-purple-500/20 to-pink-500/20"
    },
    { 
      icon: ShieldIcon, 
      title: "Security", 
      desc: "Advanced security protocols",
      gradient: "from-indigo-500/20 to-purple-500/20"
    },
    { 
      icon: ActivityIcon, 
      title: "Monitoring", 
      desc: "Real-time system monitoring",
      gradient: "from-violet-500/20 to-indigo-500/20"
    },
    { 
      icon: Settings2Icon, 
      title: "Access Control", 
      desc: "Granular access management",
      gradient: "from-fuchsia-500/20 to-violet-500/20"
    }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Login Form */}
      <div className="w-full lg:w-[45%] xl:w-[40%] bg-white flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <Image
              src="/images/logo.png"
              alt="Company Logo"
              width={150}
              height={40}
              className="mb-8"
            />
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 mt-2">Please enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-md"
              >
                <div className="flex items-center">
                  <ShieldIcon className="w-5 h-5 text-red-500 mr-2" />
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              </motion.div>
            )}

            <div className="space-y-4">
              <Input
                type="email"
                label="Email address"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                startContent={<MailIcon className="text-gray-400" />}
                variant="bordered"
                classNames={{
                  input: "text-gray-800",
                  label: "text-gray-500"
                }}
                required
              />

              <Input
                type={isVisible ? "text" : "password"}
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                startContent={<LockIcon className="text-gray-400" />}
                endContent={
                  <button 
                    type="button" 
                    onClick={() => setIsVisible(!isVisible)}
                    className="focus:outline-none"
                  >
                    {isVisible ? (
                      <EyeOffIcon className="text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <EyeIcon className="text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                }
                variant="bordered"
                classNames={{
                  input: "text-gray-800",
                  label: "text-gray-500"
                }}
                required
              />
            </div>

            <Button
              type="submit"
              color="primary"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all duration-200"
              isLoading={loading}
              size="lg"
              startContent={!loading && <LockIcon className="w-4 h-4" />}
            >
              {loading ? 'Authenticating...' : 'Sign in securely'}
            </Button>
          </form>

          <div className="mt-8">
            <Divider className="my-4" />
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <ActivityIcon className="w-4 h-4" />
              <span>System Status: Operational</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Section - Background & Features */}
      <div className="hidden lg:block lg:w-[55%] xl:w-[60%] bg-gradient-to-br from-[#2E0846] via-[#3a0a59] to-[#2E0846] p-8 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="h-full flex flex-col justify-between relative z-10"
        >
          <div>
            <motion.h2 
              className="text-4xl font-bold text-white mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Admin Dashboard
            </motion.h2>
            <motion.p 
              className="text-purple-100 text-lg mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Access your administrative tools and manage your system efficiently.
            </motion.p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.95 }}
                className={`
                  bg-gradient-to-br ${feature.gradient} 
                  backdrop-blur-lg rounded-xl p-6 
                  border border-white/10 
                  hover:border-white/20 
                  transition-all duration-300 
                  cursor-pointer
                  group
                `}
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-white/10 rounded-lg p-3 group-hover:bg-white/20 transition-colors duration-300">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2 group-hover:text-purple-200 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-purple-200/80 text-sm group-hover:text-purple-100 transition-colors duration-300">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="mt-auto pt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            <p className="text-purple-200/60 text-sm text-center">
              © 2024 SS Holdings Admin. All rights reserved.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Add these styles to your global CSS */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
