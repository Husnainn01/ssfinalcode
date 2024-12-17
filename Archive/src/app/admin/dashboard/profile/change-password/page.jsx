"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardHeader, CardBody, Button, Input } from "@nextui-org/react"
import { toast } from 'react-toastify'
import { Loader2, Lock, KeyRound, ShieldCheck, ArrowLeft } from 'lucide-react'
import { motion } from "framer-motion"
import { useTheme } from "@/context/ThemeProvider"
import { useRouter } from "next/navigation"

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export default function ChangePasswordForm() {
  const { theme } = useTheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (values) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast.success('Password changed successfully');
      form.reset();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto p-6">
        <Button
          variant="light"
          startContent={<ArrowLeft className="w-4 h-4" />}
          onClick={() => router.back()}
          className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Back to Profile
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className={`
            w-full max-w-md mx-auto shadow-lg
            ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}
          `}>
            <CardHeader className="flex flex-col gap-4 items-center p-6">
              <div className={`
                p-3 rounded-full 
                ${theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50'}
              `}>
                <KeyRound className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
              </div>
              <div className="text-center">
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                  Change Password
                </h2>
                <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Update your password to keep your account secure
                </p>
              </div>
            </CardHeader>

            <CardBody className="p-6">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="password"
                    label="Current Password"
                    placeholder="Enter your current password"
                    startContent={<Lock className="w-4 h-4 text-gray-400" />}
                    {...form.register("currentPassword")}
                    isInvalid={!!form.formState.errors.currentPassword}
                    classNames={{
                      input: theme === 'dark' ? 'text-gray-100' : '',
                      label: theme === 'dark' ? 'text-gray-300' : '',
                    }}
                  />
                  {form.formState.errors.currentPassword && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>
                      {form.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Input
                    type="password"
                    label="New Password"
                    placeholder="Enter your new password"
                    startContent={<ShieldCheck className="w-4 h-4 text-gray-400" />}
                    {...form.register("newPassword")}
                    isInvalid={!!form.formState.errors.newPassword}
                    classNames={{
                      input: theme === 'dark' ? 'text-gray-100' : '',
                      label: theme === 'dark' ? 'text-gray-300' : '',
                    }}
                  />
                  {form.formState.errors.newPassword && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>
                      {form.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Input
                    type="password"
                    label="Confirm New Password"
                    placeholder="Confirm your new password"
                    startContent={<ShieldCheck className="w-4 h-4 text-gray-400" />}
                    {...form.register("confirmPassword")}
                    isInvalid={!!form.formState.errors.confirmPassword}
                    classNames={{
                      input: theme === 'dark' ? 'text-gray-100' : '',
                      label: theme === 'dark' ? 'text-gray-300' : '',
                    }}
                  />
                  {form.formState.errors.confirmPassword && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>
                      {form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className={`w-full ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4 mr-2" />
                      Change Password
                    </>
                  )}
                </Button>
              </form>

              <div className={`mt-6 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <p>Password must be at least 6 characters long</p>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}