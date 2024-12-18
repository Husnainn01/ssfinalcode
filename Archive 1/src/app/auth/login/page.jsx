"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import { Loader2 } from 'lucide-react'
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
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <motion.div
          className="flex-1 bg-gradient-to-br from-gray-900 via-slate-800 to-slate-900"
          initial={false}
          animate={{
            x: isLogin ? "0%" : "100%",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <motion.div
            className={`h-full flex items-center justify-center text-white p-10 backdrop-blur-sm ${inter.variable}`}
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
          className="flex-1 flex items-center justify-center p-8"
          initial={false}
          animate={{
            x: isLogin ? "0%" : "-100%",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Card className="w-full max-w-md shadow-xl border-0">
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
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700">Email</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter your email" 
                                  type="email" 
                                  {...field} 
                                  disabled={isLoading}
                                  className="h-11"
                                />
                              </FormControl>
                              <FormMessage className="text-sm" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700">Password</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="Enter your password" 
                                  {...field} 
                                  disabled={isLoading}
                                  className="h-11"
                                />
                              </FormControl>
                              <FormMessage className="text-sm" />
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
                          className="w-full h-11 text-base font-medium"
                          disabled={isLoading || !loginForm.formState.isValid}
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
      <Toaster />
    </LayoutGroup>
  )
}

