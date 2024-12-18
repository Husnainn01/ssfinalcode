"use client"
import { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { Car, FileText, BarChart3 } from 'lucide-react';
import { Button } from "@nextui-org/react";
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  console.log("Initial render of DashboardPage");

  useEffect(() => {
    console.log("Dashboard Page useEffect starting");
    setMounted(true);
    
    try {
      console.log("Dashboard Page Mounted Successfully");
    } catch (error) {
      console.error("Error in Dashboard useEffect:", error);
    }
  }, []);

  if (!mounted) {
    console.log("Dashboard not yet mounted");
    return <div>Loading...</div>;
  }

  console.log("Dashboard Page Rendering Content");

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto p-6"
    >
      <h1 className="text-2xl font-bold mb-6">Welcome to Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Car Management Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Car className="w-12 h-12 text-blue-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Car Management</h2>
          <p className="text-gray-600 mb-4">Manage your vehicle listings and inventory</p>
          <div className="space-y-2">
            <Button 
              color="primary" 
              className="w-full"
              onClick={() => router.push('/admin/dashboard/listing')}
            >
              View Listings
            </Button>
            <Button 
              color="secondary" 
              className="w-full"
              onClick={() => router.push('/admin/dashboard/listing/new')}
            >
              Add New Car
            </Button>
          </div>
        </div>

        {/* Blog Management Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <FileText className="w-12 h-12 text-purple-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Blog Management</h2>
          <p className="text-gray-600 mb-4">Manage your blog posts and content</p>
          <div className="space-y-2">
            <Button 
              color="primary" 
              className="w-full"
              onClick={() => router.push('/admin/dashboard/blog')}
            >
              View Posts
            </Button>
            <Button 
              color="secondary" 
              className="w-full"
              onClick={() => router.push('/admin/dashboard/blog/new')}
            >
              Add New Post
            </Button>
          </div>
        </div>

        {/* Analytics Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <BarChart3 className="w-12 h-12 text-green-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Analytics</h2>
          <p className="text-gray-600 mb-4">View your site statistics and metrics</p>
          <Button 
            color="primary" 
            className="w-full"
            onClick={() => router.push('/admin/dashboard/stats')}
          >
            View Analytics
          </Button>
        </div>
      </div>
    </motion.div>
  );
}