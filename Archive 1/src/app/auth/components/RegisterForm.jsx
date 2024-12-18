"use client"

import React, { useState, useRef, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Mail, User, Lock, CheckCircle, Search } from 'lucide-react'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from 'next/navigation'
import { toast } from "@/components/ui/use-toast"
import countries from '@/data/countries.json'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Import UI components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { useAuth0 } from '@auth0/auth0-react';
import { FcGoogle } from "react-icons/fc";  // Google icon
import { FaFacebook } from "react-icons/fa"; // Facebook icon

// Separate schemas for each step
const emailSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
})

const verificationSchema = z.object({
  code: z.string().length(6, { message: "Verification code must be 6 digits" }),
})

const registrationSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  phoneNumber: z.object({
    countryCode: z.string().min(2, { message: "Please select a country code" }),
    number: z.string()
      .min(5, { message: "Phone number is required" })
      .regex(/^\d+$/, { message: "Please enter only numbers" })
  }),
  address: z.object({
    country: z.string().min(1, { message: "Country is required" }),
    port: z.string().min(1, { message: "Port is required" }),
    postCode: z.string().min(1, { message: "Post code is required" })
  }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

const steps = {
  EMAIL: 0,
  VERIFICATION: 1,
  REGISTRATION: 2,
  SUCCESS: 3,
}

const VerificationInput = ({ value, onChange, isLoading }) => {
  const inputRefs = Array(6).fill(0).map(() => useRef(null));

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleChange = (index, e) => {
    const newValue = e.target.value.replace(/[^0-9]/g, '');
    
    if (newValue.length <= 1) {
      const newCode = value.split('');
      newCode[index] = newValue;
      const finalValue = newCode.join('');
      onChange(finalValue);

      // Move to next input if we entered a number and there is a next input
      if (newValue.length === 1 && index < 5) {
        inputRefs[index + 1].current?.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    onChange(pastedData.padEnd(6, value.slice(pastedData.length)));
    
    // Focus the next empty input or the last input if all are filled
    const nextEmptyIndex = pastedData.length < 6 ? pastedData.length : 5;
    inputRefs[nextEmptyIndex].current?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array(6).fill(0).map((_, index) => (
        <input
          key={index}
          ref={inputRefs[index]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={isLoading}
          className="w-12 h-12 text-center text-2xl font-semibold border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
        />
      ))}
    </div>
  );
};

export default function RegisterForm({ onSuccess }) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(steps.EMAIL)
  const [isLoading, setIsLoading] = useState(false)
  const [verifiedEmail, setVerifiedEmail] = useState("")
  const [countrySearch, setCountrySearch] = useState("")
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const [localLoading, setLocalLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState({ google: false, facebook: false });

  // Separate forms for each step
  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" }
  })

  const verificationForm = useForm({
    resolver: zodResolver(verificationSchema),
    defaultValues: { code: "" }
  })

  const registrationForm = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: {
        countryCode: "",
        number: ""
      },
      address: {
        country: "",
        port: "",
        postCode: ""
      },
      password: "",
      confirmPassword: "",
    }
  })

  const handleEmailSubmit = async (values) => {
    setIsLoading(true);
    try {
      // Try local auth first
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setVerifiedEmail(values.email);
      setCurrentStep(steps.VERIFICATION);
      toast({
        title: "Verification Code Sent",
        description: "Please check your email for the verification code.",
      });
    } catch (error) {
      console.error('Email submission error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (values) => {
    setIsLoading(true)
    try {
      // Ensure code is a string and trim any whitespace
      const formattedCode = values.code.trim();
      
      console.log('Submitting verification code:', {
        email: verifiedEmail,
        code: formattedCode
      });

      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: verifiedEmail,
          code: formattedCode
        })
      });

      const data = await response.json();
      console.log('Verification response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify code');
      }

      registrationForm.setValue('email', verifiedEmail);
      setCurrentStep(steps.REGISTRATION);
      toast({
        title: "Email Verified",
        description: "Please complete your registration.",
      });
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrationSubmit = async (values) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Registration failed');
      }

      // Set success state
      setCurrentStep(steps.SUCCESS);
      toast({
        title: "Success",
        description: "Registration successful! Redirecting to dashboard...",
      });
      
      // Call the onSuccess callback (which should trigger login state update)
      if (onSuccess) {
        onSuccess();
      }

      // Add a login request here to get the authentication token
      const loginResponse = await fetch('/api/auth/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          password: values.password
        })
      });

      if (!loginResponse.ok) {
        throw new Error('Auto-login failed after registration');
      }

      // Redirect after ensuring login is successful
      setTimeout(() => {
        router.push('/customer-dashboard');
      }, 1500);

    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Registration failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCountries = useMemo(() => {
    return countries.filter(country => 
      country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      country.phone.includes(countrySearch) ||
      country.code.toLowerCase().includes(countrySearch.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [countrySearch]);

  const handleLocalSignIn = async () => {
    setLocalLoading(true);
    try {
      // Your local authentication logic here
    } catch (error) {
      console.error('Local sign-in error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign in locally. Please try again.",
      });
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSocialSignIn = useCallback(async (provider) => {
    try {
      setSocialLoading(prev => ({ ...prev, [provider]: true }));
      await loginWithRedirect({
        connection: provider,
        appState: {
          returnTo: '/customer-dashboard'
        }
      });
    } catch (error) {
      console.error('Social sign-in error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to sign in with ${provider}. Please try again.`,
      });
    } finally {
      setSocialLoading(prev => ({ ...prev, [provider]: false }));
    }
  }, [loginWithRedirect]);

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {currentStep === steps.EMAIL && (
          <motion.div
            key="email"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ 
              type: "spring",
              stiffness: 350,
              damping: 30
            }}
          >
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            {...field}
                            placeholder="Enter your email"
                            className="pl-10"
                            disabled={isLoading}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </form>
            </Form>
          </motion.div>
        )}

        {currentStep === steps.VERIFICATION && (
          <motion.div
            key="verification"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ 
              type: "spring",
              stiffness: 400,
              damping: 30
            }}
          >
            <Form {...verificationForm}>
              <form onSubmit={verificationForm.handleSubmit(handleVerificationSubmit)} className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600">
                    We've sent a verification code to
                  </p>
                  <p className="font-medium">{verifiedEmail}</p>
                </div>
                <FormField
                  control={verificationForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-center block">Enter Verification Code</FormLabel>
                      <FormControl>
                        <VerificationInput
                          value={field.value}
                          onChange={field.onChange}
                          isLoading={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify"
                  )}
                </Button>
                <div className="text-center text-sm">
                  <p className="text-gray-600">
                    Didn't receive the code?{" "}
                    <button
                      type="button"
                      onClick={() => handleEmailSubmit({ email: verifiedEmail })}
                      className="text-primary hover:underline disabled:opacity-50"
                      disabled={isLoading}
                    >
                      Resend
                    </button>
                  </p>
                </div>
              </form>
            </Form>
          </motion.div>
        )}

        {currentStep === steps.REGISTRATION && (
          <motion.div
            key="registration"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
            className="overflow-hidden"
          >
            <Form {...registrationForm}>
              <form onSubmit={registrationForm.handleSubmit(handleRegistrationSubmit)} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={registrationForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="First name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registrationForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Last name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Phone Number Fields */}
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={registrationForm.control}
                    name="phoneNumber.countryCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country Code</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white dark:bg-gray-950 max-h-[300px]">
                            <div className="sticky top-0 p-2 bg-white dark:bg-gray-950 border-b">
                              <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="Search country..."
                                  value={countrySearch}
                                  onChange={(e) => setCountrySearch(e.target.value)}
                                  className="pl-8"
                                />
                              </div>
                            </div>
                            <div className="max-h-[300px] overflow-auto">
                              {filteredCountries.map((country) => (
                                <SelectItem 
                                  key={country.code} 
                                  value={country.phone}
                                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                  <div className="flex items-center gap-2">
                                    <span>{country.flag}</span>
                                    <span className="font-medium">{country.name}</span>
                                    <span className="text-muted-foreground ml-auto">{country.phone}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </div>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registrationForm.control}
                    name="phoneNumber.number"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="tel"
                            placeholder="Phone number"
                            className="pl-3"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Address Fields */}
                <FormField
                  control={registrationForm.control}
                  name="address.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Country" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={registrationForm.control}
                    name="address.port"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Port</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Port" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registrationForm.control}
                    name="address.postCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Post Code</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Post code" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Password Fields */}
                <FormField
                  control={registrationForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registrationForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </Form>
          </motion.div>
        )}

        {currentStep === steps.SUCCESS && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 400,
              damping: 30
            }}
            className="text-center space-y-4"
          >
            <motion.div 
              className="flex justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <CheckCircle className="h-16 w-16 text-green-500" />
            </motion.div>
            <motion.h3 
              className="text-xl font-semibold"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Registration Successful!
            </motion.h3>
            <motion.p 
              className="text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Redirecting you to the dashboard...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Social Login Section */}
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          variant="outline"
          type="button"
          className="w-full"
          onClick={handleLocalSignIn}
          disabled={localLoading}
        >
          {localLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Sign in Locally"
          )}
        </Button>

        <Button
          variant="outline"
          type="button"
          className="w-full"
          onClick={() => handleSocialSignIn('google-oauth2')}
          disabled={socialLoading.google}
        >
          {socialLoading.google ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FcGoogle className="mr-2 h-5 w-5" />
          )}
          {socialLoading.google ? "Connecting..." : "Continue with Google"}
        </Button>

        <Button
          variant="outline"
          type="button"
          className="w-full"
          onClick={() => handleSocialSignIn('facebook')}
          disabled={socialLoading.facebook}
        >
          {socialLoading.facebook ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FaFacebook className="mr-2 h-5 w-5 text-blue-600" />
          )}
          {socialLoading.facebook ? "Connecting..." : "Continue with Facebook"}
        </Button>
      </motion.div>

      <motion.div 
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </motion.div>
    </div>
  )
}