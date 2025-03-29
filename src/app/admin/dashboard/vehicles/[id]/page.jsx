"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Car,
  Calendar,
  DollarSign,
  Clock,
  FileText,
  User,
  MapPin,
  Phone,
  Mail,
  Info,
  AlertCircle,
  CheckCircle,
  Pencil,
  Truck,
  FileUp,
  Trash2,
  Download,
  FolderOpen,
  Folder,
  Upload,
  Loader2,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Label
} from "@/components/ui/label"
import {
  Input
} from "@/components/ui/input"
import { format } from 'date-fns'

export default function VehicleDetailPage() {
  const router = useRouter()
  const params = useParams()
  const vehicleId = params.id
  const { toast } = useToast()
  
  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("details")
  const [selectedImage, setSelectedImage] = useState(null)
  const [progressValue, setProgressValue] = useState(0)
  const [documents, setDocuments] = useState([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [shippingDialogOpen, setShippingDialogOpen] = useState(false)
  const [shippingFormData, setShippingFormData] = useState({
    status: vehicle?.shipping?.status || "Not started",
    method: vehicle?.shipping?.method || "",
    trackingNumber: vehicle?.shipping?.trackingNumber || "",
    expectedArrival: vehicle?.shipping?.expectedArrival ? 
      new Date(vehicle.shipping.expectedArrival).toISOString().split('T')[0] : "",
    carrier: vehicle?.shipping?.carrier || "",
    notes: vehicle?.shipping?.notes || "",
  })
  const [isUpdatingShipping, setIsUpdatingShipping] = useState(false)
  const [shippingUpdateError, setShippingUpdateError] = useState(null)
  const [shippingUpdateSuccess, setShippingUpdateSuccess] = useState(false)
  const [shippingHistory, setShippingHistory] = useState([]);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);

  useEffect(() => {
    fetchVehicleDetails()
  }, [vehicleId])

  const fetchVehicleDetails = async () => {
    setLoading(true)
    try {
      console.log("Fetching vehicle details for ID:", vehicleId);
      
      const response = await fetch(`/api/admin/vehicles/${vehicleId}`, {
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error(`Error fetching vehicle: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("CLIENT: Raw API response received:", data.success);
      
      if (data.success) {
        const vehicleData = data.vehicle;
        
        // Log what we received
        console.log("CLIENT: Vehicle received:", {
          make: vehicleData.make,
          model: vehicleData.model,
          specs: vehicleData.specs ? Object.keys(vehicleData.specs) : 'no specs'
        });
        
        // Now the data is already formatted correctly, just set it to state
        setVehicle(vehicleData);
        
        // Set selected image
        if (vehicleData.images && vehicleData.images.length > 0) {
          setSelectedImage(vehicleData.images[0]);
        }
        
        // Calculate progress
        if (vehicleData.timeline && vehicleData.timeline.length > 0) {
          const completedSteps = vehicleData.timeline.filter(step => step.completed).length;
          const totalSteps = vehicleData.timeline.length;
          const progress = Math.round((completedSteps / totalSteps) * 100);
          setProgressValue(progress);
        } else {
          // Set a default progress based on the vehicle status
          const statusProgress = {
            pending: 20,
            processing: 40,
            shipping: 70,
            delivered: 100,
            completed: 100
          };
          setProgressValue(statusProgress[vehicleData.status] || 0);
        }
      } else {
        throw new Error(data.message || "Failed to load vehicle details")
      }
    } catch (err) {
      console.error("Error fetching vehicle details:", err)
      setError(err.message || "An error occurred while fetching vehicle details")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: "bg-yellow-100 text-yellow-800", icon: <Clock className="h-4 w-4 mr-1" /> },
      processing: { bg: "bg-blue-100 text-blue-800", icon: <CheckCircle className="h-4 w-4 mr-1" /> },
      shipping: { bg: "bg-purple-100 text-purple-800", icon: <Truck className="h-4 w-4 mr-1" /> },
      delivered: { bg: "bg-green-100 text-green-800", icon: <CheckCircle className="h-4 w-4 mr-1" /> },
      completed: { bg: "bg-gray-100 text-gray-800", icon: <CheckCircle className="h-4 w-4 mr-1" /> }
    }
    
    const config = statusConfig[status] || statusConfig.processing
    
    return (
      <Badge className={cn(config.bg, "flex items-center")}>
        {config.icon}
        <span className="capitalize">{status}</span>
      </Badge>
    )
  }

  const getShippingStatusBadge = (status) => {
    const statusColors = {
      preparing: "bg-yellow-100 text-yellow-800",
      in_transit: "bg-blue-100 text-blue-800",
      customs: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      delayed: "bg-red-100 text-red-800"
    }
    
    return (
      <Badge className={statusColors[status] || "bg-gray-100"}>
        <span className="capitalize">{status.replace('_', ' ')}</span>
      </Badge>
    )
  }

  const getProgressPercentage = (status) => {
    const statusProgress = {
      preparing: 25,
      in_transit: 50,
      customs: 75,
      delivered: 100,
      delayed: 50
    }
    
    return statusProgress[status] || 0
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return "N/A";
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (err) {
      console.error("Error formatting date:", err, dateString);
      return "N/A";
    }
  }

  const fetchDocuments = async () => {
    try {
      setIsLoadingDocuments(true);
      const response = await fetch(`/api/admin/vehicles/documents?vehicleId=${params.id}`);
      const data = await response.json();
      if (data.success) {
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [params.id]);

  const DocumentsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Vehicle Documents</h2>
        <div className="flex gap-2">
          <Link
            href={`/admin/dashboard/vehicles/documents?vehicleId=${params.id}`}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            <Folder className="mr-2 h-4 w-4" />
            Manage Documents
          </Link>
          <Link
            href={`/admin/dashboard/vehicles/documents/upload?vehicleId=${params.id}`}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Documents
          </Link>
        </div>
      </div>

      {isLoadingDocuments ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      ) : documents.length > 0 ? (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <div
              key={doc._id}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-md bg-purple-50">
                  <Folder className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {doc.originalName || doc.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Type: {doc.type?.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(doc.url, '_blank')}
                >
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(doc.url, '_blank')}
                >
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-lg">
          <Folder className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by uploading a document
          </p>
        </div>
      )}
    </div>
  );

  const TimelineTab = () => {
    // Timeline steps
    const timelineSteps = [
      { 
        id: 'inquiry_created', 
        label: 'Inquiry Created',
        date: formatDate(vehicle.inquiryDate || vehicle.createdAt)
      },
      { 
        id: 'price_agreed', 
        label: 'Price Agreed',
        date: formatDate(vehicle.dateAgreed)
      },
      { 
        id: 'processing', 
        label: 'Processing',
        date: null
      },
      { 
        id: 'shipping', 
        label: 'Shipping',
        date: null
      },
      { 
        id: 'customs', 
        label: 'Customs',
        date: null
      },
      { 
        id: 'delivery', 
        label: 'Delivery',
        date: formatDate(vehicle.estimatedDelivery)
      }
    ];

    // Calculate progress based on vehicle status
    let completedSteps = 0;
    if (vehicle.status === 'pending' || vehicle.dateAgreed) completedSteps = 2;
    if (vehicle.status === 'processing') completedSteps = 3;
    if (vehicle.status === 'shipping') completedSteps = 4;
    if (vehicle.status === 'customs') completedSteps = 5;
    if (vehicle.status === 'delivered' || vehicle.status === 'completed') completedSteps = 6;
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Vehicle Timeline</h3>
          <p className="text-sm text-gray-500 mb-4">Track the progress of your vehicle from purchase to delivery</p>
          
          {/* Timeline */}
          <div className="mt-6 space-y-8">
            {/* Timeline visualization */}
            <div className="relative">
              <div className="flex flex-col space-y-8">
                {/* Timeline steps */}
                <div className="flex justify-between">
                  {timelineSteps.map((step, index) => {
                    const isCompleted = index < completedSteps;
                    const isCurrent = index === completedSteps - 1;
                    
                    return (
                      <div key={step.id} className="flex flex-col items-center relative group">
                        {/* Step number with circle */}
                        <div 
                          className={`w-10 h-10 rounded-full flex items-center justify-center
                            ${isCompleted ? 'bg-green-500 text-white' : 'bg-white border-2 border-gray-200 text-gray-500'}`}
                        >
                          <span className="text-sm font-bold">{index + 1}</span>
                        </div>
                        
                        {/* Step label */}
                        <div className={`mt-2 px-2 py-1 rounded-md text-center ${isCompleted ? 'bg-green-50' : ''}`}>
                          <p className={`text-sm font-medium ${isCompleted ? 'text-green-700' : 'text-gray-600'}`}>
                            {step.label}
                          </p>
                          {step.date && step.date !== "N/A" && (
                            <p className="text-xs text-gray-500 mt-1">{step.date}</p>
                          )}
                        </div>
                        
                        {/* Hover tooltip with details */}
                        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-white p-2 rounded-md shadow-md border border-gray-100 z-10 w-48">
                          <div className="text-sm">
                            <p className="font-medium">{step.label}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {index === 0 ? "Initial inquiry submitted" : 
                               index === 1 ? `Price negotiated and agreed` :
                               index === 2 ? "Vehicle being prepared" :
                               index === 3 ? "Vehicle in transit" :
                               index === 4 ? "Clearing customs" :
                               "Final delivery to customer"}
                            </p>
                            {step.date && step.date !== "N/A" && (
                              <p className="text-xs font-medium text-green-600 mt-1">{step.date}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Progress bar connecting circles */}
                <div className="relative h-1 -mt-5">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded-full"></div>
                  <div 
                    className="absolute top-0 left-0 h-1 bg-green-500 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${Math.max(0, (completedSteps - 1) * 20)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Current status info */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-blue-700">Current Status: {vehicle.status}</h4>
                  <p className="text-sm text-blue-600 mt-1">
                    {completedSteps === 0 ? "Awaiting initial inquiry" :
                     completedSteps === 1 ? "Inquiry received, awaiting price agreement" :
                     completedSteps === 2 ? "Price agreed, preparing for shipping" :
                     completedSteps === 3 ? "Vehicle is being processed for shipping" :
                     completedSteps === 4 ? "Vehicle is currently in transit" :
                     completedSteps === 5 ? "Vehicle is clearing customs" :
                     "Vehicle has been delivered"}
                  </p>
                  {vehicle.estimatedDelivery && completedSteps < 6 && (
                    <p className="text-sm font-medium text-blue-700 mt-2">
                      Estimated delivery: {formatDate(vehicle.estimatedDelivery)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleShippingFormChange = (e) => {
    const { name, value } = e.target
    setShippingFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const fetchShippingHistory = async () => {
    if (!vehicle || !vehicle._id) return;
    
    setIsLoadingShipping(true);
    try {
      const response = await fetch(`/api/admin/vehicles/${vehicle._id}/shipping`);
      if (response.ok) {
        const data = await response.json();
        setShippingHistory(data.shipping || []);
      }
    } catch (error) {
      console.error('Error fetching shipping history:', error);
    } finally {
      setIsLoadingShipping(false);
    }
  };

  useEffect(() => {
    if (vehicle && vehicle._id) {
      fetchShippingHistory();
    }
  }, [vehicle]);

  const handleShippingSubmit = async (e) => {
    e.preventDefault()
    setIsUpdatingShipping(true)
    setShippingUpdateError(null)
    setShippingUpdateSuccess(false)
    
    try {
      console.log('Sending shipping update for vehicle:', vehicle._id || vehicle.id)
      console.log('Shipping data:', shippingFormData)
      
      const response = await fetch(`/api/admin/vehicles/${vehicle._id || vehicle.id}/shipping`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shippingFormData),
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update shipping information')
      }
      
      console.log('Shipping update successful:', data)
      
      // Show success message and close dialog after delay
      setShippingUpdateSuccess(true)
      
      // Refresh the shipping history
      fetchShippingHistory();
      
      setTimeout(() => {
        setShippingDialogOpen(false)
        // Refresh the vehicle data
        fetchVehicleDetails()
      }, 1500)
      
    } catch (err) {
      console.error('Error updating shipping info:', err)
      setShippingUpdateError(err.message)
    } finally {
      setIsUpdatingShipping(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="ml-4 h-6 w-40 bg-gray-200 animate-pulse rounded"></div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="h-[400px] bg-gray-200 animate-pulse rounded"></div>
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 w-16 bg-gray-200 animate-pulse rounded"></div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 animate-pulse rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 animate-pulse rounded w-1/2"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-6 bg-gray-200 animate-pulse rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-red-800 font-medium">Error loading vehicle</h3>
          </div>
          <p className="mt-2 text-red-600">{error}</p>
          <Button className="mt-4" onClick={fetchVehicleDetails}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="text-center py-12">
          <Car className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Vehicle not found</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            The vehicle you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push('/admin/dashboard/vehicles')}>
            View All Vehicles
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push('/admin/dashboard/vehicles')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => router.push(`/admin/dashboard/vehicles/${vehicleId}/edit`)}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => alert('Delete functionality would go here')}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h1>
          <div className="flex items-center mt-1 space-x-3">
            {getStatusBadge(vehicle.status)}
            <span className="text-sm text-gray-500">Stock #: {vehicle.stockNumber || vehicle.specs?.stockNumber || "N/A"}</span>
            {vehicle.specs.vin && <span className="text-sm text-gray-500">VIN: {vehicle.specs.vin}</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Vehicle Images */}
        <div>
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border">
            {selectedImage ? (
              <Image 
                src={selectedImage} 
                alt={`${vehicle.make} ${vehicle.model}`} 
                fill 
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Car className="h-16 w-16 text-gray-300" />
                <p className="text-gray-500 mt-2">No image available</p>
              </div>
            )}
          </div>
          
          {vehicle.images && vehicle.images.length > 0 && (
            <div className="flex overflow-x-auto mt-4 pb-2 space-x-2">
              {vehicle.images.map((image, index) => (
                <div 
                  key={index}
                  className={cn(
                    "relative h-16 w-16 flex-shrink-0 cursor-pointer rounded-md overflow-hidden border",
                    selectedImage === image ? "ring-2 ring-blue-500" : ""
                  )}
                  onClick={() => setSelectedImage(image)}
                >
                  <Image
                    src={image}
                    alt={`${vehicle.make} ${vehicle.model} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vehicle Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Make</p>
                  <p className="font-medium">{vehicle.make}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Model</p>
                  <p className="font-medium">{vehicle.model}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Year</p>
                  <p className="font-medium">{vehicle.year}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  {getStatusBadge(vehicle.status)}
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Original Price</p>
                    <p className="font-medium">${vehicle.price?.toLocaleString() || 0} {vehicle.priceCurrency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Agreed Price</p>
                    <p className="font-medium text-green-600">
                      ${vehicle.agreedPrice?.toLocaleString() || 0} {vehicle.priceCurrency}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date Agreed</p>
                    <p className="font-medium">
                      {formatDate(vehicle.dateAgreed)}
                      <span className="hidden">{JSON.stringify(vehicle.dateAgreed)}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Est. Delivery</p>
                    <p className="font-medium">{formatDate(vehicle.estimatedDelivery)}</p>
                  </div>
                </div>
              </div>
              
              {vehicle.timeline && vehicle.timeline.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-500 mb-1">Delivery Progress</p>
                  <Progress value={progressValue} className="h-2" />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">Order Placed</span>
                    <span className="text-xs text-gray-500">Delivered</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Customer Information */}
        {vehicle.customer && (
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <Link href={`/admin/dashboard/customers/${vehicle.customerId}`} className="font-medium hover:underline">
                    {vehicle.customer.name || `${vehicle.customer.firstName || ''} ${vehicle.customer.lastName || ''}`}
                  </Link>
                </div>
                
                {vehicle.customer.email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    <a href={`mailto:${vehicle.customer.email}`} className="text-blue-600 hover:underline">
                      {vehicle.customer.email}
                    </a>
                  </div>
                )}
                
                {vehicle.customer.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{vehicle.customer.phone}</span>
                  </div>
                )}
                
                {vehicle.customer.address && (
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
                    <span className="whitespace-pre-line">{vehicle.customer.address}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                {vehicle.customer && vehicle.customerId && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push(`/admin/dashboard/customers/${vehicle.customerId}`)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    View Full Customer Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="details" className="mt-8">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="specs">Specifications</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-gray-500">Make</div>
                      <div className="text-sm">{vehicle.make}</div>
                      
                      <div className="text-sm text-gray-500">Model</div>
                      <div className="text-sm">{vehicle.model}</div>
                      
                      <div className="text-sm text-gray-500">Year</div>
                      <div className="text-sm">{vehicle.year}</div>
                      
                      <div className="text-sm text-gray-500">Body Type</div>
                      <div className="text-sm">{vehicle.specs?.bodyType || "N/A"}</div>
                      
                      <div className="text-sm text-gray-500">Color</div>
                      <div className="text-sm">{vehicle.specs?.color || "N/A"}</div>
                      
                      <div className="text-sm text-gray-500">Condition</div>
                      <div className="text-sm">{vehicle.specs?.itemCondition || "N/A"}</div>
                      
                      <div className="text-sm text-gray-500">VIN</div>
                      <div className="text-sm">{vehicle.specs?.vin || "N/A"}</div>
                      
                      <div className="text-sm text-gray-500">Stock Number</div>
                      <div className="text-sm">{vehicle.stockNumber || vehicle.specs?.stockNumber || "N/A"}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Engine & Performance</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-gray-500">Engine</div>
                      <div className="text-sm">{vehicle.specs?.engine || "N/A"}</div>
                      
                      <div className="text-sm text-gray-500">Transmission</div>
                      <div className="text-sm">{vehicle.specs?.transmission || "N/A"}</div>
                      
                      <div className="text-sm text-gray-500">Drive Type</div>
                      <div className="text-sm">{vehicle.specs?.driveWheelConfiguration || "N/A"}</div>
                      
                      <div className="text-sm text-gray-500">Fuel Type</div>
                      <div className="text-sm">{vehicle.specs?.fuelType || "N/A"}</div>
                      
                      <div className="text-sm text-gray-500">Cylinders</div>
                      <div className="text-sm">{vehicle.specs?.cylinders || "N/A"}</div>
                      
                      <div className="text-sm text-gray-500">Mileage</div>
                      <div className="text-sm">{vehicle.specs?.mileage || "0"} {vehicle.specs?.mileageUnit || "KM"}</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Purchase Details</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-gray-500">Original Price</div>
                      <div className="text-sm">${vehicle.price?.toLocaleString() || 0} {vehicle.priceCurrency}</div>
                      
                      <div className="text-sm text-gray-500">Agreed Price</div>
                      <div className="text-sm text-green-600">${vehicle.agreedPrice?.toLocaleString() || 0} {vehicle.priceCurrency}</div>
                      
                      {vehicle.dateAgreed && (
                        <>
                          <div className="text-sm text-gray-500">Date Agreed</div>
                          <div className="text-sm">
                            {formatDate(vehicle.dateAgreed)}
                            <span className="hidden">{JSON.stringify(vehicle.dateAgreed)}</span>
                          </div>
                        </>
                      )}
                      
                      {vehicle.notes && (
                        <>
                          <div className="text-sm text-gray-500">Agreement Notes</div>
                          <div className="text-sm">{vehicle.notes}</div>
                        </>
                      )}
                      
                      {vehicle.inquiryId && (
                        <>
                          <div className="text-sm text-gray-500">Original Inquiry</div>
                          <div className="text-sm">
                            <Link href={`/admin/dashboard/inquiries/${vehicle.inquiryId}`} className="text-blue-600 hover:underline">
                              View Inquiry
                            </Link>
                          </div>
                        </>
                      )}
                      
                      <div className="text-sm text-gray-500">Availability</div>
                      <div className="text-sm">{vehicle.availability || vehicle.specs?.availability || "N/A"}</div>
                      
                      <div className="text-sm text-gray-500">Offer Type</div>
                      <div className="text-sm">{vehicle.offerType || vehicle.specs?.offerType || "N/A"}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Additional Details</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-gray-500">Number of Doors</div>
                      <div className="text-sm">{vehicle.specs?.doors || "N/A"}</div>
                      
                      <div className="text-sm text-gray-500">Seating Capacity</div>
                      <div className="text-sm">{vehicle.specs?.seatingCapacity || "N/A"}</div>
                      
                      <div className="text-sm text-gray-500">Country</div>
                      <div className="text-sm">{vehicle.country || "N/A"}</div>
                      
                      <div className="text-sm text-gray-500">Category</div>
                      <div className="text-sm">{vehicle.category || "N/A"}</div>
                      
                      <div className="text-sm text-gray-500">Created At</div>
                      <div className="text-sm">
                        {formatDate(vehicle.createdAt)}
                        <span className="hidden">{JSON.stringify(vehicle.createdAt)}</span>
                      </div>
                      
                      <div className="text-sm text-gray-500">Updated At</div>
                      <div className="text-sm">
                        {formatDate(vehicle.updatedAt)}
                        <span className="hidden">{JSON.stringify(vehicle.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Features */}
          {(vehicle.specs.features && vehicle.specs.features.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {vehicle.specs.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="specs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Technical Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Engine</p>
                  <p className="font-medium">{vehicle.specs?.engine || 'N/A'}</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Transmission</p>
                  <p className="font-medium">{vehicle.specs?.transmission || 'N/A'}</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Drive Type</p>
                  <p className="font-medium">{vehicle.specs?.driveWheelConfiguration || 'N/A'}</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Fuel Type</p>
                  <p className="font-medium">{vehicle.specs?.fuelType || 'N/A'}</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Cylinders</p>
                  <p className="font-medium">{vehicle.specs?.cylinders || 'N/A'}</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Mileage</p>
                  <p className="font-medium">{vehicle.specs?.mileage || "0"} {vehicle.specs?.mileageUnit || "KM"}</p>
                </div>
              </div>

              {/* Features */}
              {(vehicle.specs.features?.length > 0) && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {vehicle.specs.features.map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="documents">
          <DocumentsTab />
        </TabsContent>
        <TabsContent value="shipping" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center">
                  <Truck className="mr-2 h-5 w-5 text-primary" />
                  Shipping Information
                </CardTitle>
                <Button
                  onClick={() => router.push(`/admin/dashboard/vehicles/shipping?vehicleId=${vehicle._id || vehicle.id}`)}
                  variant="secondary"
                >
                  <Truck className="mr-2 h-4 w-4" />
                  View Detailed Shipping
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vehicle.shipping ? (
                  // Display current shipping status
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-sm text-gray-500">Current Status</h3>
                      <p>{vehicle.shipping.status || "Not started"}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-gray-500">Expected Arrival</h3>
                      <p>{vehicle.shipping.expectedArrival 
                        ? new Date(vehicle.shipping.expectedArrival).toLocaleDateString() 
                        : "Not scheduled"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">No shipping information available for this vehicle</p>
                  </div>
                )}
                
                <div className="flex justify-between mt-6">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      // Reset form data from current vehicle
                      setShippingFormData({
                        status: vehicle?.shipping?.status || "Not started",
                        method: vehicle?.shipping?.method || "",
                        trackingNumber: vehicle?.shipping?.trackingNumber || "",
                        expectedArrival: vehicle?.shipping?.expectedArrival ? 
                          new Date(vehicle.shipping.expectedArrival).toISOString().split('T')[0] : "",
                        carrier: vehicle?.shipping?.carrier || "",
                        notes: vehicle?.shipping?.notes || "",
                      });
                      // Open the dialog
                      setShippingDialogOpen(true);
                      // Reset states
                      setShippingUpdateError(null);
                      setShippingUpdateSuccess(false);
                    }}
                  >
                    <Truck className="mr-2 h-4 w-4" />
                    Update Shipping Status
                  </Button>
                  
                  <Button
                    onClick={() => {
                      router.push(`/admin/dashboard/vehicles/documents/shipping?vehicleId=${vehicle._id || vehicle.id}`)
                    }}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Manage Shipping Documents
                  </Button>
                </div>
                
                {/* Shipping History */}
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Shipping History</h3>
                  
                  {isLoadingShipping ? (
                    <div className="text-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Loading shipping history...</p>
                    </div>
                  ) : shippingHistory.length > 0 ? (
                    <div className="border rounded-md divide-y">
                      {shippingHistory.map((entry, index) => (
                        <div key={entry._id || index} className="p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{entry.status}</div>
                              <div className="text-sm text-gray-500">
                                {entry.method ? `Via ${entry.method}` : ''} 
                                {entry.carrier ? ` • ${entry.carrier}` : ''}
                                {entry.trackingNumber ? ` • Tracking: ${entry.trackingNumber}` : ''}
                              </div>
                              {entry.notes && (
                                <div className="mt-2 text-sm text-gray-700">{entry.notes}</div>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {entry.createdAt ? format(new Date(entry.createdAt), 'MMM dd, yyyy • HH:mm') : 'N/A'}
                            </div>
                          </div>
                          {entry.expectedArrival && (
                            <div className="mt-2 text-sm">
                              <span className="text-gray-500">Expected arrival:</span>{' '}
                              <span className="font-medium">{format(new Date(entry.expectedArrival), 'MMM dd, yyyy')}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border rounded-md bg-gray-50">
                      <p className="text-gray-500">No shipping history available</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="timeline">
          <TimelineTab />
        </TabsContent>
      </Tabs>

      <div className="flex space-x-4 mt-6">
        {vehicle.inquiryId && (
          <Button variant="outline" className="flex-1" onClick={() => router.push(`/admin/dashboard/inquiries/${vehicle.inquiryId}`)}>
            <FileText className="h-4 w-4 mr-2" />
            View Original Inquiry
          </Button>
        )}
        
        <Button variant="outline" className="flex-1" onClick={() => router.push(`/admin/dashboard/vehicles/${vehicleId}/edit`)}>
          <Pencil className="h-4 w-4 mr-2" />
          Edit Vehicle
        </Button>
        
        <Button variant="outline" className="flex-1">
          <FileUp className="h-4 w-4 mr-2" />
          Upload Documents
        </Button>
      </div>

      <Dialog open={shippingDialogOpen} onOpenChange={setShippingDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Update Shipping Information</DialogTitle>
            <DialogDescription>
              Manage shipping details for this vehicle
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleShippingSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <select
                  id="status"
                  name="status"
                  value={shippingFormData.status}
                  onChange={handleShippingFormChange}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="Not started">Not started</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="In transit">In transit</option>
                  <option value="Customs">In customs</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="method" className="text-right">
                  Shipping Method
                </Label>
                <Input
                  id="method"
                  name="method"
                  value={shippingFormData.method}
                  onChange={handleShippingFormChange}
                  className="col-span-3"
                  placeholder="Container, RoRo, Air, etc."
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="carrier" className="text-right">
                  Carrier
                </Label>
                <Input
                  id="carrier"
                  name="carrier"
                  value={shippingFormData.carrier}
                  onChange={handleShippingFormChange}
                  className="col-span-3"
                  placeholder="Shipping line or carrier"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="trackingNumber" className="text-right">
                  Tracking #
                </Label>
                <Input
                  id="trackingNumber"
                  name="trackingNumber"
                  value={shippingFormData.trackingNumber}
                  onChange={handleShippingFormChange}
                  className="col-span-3"
                  placeholder="Shipping tracking number"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expectedArrival" className="text-right">
                  Expected Arrival
                </Label>
                <Input
                  id="expectedArrival"
                  name="expectedArrival"
                  type="date"
                  value={shippingFormData.expectedArrival}
                  onChange={handleShippingFormChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right align-top mt-2">
                  Notes
                </Label>
                <textarea
                  id="notes"
                  name="notes"
                  value={shippingFormData.notes}
                  onChange={handleShippingFormChange}
                  className="col-span-3 min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Additional shipping notes or details"
                />
              </div>
              
              {shippingUpdateError && (
                <div className="col-span-4 bg-red-50 text-red-600 p-3 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{shippingUpdateError}</span>
                </div>
              )}
              
              {shippingUpdateSuccess && (
                <div className="col-span-4 bg-green-50 text-green-600 p-3 rounded-md flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Shipping information updated successfully!</span>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShippingDialogOpen(false)}
                disabled={isUpdatingShipping}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isUpdatingShipping || shippingUpdateSuccess}
              >
                {isUpdatingShipping ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}