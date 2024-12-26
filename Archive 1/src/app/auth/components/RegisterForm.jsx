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

// Separate schemas for each step
const emailSchema = z.object({
  email: z.string().email({ 
    message: "Please enter a valid email address" 
  }),
})

const verificationSchema = z.object({
  code: z.string().length(6, { 
    message: "Verification code must be 6 digits" 
  }),
})

const registrationSchema = z.object({
  firstName: z.string().min(2, { 
    message: "First name should be at least 2 characters" 
  }),
  lastName: z.string().min(2, { 
    message: "Last name should be at least 2 characters" 
  }),
  email: z.string().email({ 
    message: "Please enter a valid email address" 
  }),
  phoneNumber: z.object({
    countryCode: z.string().min(2, { 
      message: "Please select your country code" 
    }),
    number: z.string()
      .min(5, { message: "Please enter your phone number" })
      .regex(/^\d+$/, { message: "Phone number should contain only digits" })
  }),
  address: z.object({
    country: z.string().min(1, { message: "Please select your country" }),
    port: z.string().min(1, { message: "Please enter your port" }),
    postCode: z.string().min(1, { message: "Please enter your post code" })
  }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, { message: "Password requires at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password requires at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password requires at least one number" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
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
          className="w-12 h-12 text-center text-2xl font-semibold border rounded-lg 
            focus:border-green-500 focus:ring-2 focus:ring-green-500/20 
            outline-none transition-all duration-200
            disabled:opacity-50"
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
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            {...field}
                            placeholder="Enter your email"
                            className={`pl-10 ${fieldState.error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            disabled={isLoading}
                          />
                        </div>
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
                      <FormMessage>
                        {field.error && (
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
                                {field.error.message}
                              </p>
                            </div>
                          </div>
                        )}
                      </FormMessage>
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
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input 
                              {...field} 
                              className={`pl-10 ${fieldState.error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                              placeholder="Enter your first name"
                            />
                          </div>
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
                    control={registrationForm.control}
                    name="lastName"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input 
                              {...field} 
                              className={`pl-10 ${fieldState.error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                              placeholder="Enter your last name"
                            />
                          </div>
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
                </div>

                {/* Phone Number Fields */}
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={registrationForm.control}
                    name="phoneNumber.countryCode"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Country Code</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className={`bg-background ${fieldState.error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}>
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
                    control={registrationForm.control}
                    name="phoneNumber.number"
                    render={({ field, fieldState }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="tel"
                            placeholder="Phone number"
                            className={`pl-3 ${fieldState.error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
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
                </div>

                {/* Address Fields */}
                <FormField
                  control={registrationForm.control}
                  name="address.country"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Country" 
                          className={`${fieldState.error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={registrationForm.control}
                    name="address.port"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Port</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className={`${fieldState.error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            placeholder="Enter port"
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
                    control={registrationForm.control}
                    name="address.postCode"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Post Code</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className={`${fieldState.error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            placeholder="Enter post code"
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
                </div>

                {/* Password Fields */}
                <FormField
                  control={registrationForm.control}
                  name="password"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input 
                            type="password"
                            {...field} 
                            className={`pl-10 ${fieldState.error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            placeholder="Enter your password"
                          />
                        </div>
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
                  control={registrationForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage>
                        {field.error && (
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
                                {field.error.message}
                              </p>
                            </div>
                          </div>
                        )}
                      </FormMessage>
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
    </div>
  )
}