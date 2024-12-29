"use client"
import { useEffect } from 'react'

export default function AuthDebug() {
  useEffect(() => {
    console.log('AuthDebug component mounted at:', new Date().toISOString());
    return () => {
      console.log('AuthDebug component unmounted at:', new Date().toISOString());
    }
  }, []);

  return null; // This component doesn't render anything
} 