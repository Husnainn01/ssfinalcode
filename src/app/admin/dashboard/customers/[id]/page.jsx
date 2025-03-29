"use client"

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  PlusCircle, 
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Check,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import { Car } from 'lucide-react';

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id;
  
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchCustomerDetails();
  }, [customerId]);
  
  async function fetchCustomerDetails() {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Customer data:", data); // Debug log
      
      if (data.success) {
        setCustomer(data.customer);
      } else {
        throw new Error(data.message || "Failed to fetch customer details");
      }
    } catch (err) {
      console.error("Error fetching customer details:", err);
      setError(err.message || "An error occurred while fetching the customer");
    } finally {
      setLoading(false);
    }
  }
  
  function formatDate(dateString) {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  }
  
  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading customer details...</span>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 p-4 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-red-500 font-medium">Error</h3>
          </div>
          <p className="mt-2 text-red-600">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/admin/dashboard/customers")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Button>
        </div>
      </div>
    );
  }
  
  // Not found state
  if (!customer) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="text-yellow-500 font-medium">Customer Not Found</h3>
          </div>
          <p className="mt-2 text-yellow-600">
            The customer you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/admin/dashboard/customers")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Button>
        </div>
      </div>
    );
  }
  
  // Main render
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            className="mr-4"
            onClick={() => router.push("/admin/dashboard/customers")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">
            Customer Profile
          </h1>
        </div>
        <Button variant="outline" onClick={() => router.push(`/admin/dashboard/customers/${customerId}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Customer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{customer.fullName || customer.name || "Unknown"}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <a
                    href={`mailto:${customer.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {customer.email}
                  </a>
                </div>
                {customer.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span>Joined: {formatDate(customer.createdAt)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span>Last Login: {formatDate(customer.lastLogin)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-4">
                <Badge className={customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {customer.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Inquiries</span>
                  <span>{customer.inquiryCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vehicles</span>
                  <span>{customer.vehicleCount || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="inquiries">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
              <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            </TabsList>
            
            <TabsContent value="inquiries" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Inquiries</CardTitle>
                </CardHeader>
                <CardContent>
                  {customer.inquiries && customer.inquiries.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customer.inquiries.map((inquiry) => (
                          <TableRow key={inquiry.id}>
                            <TableCell className="font-medium">{inquiry.subject}</TableCell>
                            <TableCell>
                              <Badge className={
                                inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                inquiry.status === 'answered' ? 'bg-blue-100 text-blue-800' :
                                inquiry.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                inquiry.status === 'agreed' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {inquiry.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(inquiry.createdAt)}</TableCell>
                            <TableCell>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => router.push(`/admin/dashboard/inquiries/${inquiry.id}`)}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No inquiries found for this customer.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="vehicles" className="mt-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Customer Vehicles</CardTitle>
                    <Button size="sm" onClick={() => router.push(`/admin/dashboard/vehicles/add?customerId=${customerId}`)}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Vehicle
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {customer.vehicles && customer.vehicles.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vehicle</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Added</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customer.vehicles.map((vehicle) => (
                          <TableRow key={vehicle.id}>
                            <TableCell className="font-medium">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                vehicle.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                vehicle.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                vehicle.status === 'shipping' ? 'bg-purple-100 text-purple-800' :
                                vehicle.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {vehicle.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(vehicle.createdAt)}</TableCell>
                            <TableCell>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => router.push(`/admin/dashboard/vehicles/${vehicle.id}`)}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No vehicles found for this customer.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 