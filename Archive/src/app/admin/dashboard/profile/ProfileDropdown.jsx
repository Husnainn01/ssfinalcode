'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar } from "@nextui-org/react"
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button
} from "@nextui-org/react"
import { toast } from 'react-toastify'
import { motion } from "framer-motion"
import { useTheme } from "@/context/ThemeProvider"
import { User, Key, LogOut, Camera, ChevronDown, Settings } from 'lucide-react'

export default function ProfileDropdown() {
  const router = useRouter()
  const { theme } = useTheme()
  const [userData, setUserData] = useState({
    name: 'Admin',
    email: process.env.ADMIN_ID || 'admin@example.com',
    avatar: '/default-avatar.png'
  })
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/admin/users/profile', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleViewProfile = () => {
    setIsOpen(false)
    router.push('/admin/dashboard/profile/view')
  }

  const handleChangePassword = () => {
    setIsOpen(false)
    router.push('/admin/dashboard/profile/change-password')
  }

  const handleChangeAvatar = () => {
    setIsOpen(false)
    toast.info('Avatar change functionality coming soon')
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        router.push('/admin/login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex justify-end p-4">
      <Dropdown 
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement="bottom-end"
      >
        <DropdownTrigger>
          <Button 
            variant="light"
            className={`p-0 gap-2 ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <Avatar
              src={userData.avatar}
              alt={userData.name}
              className="w-8 h-8 transition-transform"
              isBordered
              color="primary"
            />
            <span className={`hidden md:block text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {userData.name}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${
              isOpen ? 'rotate-180' : 'rotate-0'
            } ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          </Button>
        </DropdownTrigger>
        <DropdownMenu 
          aria-label="Profile Actions"
          className={theme === 'dark' ? 'bg-gray-800 text-gray-100' : ''}
          variant="flat"
        >
          <DropdownItem
            key="profile_info"
            className="h-14 gap-2"
            textValue="Profile Info"
          >
            <div className="flex flex-col">
              <p className={`font-semibold ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Signed in as
              </p>
              <p className="font-semibold text-sm text-primary">
                {userData.email}
              </p>
            </div>
          </DropdownItem>
          <DropdownItem
            key="view_profile"
            startContent={<User className="w-4 h-4" />}
            onClick={handleViewProfile}
          >
            View Profile
          </DropdownItem>
          <DropdownItem
            key="change_password"
            startContent={<Key className="w-4 h-4" />}
            onClick={handleChangePassword}
          >
            Change Password
          </DropdownItem>
          <DropdownItem
            key="change_avatar"
            startContent={<Camera className="w-4 h-4" />}
            onClick={handleChangeAvatar}
          >
            Change Avatar
          </DropdownItem>
          <DropdownItem
            key="settings"
            startContent={<Settings className="w-4 h-4" />}
            onClick={() => router.push('/admin/dashboard/settings')}
          >
            Settings
          </DropdownItem>
          <DropdownItem
            key="logout"
            className="text-danger"
            color="danger"
            startContent={<LogOut className="w-4 h-4" />}
            onClick={handleLogout}
          >
            Log Out
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}

