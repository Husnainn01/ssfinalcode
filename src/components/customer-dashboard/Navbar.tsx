"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell, User, LogOut, Menu, CheckCircle, Trash2, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useCustomerAuth } from '@/hooks/useCustomerAuth'
import Link from "next/link"

interface NavbarProps {
  toggleSidebar: () => void
}

// Update the type definitions
type NotificationType = 'inquiry' | 'order' | 'document' | 'payment' | 'system' | 'alert' | 'update'

interface NotificationDetail {
  label: string
  value: string
}

interface Notification {
  _id: string
  userId: string
  title: string
  message: string
  type: NotificationType
  inquiryId?: string
  createdAt: string
  isRead: boolean
  details?: NotificationDetail[]
  priority?: 'low' | 'medium' | 'high'
}

export function Navbar({ toggleSidebar }: NavbarProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated, isLoading } = useCustomerAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [notificationSound, setNotificationSound] = useState<HTMLAudioElement | null>(null)
  const [expandedNotification, setExpandedNotification] = useState<string | null>(null)
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false)

  useEffect(() => {
    // Initialize Audio object on client side only
    if (typeof window !== 'undefined') {
      setNotificationSound(new Audio("/sounds/notification.wav"))
    }
  }, [])

  // Fetch notifications when dropdown is opened
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchNotifications()
    }
  }, [isOpen, isAuthenticated])

  // Set up polling for new notifications
  useEffect(() => {
    if (isAuthenticated) {
      // Initial fetch
      fetchUnreadCount()
      
      // Set up polling every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount()
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const fetchNotifications = async () => {
    setIsLoadingNotifications(true)
    try {
      const response = await fetch('/api/customer/notifications', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setNotifications(data.notifications)
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoadingNotifications(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/customer/notifications?unreadOnly=true&limit=1', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.unreadCount > 0) {
          // If there are new unread notifications since our last check
          const currentUnreadCount = notifications.filter(n => !n.isRead).length
          if (data.unreadCount > currentUnreadCount) {
            // Play sound for new notifications
            playNotificationSound()
            // Fetch all notifications to update the list
            fetchNotifications()
          }
        }
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/customer/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notificationId }),
        credentials: 'include'
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId 
              ? { ...notification, isRead: true }
              : notification
          )
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const response = await fetch('/api/customer/notifications', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notificationId }),
        credentials: 'include'
      })
      
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId))
        toast({
          title: "Notification deleted",
          description: "The notification has been removed",
        })
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive"
      })
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification._id)
    }
    
    // Navigate to the appropriate page based on notification type
    if (notification.type === 'inquiry' && notification.inquiryId) {
      router.push(`/customer-dashboard/inquiries/${notification.inquiryId}`)
      setIsOpen(false)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/customer/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ markAll: true }),
        credentials: 'include'
      })
      
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        toast({
          title: "All notifications marked as read",
          description: "Your notifications have been updated",
        })
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast({
        title: "Error",
        description: "Failed to update notifications",
        variant: "destructive"
      })
    }
  }

  const handleLogout = async () => {
    try {
      // First, clear all client-side cookies
      if (typeof window !== 'undefined') {
        document.cookie.split(';').forEach(cookie => {
          document.cookie = cookie
            .replace(/^ +/, '')
            .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)
        })
      }

      const response = await fetch('/api/auth/user/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Logout failed')
      }

      // Clear any local storage or session storage data
      localStorage.clear()
      sessionStorage.clear()

      // Show success message
      toast({
        title: "Success",
        description: "Logged out successfully",
      })

      // Add a small delay before redirect
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Redirect to login page
      router.push('/auth/login')
      router.refresh()

    } catch (error) {
      console.error('Logout error:', error)
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      })
    }
  }

  const playNotificationSound = () => {
    if (notificationSound) {
      notificationSound.play().catch(error => {
        console.log('Error playing notification sound:', error)
      })
    }
  }

  const toggleNotificationDetails = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedNotification(current => 
      current === notificationId ? null : notificationId
    )
  }

  // Format date for notifications
  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.round(diffMs / 60000)
    const diffHours = Math.round(diffMs / 3600000)
    const diffDays = Math.round(diffMs / 86400000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <nav className="bg-white shadow-sm fixed w-full z-10">
      <div className="max-w-full px-4 sm:px-6">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-3">
              <Link href="/" className="hover:opacity-90 transition-opacity">
                <Image
                  src="/newlogo4.png"
                  alt="JDM GLOBAL"
                  width={800}
                  height={800}
                  className="h-[180px] w-auto object-contain" 
                />
              </Link>
              <span className="text-xs font-semibold hidden sm:block">
                Your's Trusted Logistics Solution
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                  <Bell className="h-5 w-5" />
                  <AnimatePresence>
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"
                      />
                    )}
                  </AnimatePresence>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-2 border-b flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                      <p className="text-xs text-gray-500">{unreadCount} unread messages</p>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {isLoadingNotifications ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <motion.div
                            key={notification._id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <DropdownMenuItem
                              className={cn(
                                "p-3 cursor-pointer hover:bg-gray-50 transition-colors relative group",
                                !notification.isRead && "bg-blue-50/50"
                              )}
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <div className="flex flex-col space-y-1">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-sm">{notification.title}</p>
                                  <span className="text-xs text-gray-400">
                                    {formatNotificationDate(notification.createdAt)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">{notification.message}</p>
                                
                                {notification.details && (
                                  <div className="mt-2">
                                    <button
                                      onClick={(e) => toggleNotificationDetails(notification._id, e)}
                                      className="text-xs text-blue-500 hover:text-blue-600 flex items-center"
                                    >
                                      {expandedNotification === notification._id ? (
                                        <>
                                          <ChevronUp className="h-3 w-3 mr-1" />
                                          Hide details
                                        </>
                                      ) : (
                                        <>
                                          <ChevronDown className="h-3 w-3 mr-1" />
                                          View details
                                        </>
                                      )}
                                    </button>
                                    
                                    <AnimatePresence>
                                      {expandedNotification === notification._id && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: "auto", opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.2 }}
                                          className="mt-2 pt-2 border-t"
                                        >
                                          <div className="space-y-2">
                                            {notification.details.map((detail, index) => (
                                              <div key={index} className="flex justify-between text-xs">
                                                <span className="text-gray-500">{detail.label}:</span>
                                                <span className="font-medium">{detail.value}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                )}
                                
                                <div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {notification.type === 'inquiry' && notification.inquiryId && (
                                    <button 
                                      className="text-xs text-blue-500 hover:text-blue-600 flex items-center"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        router.push(`/customer-dashboard/inquiries/${notification.inquiryId}`)
                                        setIsOpen(false)
                                      }}
                                    >
                                      <ExternalLink className="h-3 w-3 mr-1" />
                                      View inquiry
                                    </button>
                                  )}
                                  <div className="flex items-center space-x-2">
                                    {!notification.isRead && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          markAsRead(notification._id)
                                        }}
                                        className="text-xs text-green-500 hover:text-green-600 flex items-center"
                                      >
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Mark as read
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) => deleteNotification(notification._id, e)}
                                      className="text-xs text-red-500 hover:text-red-600 flex items-center"
                                    >
                                      <Trash2 className="h-3 w-3 mr-1" />
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                              {!notification.isRead && (
                                <span className="h-2 w-2 bg-blue-500 rounded-full absolute right-2 top-4" />
                              )}
                            </DropdownMenuItem>
                          </motion.div>
                        ))
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-4 text-center text-gray-500"
                        >
                          No notifications
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-8 w-px bg-gray-200 mx-2"></div>
            
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.role || 'User'}</p>
              </div>
              <button className="p-1 rounded-full bg-gray-100">
                <User className="h-6 w-6" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-50 text-red-500"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
