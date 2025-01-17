"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import { Loader2, ChevronLeft, Home } from 'lucide-react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import countries from '@/data/countries.json'
import { useRouter } from 'next/navigation'
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useCustomerAuth } from '@/hooks/useCustomerAuth'
import RegisterForm from '../components/RegisterForm'

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { TypeAnimation } from 'react-type-animation';
import { Inter } from 'next/font/google'
import Link from 'next/link'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
})

const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" }),
})

// Add this function at the top of your file, outside the component
const getPasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++; // Special characters

  return {
    score: strength,
    label: strength === 0 ? 'Very Weak' 
      : strength === 1 ? 'Weak'
      : strength === 2 ? 'Fair'
      : strength === 3 ? 'Good'
      : strength === 4 ? 'Strong'
      : 'Very Strong',
    color: strength === 0 ? 'bg-red-500'
      : strength === 1 ? 'bg-orange-500'
      : strength === 2 ? 'bg-yellow-500'
      : strength === 3 ? 'bg-blue-500'
      : 'bg-green-500'
  };
};

// Mobile version of Auth Page with better mobile layout
function MobileAuthView({ 
  isLogin, 
  setIsLogin, 
  loginForm, 
  onLoginSubmit, 
  isLoading 
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#14225D] to-[#1a2d7c]">
      {/* Mobile Navigation */}
      <div className="px-4 pt-4 flex items-center justify-between text-white">
        <Link 
          href="/"
          className="flex items-center space-x-2 py-2 px-3 rounded-lg 
                   bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
        
        <Link 
          href="/"
          className="p-2 rounded-lg bg-white/10 backdrop-blur-sm 
                   hover:bg-white/20 transition-colors"
        >
          <Home className="h-5 w-5" />
        </Link>
      </div>

      {/* Mobile Header */}
      <div className="px-4 pt-8 pb-6 text-white text-center">
        <motion.h1 
          className="text-2xl font-bold mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {isLogin ? "Welcome Back!" : "Join Us Today"}
        </motion.h1>
        <motion.p 
          className="text-sm opacity-90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {isLogin 
            ? "Access your account securely"
            : "Create your account in minutes"
          }
        </motion.p>
      </div>

      {/* Form Card */}
      <div className="px-4 pb-4">
        <Card className="w-full shadow-xl border-none bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="text-xl font-semibold text-gray-800">
              {isLogin ? "Login" : "Register"}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              {isLogin
                ? "Enter your credentials below"
                : "Fill in your details to get started"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? "login" : "register"}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                transition={{ duration: 0.3 }}
              >
                {isLogin ? (
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Email</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your email" 
                                type="email" 
                                {...field} 
                                disabled={isLoading}
                                className={`h-11 ${fieldState.error ? 'border-red-500' : ''}`}
                              />
                            </FormControl>
                            {fieldState.error && (
                              <div className="text-sm text-red-500 mt-1">
                                {fieldState.error.message}
                              </div>
                            )}
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Enter your password" 
                                {...field} 
                                disabled={isLoading}
                                className={`h-11 ${fieldState.error ? 'border-red-500' : ''}`}
                              />
                            </FormControl>
                            {fieldState.error && (
                              <div className="text-sm text-red-500 mt-1">
                                {fieldState.error.message}
                              </div>
                            )}
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full h-11 bg-[#14225D] hover:bg-[#1a2d7c]" 
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Logging in...
                          </>
                        ) : (
                          "Log in"
                        )}
                      </Button>
                    </form>
                  </Form>
                ) : (
                  <RegisterForm onSuccess={() => setIsLogin(true)} />
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="button"
              variant="ghost"
              className="w-full text-[#14225D] hover:bg-[#14225D]/10"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin
                ? "Don't have an account? Register"
                : "Already have an account? Log in"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

// Main AuthPage Component
export default function AuthPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useCustomerAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  })

  // Add state for password strength
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: 'Very Weak',
    color: 'bg-red-500'
  });

  // Add this useEffect to handle redirect when authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/customer-dashboard')
    }
  }, [isAuthenticated, authLoading, router])

  // Add this useEffect to handle registration form
  useEffect(() => {
    // Check if we should show registration form
    const params = new URLSearchParams(window.location.search);
    if (params.get('register') === 'true') {
      setIsLogin(false);
    }
  }, []);

  const onLoginSubmit = async (values) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(values)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      toast({
        title: "Success",
        description: "Login successful!",
      });

      // Force a hard redirect to customer dashboard
      window.location.href = '/customer-dashboard';
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Login failed. Please try again.',
      });
      
      loginForm.setError('root', { 
        message: error.message || 'Login failed. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/user/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      if (response.ok) {
        // Clear customer token specifically
        document.cookie = 'customer_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        router.push('/customer/login')
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Update FormMessage component styling
  const FormMessageWithAnimation = ({ children }) => (
    <AnimatePresence mode="wait">
      {children && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="text-red-500 text-sm mt-1"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )

  const loginTypeEffect = (
    <TypeAnimation
      sequence={[
        'Welcome Back!', 
        2000,
        'Great to see you!',
        2000,
        'Hello Again!',
        2000,
      ]}
      wrapper="span"
      speed={50}
      repeat={Infinity}
      className="font-inter"
    />
  )

  const registerTypeEffect = (
    <TypeAnimation
      sequence={[
        'Join our community!',
        1000,
        'Start your journey!',
        1000,
        'Create your account!',
        1000,
        'Be part of our family!',
        1000,
      ]}
      wrapper="span"
      speed={75} // Slightly faster for registration
      repeat={Infinity}
      className="font-inter"
    />
  )

  const loginDescriptionEffect = (
    <TypeAnimation
      sequence={[
        'Log in to access your account and continue your journey.',
        1000,
      ]}
      wrapper="span"
      speed={50}
      className="font-inter"
    />
  )

  const registerDescriptionEffect = (
    <TypeAnimation
      sequence={[
        'Ready to begin? ',
        500,
        'Ready to begin? Register now to unlock exclusive features.',
        1000,
        'Ready to begin? Register now to unlock exclusive features and join our community.',
        1000,
      ]}
      wrapper="span"
      speed={65}
      className="font-inter"
    />
  )

  // If still checking auth status, show loading
  if (authLoading) {
    return <div>Loading...</div>
  }

  // If already authenticated, don't render the form
  if (isAuthenticated) {
    return null;
  }

  return (
    <LayoutGroup>
      {/* Desktop View - Keeping original code untouched */}
      <div className="hidden md:block">
        <div className="flex min-h-screen">
          <motion.div
            className="flex-1 bg-gradient-to-br from-gray-900 via-slate-800 to-slate-900 min-w-[50%]"
            initial={false}
            animate={{
              x: isLogin ? "0%" : "100%",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <motion.div
              className="h-full w-full flex items-center justify-center text-white p-10 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="max-w-md">
                <motion.h2
                  className="text-5xl font-semibold mb-8 tracking-tight"
                  initial={false}
                >
                  {isLogin ? loginTypeEffect : registerTypeEffect}
                </motion.h2>
                <motion.p
                  className="text-xl text-blue-100 leading-relaxed font-light"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  {isLogin ? loginDescriptionEffect : registerDescriptionEffect}
                </motion.p>
                <motion.div
                  className="mt-8 text-sm text-blue-200 font-light"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                >
                  <p className="font-inter">
                    {isLogin ? (
                      'Secure login • Fast access • Personalized experience'
                    ) : (
                      'Quick signup • Easy verification • Start exploring • Join community'
                    )}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="flex-1 flex items-center justify-center p-8 bg-[#629583] min-w-[50%]"
            initial={false}
            animate={{
              x: isLogin ? "0%" : "-100%",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Card className="w-full max-w-md shadow-xl border-0 bg-white">
              <CardHeader className="space-y-2 pb-2">
                <motion.div initial={false}>
                  <CardTitle className="text-2xl font-bold">
                    {isLogin ? "Login" : "Register"}
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    {isLogin
                      ? "Enter your credentials to access your account"
                      : "Create a new account to get started"}
                  </CardDescription>
                </motion.div>
              </CardHeader>
              <CardContent className="pt-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isLogin ? "login" : "register"}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isLogin ? (
                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                          <FormField
                            control={loginForm.control}
                            name="email"
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700">Email</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter your email" 
                                    type="email" 
                                    {...field} 
                                    disabled={isLoading}
                                    className={`h-11 ${fieldState.error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                  />
                                </FormControl>
                                {fieldState.error && (
                                  <div className="bg-red-50 border-l-4 border-red-500 p-2 mt-1 rounded-md">
                                    <div className="flex items-center gap-2">
                                      <svg 
                                        className="h-4 w-4 text-red-600" 
                                        viewBox="0 0 20 20" 
                                        fill="currentColor"
                                      >
                                        <path 
                                          fillRule="evenodd" 
                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                                          clipRule="evenodd" 
                                        />
                                      </svg>
                                      <p className="text-sm text-red-600 font-medium">
                                        {fieldState.error.message}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700">Password</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder="Enter your password" 
                                    {...field} 
                                    disabled={isLoading}
                                    className={`h-11 ${fieldState.error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                  />
                                </FormControl>
                                {fieldState.error && (
                                  <div className="bg-red-50 border-l-4 border-red-500 p-2 mt-1 rounded-md">
                                    <div className="flex items-center gap-2">
                                      <svg 
                                        className="h-4 w-4 text-red-600" 
                                        viewBox="0 0 20 20" 
                                        fill="currentColor"
                                      >
                                        <path 
                                          fillRule="evenodd" 
                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                                          clipRule="evenodd" 
                                        />
                                      </svg>
                                      <p className="text-sm text-red-600 font-medium">
                                        {fieldState.error.message}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </FormItem>
                            )}
                          />
                          {loginForm.formState.errors.root && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md"
                            >
                              {loginForm.formState.errors.root.message}
                            </motion.div>
                          )}
                          <Button 
                            type="submit" 
                            className="w-full bg-[#182454] hover:bg-[#182454]/90" 
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Logging in...
                              </>
                            ) : (
                              "Log in"
                            )}
                          </Button>
                        </form>
                      </Form>
                    ) : (
                      <RegisterForm onSuccess={() => setIsLogin(true)} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
              <CardFooter>
                <motion.div layout="position" className="w-full">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => setIsLogin(!isLogin)}
                  >
                    {isLogin
                      ? "Don't have an account? Register"
                      : "Already have an account? Log in"}
                  </Button>
                </motion.div>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <MobileAuthView
          isLogin={isLogin}
          setIsLogin={setIsLogin}
          loginForm={loginForm}
          onLoginSubmit={onLoginSubmit}
          isLoading={isLoading}
        />
      </div>

      <Toaster />
    </LayoutGroup>
  )
}

