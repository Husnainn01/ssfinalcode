"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2, Upload, User, Mail, Phone, MapPin, Hash, ArrowLeft } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Avatar,
  Divider
} from "@nextui-org/react"
import { toast, ToastContainer } from 'react-toastify'
import { motion } from "framer-motion"
import { useTheme } from "@/context/ThemeProvider"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  postCode: z.string().min(3, "Post code must be at least 3 characters")
})

export default function ProfileForm() {
  const { theme } = useTheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [formError, setFormError] = useState("");
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      postCode: "",
    },
    mode: "onTouched"
  })

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      const response = await fetch('/api/users/profile')
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched profile data:', data)
        
        form.reset({
          name: data.name || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phoneNumber || "",
          address: data.address || "",
          postCode: data.postCode || "",
        })
        
        setAvatarUrl(data.avatar || "/default-avatar.png")
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('userData', JSON.stringify(data))
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile data')
    }
  }

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    try {
      setIsAvatarLoading(true)
      const formData = new FormData()
      formData.append('file', file)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Upload failed')
      }

      const { url } = await uploadResponse.json()
      setAvatarUrl(url)

      toast.success('Avatar uploaded successfully')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to upload avatar')
    } finally {
      setIsAvatarLoading(false)
    }
  }

  const FormError = ({ message }) => (
    message ? <p className="text-red-500 text-sm mt-1">{message}</p> : null
  )

  const onSubmit = async (values) => {
    console.log("Submit triggered with values:", values);
    try {
      setIsLoading(true);
      
      // Log the exact data being sent
      const submitData = {
        name: values.name,
        lastName: values.lastName,
        phoneNumber: values.phone,
        address: values.address,
        postCode: values.postCode,
        avatar: avatarUrl || '/default-avatar.png'
      };
      console.log("Sending data to API:", submitData);

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          // Add this to ensure we're sending the auth token
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        credentials: 'include',
        body: JSON.stringify(submitData)
      });

      // Log the raw response
      console.log('Raw response:', response);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      toast.success('Profile updated successfully!');
      await fetchProfileData();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <ToastContainer />
      
      <div className="max-w-4xl mx-auto">
        <Button
          variant="light"
          startContent={<ArrowLeft className="w-4 h-4" />}
          onClick={() => router.back()}
          className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Back to Dashboard
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className={`w-full shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <CardHeader className="flex flex-col gap-3 px-8 pt-8">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar 
                    className={`w-24 h-24 text-large ring-2 ${
                      theme === 'dark' ? 'ring-gray-700' : 'ring-gray-100'
                    }`}
                    src={avatarUrl || "/default-avatar.png"}
                    alt="Profile"
                  />
                  <div className="absolute bottom-0 right-0">
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="avatar-upload"
                      onChange={handleAvatarUpload}
                      disabled={isAvatarLoading}
                    />
                    <label htmlFor="avatar-upload">
                      <Button
                        isIconOnly
                        className={`rounded-full shadow-lg ${
                          theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white'
                        }`}
                        size="sm"
                      >
                        {isAvatarLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                      </Button>
                    </label>
                  </div>
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                  }`}>
                    Profile Information
                  </h2>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Update your personal details and contact information
                  </p>
                </div>
              </div>
              <Divider className={theme === 'dark' ? 'bg-gray-700' : ''} />
            </CardHeader>

            <CardBody className="p-8">
              {formError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6"
                >
                  {formError}
                </motion.div>
              )}

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Input
                      {...form.register("name")}
                      label="Name"
                      placeholder="Enter your name"
                      startContent={<User className="w-4 h-4 text-gray-400" />}
                      isInvalid={!!form.formState.errors.name}
                      classNames={{
                        input: theme === 'dark' ? 'text-gray-100' : '',
                        label: theme === 'dark' ? 'text-gray-300' : '',
                      }}
                    />
                    <FormError message={form.formState.errors.name?.message} />
                  </div>

                  <div className="space-y-2">
                    <Input
                      {...form.register("lastName")}
                      label="Last Name"
                      placeholder="Enter your last name"
                      startContent={<User className="w-4 h-4 text-gray-400" />}
                      isInvalid={!!form.formState.errors.lastName}
                      classNames={{
                        input: theme === 'dark' ? 'text-gray-100' : '',
                        label: theme === 'dark' ? 'text-gray-300' : '',
                      }}
                    />
                    <FormError message={form.formState.errors.lastName?.message} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Input
                    type="email"
                    {...form.register("email")}
                    label="Email Address"
                    placeholder="Enter your email"
                    startContent={<Mail className="w-4 h-4 text-gray-400" />}
                    disabled
                    classNames={{
                      input: theme === 'dark' ? 'text-gray-100' : '',
                      label: theme === 'dark' ? 'text-gray-300' : '',
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    type="tel"
                    {...form.register("phone")}
                    label="Phone Number"
                    placeholder="Enter your phone number"
                    startContent={<Phone className="w-4 h-4 text-gray-400" />}
                    isInvalid={!!form.formState.errors.phone}
                    classNames={{
                      input: theme === 'dark' ? 'text-gray-100' : '',
                      label: theme === 'dark' ? 'text-gray-300' : '',
                    }}
                  />
                  <FormError message={form.formState.errors.phone?.message} />
                </div>

                <div className="space-y-2">
                  <Input
                    {...form.register("address")}
                    label="Address"
                    placeholder="Enter your address"
                    startContent={<MapPin className="w-4 h-4 text-gray-400" />}
                    isInvalid={!!form.formState.errors.address}
                    classNames={{
                      input: theme === 'dark' ? 'text-gray-100' : '',
                      label: theme === 'dark' ? 'text-gray-300' : '',
                    }}
                  />
                  <FormError message={form.formState.errors.address?.message} />
                </div>

                <div className="space-y-2">
                  <Input
                    {...form.register("postCode")}
                    label="Post Code"
                    placeholder="Enter your post code"
                    startContent={<Hash className="w-4 h-4 text-gray-400" />}
                    isInvalid={!!form.formState.errors.postCode}
                    classNames={{
                      input: theme === 'dark' ? 'text-gray-100' : '',
                      label: theme === 'dark' ? 'text-gray-300' : '',
                    }}
                  />
                  <FormError message={form.formState.errors.postCode?.message} />
                </div>

                <Button 
                  type="submit" 
                  className={`w-full ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating Profile...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

