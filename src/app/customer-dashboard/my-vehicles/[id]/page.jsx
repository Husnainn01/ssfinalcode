"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import {
  Car,
  Calendar,
  DollarSign,
  Clock,
  FileText,
  Download,
  ArrowLeft,
  Truck,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  User,
  Info,
  Gauge,
  Fuel,
  Palette,
  Settings,
  Share2,
  X,
  RefreshCw,
  Eye
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumbs"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"

// Sample data for a single vehicle - no interface needed in JSX
const sampleVehicle = {
  id: "VEH-001",
  make: "Toyota",
  model: "Supra",
  year: 2020,
  price: 65000,
  agreedPrice: 62500,
  status: "processing",
  imageUrl: "https://images.unsplash.com/photo-1632245889029-e406faaa34cd?q=80&w=1000",
  images: [
    "https://images.unsplash.com/photo-1632245889029-e406faaa34cd?q=80&w=1000",
    "https://images.unsplash.com/photo-1611016186353-9af58c69a533?q=80&w=1000",
    "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=1000",
    "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=1000"
  ],
  inquiryId: "INQ-123",
  dateAgreed: "2023-12-15",
  estimatedDelivery: "2024-03-20",
  specs: {
    engine: "3.0L Inline-6 Turbo",
    transmission: "8-Speed Automatic",
    mileage: 15000,
    color: "Renaissance Red 2.0",
    fuelType: "Petrol",
    bodyType: "Coupe",
    vin: "JT3HP10V5W0007211",
    doors: 2,
    seats: 2,
    features: [
      "Leather Seats",
      "Navigation System",
      "Bluetooth",
      "Backup Camera",
      "Heated Seats",
      "Premium Sound System",
      "Keyless Entry",
      "Adaptive Cruise Control",
      "Lane Departure Warning",
      "Blind Spot Monitoring"
    ]
  },
  documents: [
    { 
      id: "DOC-1", 
      name: "Purchase Agreement", 
      type: "PDF", 
      url: "/documents/agreement.pdf",
      dateAdded: "2023-12-16"
    },
    { 
      id: "DOC-2", 
      name: "Vehicle Inspection", 
      type: "PDF", 
      url: "/documents/inspection.pdf",
      dateAdded: "2023-12-18"
    },
    { 
      id: "DOC-3", 
      name: "Export Certificate", 
      type: "PDF", 
      url: "/documents/export.pdf",
      dateAdded: "2023-12-22"
    },
    { 
      id: "DOC-4", 
      name: "Shipping Documents", 
      type: "PDF", 
      url: "/documents/shipping.pdf",
      dateAdded: "2024-01-05"
    }
  ],
  timeline: [
    { 
      status: "Inquiry Created", 
      date: "2023-11-30", 
      description: "Initial inquiry submitted for Toyota Supra", 
      completed: true
    },
    { 
      status: "Price Agreed", 
      date: "2023-12-15", 
      description: "Final price negotiated and agreed at $62,500", 
      completed: true
    },
    { 
      status: "Processing", 
      date: "2023-12-20", 
      description: "Vehicle being prepared for shipping, inspection completed", 
      completed: true
    },
    { 
      status: "Shipping", 
      date: "2024-01-10", 
      description: "Vehicle in transit from Japan to United States", 
      completed: false
    },
    { 
      status: "Delivery", 
      date: "2024-03-20", 
      description: "Estimated delivery to customer location", 
      completed: false
    }
  ],
  shipping: {
    trackingNumber: "JDM-SHIP-12345",
    carrier: "Ocean Network Express",
    origin: "Yokohama, Japan",
    destination: "Los Angeles, USA",
    departureDate: "2024-01-10",
    arrivalDate: "2024-03-15",
    currentLocation: "Pacific Ocean",
    status: "In Transit"
  },
  contactPerson: {
    name: "Sarah Johnson",
    role: "Customer Support Specialist",
    email: "sarah.johnson@jdmglobal.com",
    phone: "+1-555-123-4567",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg"
  }
};

export default function VehicleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id;
  
  // Remove TypeScript generics from useState declarations
  const [vehicle, setVehicle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [progressValue, setProgressValue] = useState(0);
  const [activeTab, setActiveTab] = useState("details");
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isDocumentsLoading, setIsDocumentsLoading] = useState(false);

  // Add a ref to track if documents have been loaded
  const documentsLoadedRef = useRef(false);

  // Fetch vehicle data
  useEffect(() => {
    const fetchVehicle = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching vehicle data for ID: ${vehicleId}`);
        
        // Use the correct API path that matches your route structure
        const response = await fetch(`/api/customer/vehicles/${vehicleId}`, {
          credentials: 'include'
        });
        
        const data = await response.json();
        console.log("Raw vehicle data:", data);
        setApiResponse(data);
        
        if (!response.ok || !data.success || !data.vehicle) {
          console.warn("Using sample data as fallback due to API issue");
          setVehicle(sampleVehicle);
          setSelectedImage(sampleVehicle.images[0]);
          
          const completedSteps = sampleVehicle.timeline.filter(step => step.completed).length;
          const totalSteps = sampleVehicle.timeline.length;
          const progress = Math.round((completedSteps / totalSteps) * 100);
          setProgressValue(progress);
        } else {
          console.log("Setting vehicle data:", data.vehicle);
          
          // The existing API already includes shipping data in the response
          setVehicle(data.vehicle);
          
          if (data.vehicle.images?.length > 0) {
            setSelectedImage(data.vehicle.images[0]);
          } else if (data.vehicle.imageUrl) {
            setSelectedImage(data.vehicle.imageUrl);
          }
          
          if (data.vehicle.timeline?.length > 0) {
            const completedSteps = data.vehicle.timeline.filter(step => step.completed).length;
            const totalSteps = data.vehicle.timeline.length;
            const progress = Math.round((completedSteps / totalSteps) * 100);
            setProgressValue(progress);
          }
        }
      } catch (err) {
        console.error('Error fetching vehicle details:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (vehicleId) {
      fetchVehicle();
    }
  }, [vehicleId]);

  // Add a refresh mechanism to periodically check for timeline updates
  useEffect(() => {
    let refreshTimer;

    const refreshTimelineData = async () => {
      try {
        // Only refresh if we're on the timeline tab
        if (activeTab === "timeline" && vehicleId) {
          console.log("Refreshing timeline data...");
          
          const response = await fetch(`/api/customer/vehicles/${vehicleId}/timeline`, {
            credentials: 'include'
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.timeline) {
              // Update just the timeline part without reloading everything
              setVehicle(prev => ({
                ...prev,
                timeline: data.timeline
              }));
              
              // Update progress value
              if (data.timeline.length > 0) {
                const completedSteps = data.timeline.filter(step => step.completed).length;
                const totalSteps = data.timeline.length;
                const progress = Math.round((completedSteps / totalSteps) * 100);
                setProgressValue(progress);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error refreshing timeline:", err);
      }
    };

    // Set up a refresh interval when on the timeline tab
    if (activeTab === "timeline") {
      refreshTimer = setInterval(refreshTimelineData, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (refreshTimer) clearInterval(refreshTimer);
    };
  }, [vehicleId, activeTab]);

  // Modify the useEffect for document loading
  useEffect(() => {
    const fetchDocuments = async () => {
      // Skip if no vehicleId or if documents have already been loaded
      if (!vehicleId || documentsLoadedRef.current) return;
      
      setIsDocumentsLoading(true);
      try {
        console.log(`Fetching documents for vehicle ID: ${vehicleId}`);
        
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/customer/vehicles/${vehicleId}/documents?t=${timestamp}`, {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        const data = await response.json();
        console.log("Documents API response:", data);
        
        if (data.success && Array.isArray(data.documents)) {
          setVehicle(prev => ({
            ...prev,
            documents: data.documents
          }));
          
          // Mark documents as loaded to prevent future fetches
          documentsLoadedRef.current = true;
          
          if (data.documents.length > 0) {
            console.log(`Found ${data.documents.length} documents for vehicle`);
            
            // Show toast only if documents were found
            toast({
              title: `${data.documents.length} documents found`,
              description: "Documents have been loaded successfully."
            });
          } else {
            console.log("No documents found for this vehicle");
          }
        } else {
          // Mark as loaded even if there's an error to prevent constant retries
          documentsLoadedRef.current = true;
          console.log("Document API returned no documents or error:", data.message);
        }
      } catch (err) {
        console.error("Error fetching vehicle documents:", err);
        // Mark as loaded to prevent constant retry on errors
        documentsLoadedRef.current = true;
      } finally {
        setIsDocumentsLoading(false);
      }
    };
    
    if (vehicleId) {
      fetchDocuments();
    }
    
    // Reset ref when vehicleId changes
    return () => {
      documentsLoadedRef.current = false;
    };
  }, [vehicleId]); // Only depend on vehicleId, not vehicle

  // No type parameter needed for status in JSX
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipping': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'processing': return <CheckCircle className="h-4 w-4" />
      case 'shipping': return <Truck className="h-4 w-4" />
      case 'delivered': return <ShieldCheck className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }
  
  // Remove type annotation from parameter
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (err) {
      console.error("Date formatting error:", err);
      return "N/A";
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h2 className="text-2xl font-bold">Loading Vehicle Details...</h2>
        </div>
        
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to My Vehicles
        </Button>
        
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center mb-6">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Error loading vehicle details: {error}</span>
        </div>
        
        {apiResponse && (
          <div className="mt-6 p-4 border rounded bg-gray-50">
            <h3 className="text-lg font-semibold mb-2">API Response (Debug):</h3>
            <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-4">
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Not found or data error state
  if (!vehicle) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to My Vehicles
        </Button>
        
        <div className="text-center py-12">
          <Car className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {apiResponse?.success === false ? 'Vehicle data error' : 'Vehicle not found'}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            {apiResponse?.message || "We couldn't properly display the vehicle data. It may be in an unexpected format."}
          </p>
          
          {apiResponse && (
            <div className="mt-6 p-4 border rounded bg-gray-50 text-left max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold mb-2">API Response (Debug):</h3>
              <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          )}
          
          <Button onClick={() => router.push('/customer-dashboard/my-vehicles')} className="mt-6">
            Return to My Vehicles
          </Button>
        </div>
      </div>
    );
  }

  // Debug section - JSX version  
  const DebugSection = () => (
    <div className="mt-8 p-4 border rounded bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">Vehicle Data (Debug):</h3>
      <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">
        {JSON.stringify(vehicle, null, 2)}
      </pre>
    </div>
  );

  // Function to group documents by category
  const groupDocumentsByCategory = (documents) => {
    if (!documents || !Array.isArray(documents)) return [];
    
    const grouped = documents.reduce((acc, doc) => {
      const category = doc.category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(doc);
      return acc;
    }, {});
    
    // Convert to array of [category, documents] pairs and sort categories
    return Object.entries(grouped).sort((a, b) => {
      // Define a custom sort order for categories
      const order = {
        'purchase_agreement': 1,
        'invoice': 2,
        'customs_document': 3,
        'shipping_document': 4,
        'other': 5
      };
      
      return (order[a[0]] || 999) - (order[b[0]] || 999);
    });
  };

  // Function to format category names for display
  const formatCategoryName = (category) => {
    if (!category) return 'Other Documents';
    
    const formatted = category.replace(/_/g, ' ');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1) + ' Documents';
  };

  // Function to determine file icon based on file type
  const getDocumentIcon = (fileType) => {
    const iconClasses = "h-10 w-10 p-2 rounded-full";
    
    switch (fileType?.toLowerCase()) {
      case 'pdf':
        return <div className={`${iconClasses} bg-red-100 text-red-600`}><FileText className="h-6 w-6" /></div>;
      case 'doc':
      case 'docx':
        return <div className={`${iconClasses} bg-blue-100 text-blue-600`}><FileText className="h-6 w-6" /></div>;
      case 'xls':
      case 'xlsx':
        return <div className={`${iconClasses} bg-green-100 text-green-600`}><FileText className="h-6 w-6" /></div>;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <div className={`${iconClasses} bg-purple-100 text-purple-600`}><Image className="h-6 w-6" /></div>;
      default:
        return <div className={`${iconClasses} bg-gray-100 text-gray-600`}><FileText className="h-6 w-6" /></div>;
    }
  };

  // Function to extract file type from filename
  const getFileTypeFromName = (fileName) => {
    if (!fileName) return '';
    const extension = fileName.split('.').pop();
    return extension || '';
  };

  // Function to format file size
  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return 'Unknown size';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    if (i === 0) return `${bytes} ${sizes[i]}`;
    return `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`;
  };

  // Function to download document
  const downloadDocument = async (doc) => {
    try {
      if (doc.url) {
        // If we already have a direct URL, just open it
        window.open(doc.url, '_blank');
        return;
      }
      
      if (doc.cloudinaryId) {
        // Use the resource type from the document if available
        const resourceType = doc.resourceType || 
                           (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(doc.type?.toLowerCase()) 
                             ? 'image' 
                             : 'raw');
        
        // If we have the cloudinary ID, we need to get the download URL
        const response = await fetch(`/api/customer/documents/download?id=${doc.cloudinaryId}&resourceType=${resourceType}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to get download link');
        }
        
        const data = await response.json();
        if (data.success && data.downloadUrl) {
          // Open the download URL in a new tab or initiate download
          window.open(data.downloadUrl, '_blank');
          
          toast({
            title: "Download started",
            description: `Downloading ${doc.name}`
          });
        } else {
          throw new Error(data.message || 'Could not retrieve document URL');
        }
        return;
      }
      
      // If we don't have either URL or cloudinaryId
      throw new Error('Document has no URL or Cloudinary ID');
    } catch (err) {
      console.error('Error downloading document:', err);
      toast({
        title: "Download failed",
        description: err.message || "Could not download the document.",
        variant: "destructive"
      });
    }
  };

  // Add a function to get a document icon with a category-specific color
  const getDocumentIconWithCategoryColor = (fileType, category) => {
    const iconClasses = "h-10 w-10 p-2 rounded-full";
    const categoryColors = {
      'invoice': 'bg-blue-100 text-blue-600',
      'purchase_agreement': 'bg-green-100 text-green-600',
      'customs_document': 'bg-amber-100 text-amber-600',
      'shipping_document': 'bg-purple-100 text-purple-600',
      'other': 'bg-gray-100 text-gray-600'
    };
    
    const color = categoryColors[category] || categoryColors.other;
    
    switch (fileType?.toLowerCase()) {
      case 'pdf':
        return <div className={`${iconClasses} ${color}`}><FileText className="h-6 w-6" /></div>;
      case 'doc':
      case 'docx':
        return <div className={`${iconClasses} ${color}`}><FileText className="h-6 w-6" /></div>;
      case 'xls':
      case 'xlsx':
        return <div className={`${iconClasses} ${color}`}><FileText className="h-6 w-6" /></div>;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <div className={`${iconClasses} ${color}`}><Image className="h-6 w-6" /></div>;
      default:
        return <div className={`${iconClasses} ${color}`}><FileText className="h-6 w-6" /></div>;
    }
  };

  const openPreview = (doc) => {
    setPreviewDoc(doc);
  };

  const closePreview = () => {
    setPreviewDoc(null);
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to My Vehicles
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              {vehicle.year || ''} {vehicle.make || ''} {vehicle.model || ''}
            </h1>
            <div className="flex items-center mt-1">
              <Badge className={`mr-2 ${getStatusColor(vehicle.status || 'pending')}`}>
                <span className="flex items-center">
                  {getStatusIcon(vehicle.status || 'pending')}
                  <span className="ml-1 capitalize">{vehicle.status || 'pending'}</span>
                </span>
              </Badge>
              <span className="text-sm text-gray-500">
                {vehicle.stockNumber ? `Stock #: ${vehicle.stockNumber}` : `ID: ${vehicle.id || vehicleId}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <div className="relative h-[300px] md:h-[400px] w-full rounded-lg overflow-hidden border">
            {selectedImage ? (
              <Image
                src={selectedImage}
                alt={`${vehicle.make || ''} ${vehicle.model || ''}`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <Car className="h-16 w-16 text-gray-300" />
                <p className="mt-2 text-gray-500">No image available</p>
              </div>
            )}
          </div>
          
          {vehicle.images && vehicle.images.length > 0 && (
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-6 gap-2 mt-4">
              {vehicle.images.map((image, index) => (
                <div 
                  key={index}
                  className={`relative aspect-square rounded-md overflow-hidden border cursor-pointer transition-all ${
                    selectedImage === image ? "ring-2 ring-primary ring-offset-2" : "hover:opacity-80"
                  }`}
                  onClick={() => setSelectedImage(image)}
                >
                  <Image
                    src={image}
                    alt={`${vehicle.make || ''} ${vehicle.model || ''} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Vehicle Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Make</div>
                  <div className="font-medium">{vehicle.make || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Model</div>
                  <div className="font-medium">{vehicle.model || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Year</div>
                  <div className="font-medium">{vehicle.year || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <Badge className={getStatusColor(vehicle.status || 'pending')}>
                    <span className="capitalize">{vehicle.status || 'pending'}</span>
                  </Badge>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Original Price</div>
                    <div className="font-medium">${(vehicle.price || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Agreed Price</div>
                    <div className="font-medium text-green-600">${(vehicle.agreedPrice || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Date Agreed</div>
                    <div className="font-medium">{formatDate(vehicle.dateAgreed)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Est. Delivery</div>
                    <div className="font-medium">{formatDate(vehicle.estimatedDelivery || '')}</div>
                  </div>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="text-sm text-gray-500 mb-1">Delivery Progress</div>
                <Progress value={progressValue} className="h-2" />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">Order Placed</span>
                  <span className="text-xs text-gray-500">Delivered</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {vehicle.contactPerson && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Your Contact Person</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  {vehicle.contactPerson.avatar ? (
                    <div className="relative h-12 w-12 rounded-full overflow-hidden mr-3">
                      <Image
                        src={vehicle.contactPerson.avatar}
                        alt={vehicle.contactPerson.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <User className="h-6 w-6 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{vehicle.contactPerson.name}</div>
                    <div className="text-sm text-gray-500">{vehicle.contactPerson.role}</div>
                  </div>
                </div>
                
                <div className="space-y-2 mt-4">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-500 mr-2" />
                    <a href={`mailto:${vehicle.contactPerson.email}`} className="text-sm text-blue-600 hover:underline">
                      {vehicle.contactPerson.email}
                    </a>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-500 mr-2" />
                    <a href={`tel:${vehicle.contactPerson.phone}`} className="text-sm text-blue-600 hover:underline">
                      {vehicle.contactPerson.phone}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="details" className="mt-6" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4">
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
                      <div className="text-sm font-medium">{vehicle.make || 'N/A'}</div>
                      
                      <div className="text-sm text-gray-500">Model</div>
                      <div className="text-sm font-medium">{vehicle.model || 'N/A'}</div>
                      
                      <div className="text-sm text-gray-500">Year</div>
                      <div className="text-sm font-medium">{vehicle.year || 'N/A'}</div>
                      
                      <div className="text-sm text-gray-500">Body Type</div>
                      <div className="text-sm font-medium">{vehicle.specs?.bodyType || 'N/A'}</div>
                      
                      <div className="text-sm text-gray-500">Color</div>
                      <div className="text-sm font-medium">{vehicle.specs?.color || 'N/A'}</div>
                      
                      <div className="text-sm text-gray-500">VIN</div>
                      <div className="text-sm font-medium">{vehicle.specs?.vin || 'N/A'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Engine & Performance</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-gray-500">Engine</div>
                      <div className="text-sm font-medium">{vehicle.specs?.engine || 'N/A'}</div>
                      
                      <div className="text-sm text-gray-500">Transmission</div>
                      <div className="text-sm font-medium">{vehicle.specs?.transmission || 'N/A'}</div>
                      
                      <div className="text-sm text-gray-500">Fuel Type</div>
                      <div className="text-sm font-medium">{vehicle.specs?.fuelType || 'N/A'}</div>
                      
                      <div className="text-sm text-gray-500">Mileage</div>
                      <div className="text-sm font-medium">
                        {vehicle.specs?.mileage 
                          ? `${vehicle.specs.mileage.toLocaleString()} km` 
                          : 'N/A'
                        }
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Purchase Details</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-gray-500">Original Price</div>
                      <div className="text-sm font-medium">${(vehicle.price || 0).toLocaleString()}</div>
                      
                      <div className="text-sm text-gray-500">Agreed Price</div>
                      <div className="text-sm font-medium text-green-600">${(vehicle.agreedPrice || 0).toLocaleString()}</div>
                      
                      {vehicle.price && vehicle.agreedPrice && vehicle.price !== vehicle.agreedPrice && (
                        <>
                          <div className="text-sm text-gray-500">Savings</div>
                          <div className="text-sm font-medium text-green-600">
                            ${(vehicle.price - vehicle.agreedPrice).toLocaleString()} 
                            ({Math.round(((vehicle.price - vehicle.agreedPrice) / vehicle.price) * 100)}%)
                          </div>
                        </>
                      )}
                      
                      <div className="text-sm text-gray-500">Date Agreed</div>
                      <div className="text-sm font-medium">{formatDate(vehicle.dateAgreed)}</div>
                      
                      {vehicle.inquiryId && (
                        <>
                          <div className="text-sm text-gray-500">Inquiry ID</div>
                          <div className="text-sm font-medium">{vehicle.inquiryId}</div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {vehicle.shipping && (
                    <div>
                      <h3 className="font-medium mb-2">Shipping Summary</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {vehicle.shipping.origin && (
                          <>
                            <div className="text-sm text-gray-500">Origin</div>
                            <div className="text-sm font-medium">{vehicle.shipping.origin}</div>
                          </>
                        )}
                        
                        {vehicle.shipping.destination && (
                          <>
                            <div className="text-sm text-gray-500">Destination</div>
                            <div className="text-sm font-medium">{vehicle.shipping.destination}</div>
                          </>
                        )}
                        
                        {vehicle.shipping.carrier && (
                          <>
                            <div className="text-sm text-gray-500">Carrier</div>
                            <div className="text-sm font-medium">{vehicle.shipping.carrier}</div>
                          </>
                        )}
                        
                        {vehicle.shipping.trackingNumber && (
                          <>
                            <div className="text-sm text-gray-500">Tracking Number</div>
                            <div className="text-sm font-medium">{vehicle.shipping.trackingNumber}</div>
                          </>
                        )}
                        
                        {vehicle.shipping.status && (
                          <>
                            <div className="text-sm text-gray-500">Status</div>
                            <div className="text-sm font-medium">{vehicle.shipping.status}</div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Features */}
              {vehicle.specs?.features && vehicle.specs.features.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <h3 className="font-medium mb-2">Features</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {vehicle.specs.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Timeline</CardTitle>
              <CardDescription>Track the progress of your vehicle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-2">Overall Progress</div>
                <Progress value={progressValue} className="h-2 mb-4" />
              </div>
              
              <div className="flex justify-end mb-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      const response = await fetch(`/api/customer/vehicles/${vehicleId}`, {
                        credentials: 'include'
                      });
                      
                      const data = await response.json();
                      if (data.success && data.vehicle) {
                        setVehicle(data.vehicle);
                        
                        if (data.vehicle.timeline?.length > 0) {
                          const completedSteps = data.vehicle.timeline.filter(step => step.completed).length;
                          const totalSteps = data.vehicle.timeline.length;
                          const progress = Math.round((completedSteps / totalSteps) * 100);
                          setProgressValue(progress);
                        }
                        
                        toast({
                          title: "Timeline updated",
                          description: "The latest timeline information has been loaded."
                        });
                      }
                    } catch (err) {
                      console.error("Error refreshing data:", err);
                      toast({
                        title: "Error refreshing",
                        description: "Could not refresh the timeline data.",
                        variant: "destructive"
                      });
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh Timeline
                </Button>
              </div>
              
              {(vehicle.timeline && vehicle.timeline.length > 0) ? (
                <div className="relative">
                  {/* Sort timeline by date to ensure chronological order */}
                  {vehicle.timeline
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map((event, index, sortedTimeline) => (
                      <div key={index} className="mb-6 flex">
                        <div className="flex flex-col items-center mr-4">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                            event.completed 
                              ? "bg-green-100 text-green-600" 
                              : "bg-gray-100 text-gray-400"
                          }`}>
                            {event.completed 
                              ? <CheckCircle className="h-4 w-4" /> 
                              : index + 1}
                          </div>
                          {index < sortedTimeline.length - 1 && (
                            <div className={`w-px h-full ${
                              event.completed && sortedTimeline[index + 1]?.completed 
                                ? "bg-green-300" 
                                : "bg-gray-300"
                            }`}></div>
                          )}
                        </div>
                        <div className="pt-1 pb-8">
                          <div className="flex items-center">
                            <h3 className={`text-lg font-bold ${
                              event.completed ? "text-gray-900" : "text-gray-500"
                            }`}>{event.status}</h3>
                            <span className="ml-2 text-sm text-gray-500">
                              {formatDate(event.date)}
                            </span>
                          </div>
                          <p className={`mt-1 ${
                            event.completed ? "text-gray-600" : "text-gray-400"
                          }`}>{event.description}</p>
                          {event.updatedBy && (
                            <div className="mt-1 text-xs text-gray-400">
                              Last updated: {formatDate(event.updatedAt || event.date)}
                              {event.updatedBy && ` by ${event.updatedBy}`}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Clock className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Timeline information is not available</p>
                </div>
              )}
              
              {vehicle.shipping && Object.keys(vehicle.shipping).length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium mb-4">Shipping Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vehicle.shipping.carrier && (
                      <div>
                        <div className="text-sm text-gray-500">Carrier</div>
                        <div className="font-medium">{vehicle.shipping.carrier}</div>
                      </div>
                    )}
                    
                    {vehicle.shipping.trackingNumber && (
                      <div>
                        <div className="text-sm text-gray-500">Tracking Number</div>
                        <div className="font-medium">{vehicle.shipping.trackingNumber}</div>
                      </div>
                    )}
                    
                    {vehicle.shipping.origin && (
                      <div>
                        <div className="text-sm text-gray-500">Origin</div>
                        <div className="font-medium">{vehicle.shipping.origin}</div>
                      </div>
                    )}
                    
                    {vehicle.shipping.destination && (
                      <div>
                        <div className="text-sm text-gray-500">Destination</div>
                        <div className="font-medium">{vehicle.shipping.destination}</div>
                      </div>
                    )}
                    
                    {vehicle.shipping.departureDate && (
                      <div>
                        <div className="text-sm text-gray-500">Departure Date</div>
                        <div className="font-medium">{formatDate(vehicle.shipping.departureDate)}</div>
                      </div>
                    )}
                    
                    {vehicle.shipping.arrivalDate && (
                      <div>
                        <div className="text-sm text-gray-500">Estimated Arrival</div>
                        <div className="font-medium">{formatDate(vehicle.shipping.arrivalDate)}</div>
                      </div>
                    )}
                    
                    {vehicle.shipping.currentLocation && (
                      <div>
                        <div className="text-sm text-gray-500">Current Location</div>
                        <div className="font-medium">{vehicle.shipping.currentLocation}</div>
                      </div>
                    )}
                    
                    {vehicle.shipping.status && (
                      <div>
                        <div className="text-sm text-gray-500">Status</div>
                        <Badge>{vehicle.shipping.status}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="shipping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
              <CardDescription>Track your vehicle's shipping status</CardDescription>
            </CardHeader>
            <CardContent>
              {vehicle.shipping ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm text-gray-500">Current Status</h3>
                      <p className="font-medium">{vehicle.shipping.status || vehicle.shipping.shippingStatus || "Not started"}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm text-gray-500">Expected Arrival</h3>
                      <p className="font-medium">
                        {vehicle.shipping.arrivalDate || vehicle.shipping.estimatedArrival
                          ? formatDate(vehicle.shipping.arrivalDate || vehicle.shipping.estimatedArrival) 
                          : "Not scheduled"}
                      </p>
                    </div>
                    
                    {(vehicle.shipping.carrier || vehicle.shipping.shippingCarrier) && (
                      <div>
                        <h3 className="text-sm text-gray-500">Carrier</h3>
                        <p className="font-medium">{vehicle.shipping.carrier || vehicle.shipping.shippingCarrier}</p>
                      </div>
                    )}
                    
                    {(vehicle.shipping.trackingNumber || vehicle.shipping.shippingTrackingNumber) && (
                      <div>
                        <h3 className="text-sm text-gray-500">Tracking Number</h3>
                        <p className="font-medium">{vehicle.shipping.trackingNumber || vehicle.shipping.shippingTrackingNumber}</p>
                      </div>
                    )}
                    
                    {(vehicle.shipping.origin || vehicle.shipping.departureLocation) && (
                      <div>
                        <h3 className="text-sm text-gray-500">Origin</h3>
                        <p className="font-medium">{vehicle.shipping.origin || vehicle.shipping.departureLocation}</p>
                      </div>
                    )}
                    
                    {(vehicle.shipping.destination || vehicle.shipping.arrivalLocation) && (
                      <div>
                        <div className="text-sm text-gray-500">Destination</div>
                        <div className="font-medium">{vehicle.shipping.destination || vehicle.shipping.arrivalLocation}</div>
                      </div>
                    )}
                    
                    {(vehicle.shipping.departureDate || vehicle.shipping.shipmentDate) && (
                      <div>
                        <h3 className="text-sm text-gray-500">Departure Date</h3>
                        <p className="font-medium">{formatDate(vehicle.shipping.departureDate || vehicle.shipping.shipmentDate)}</p>
                      </div>
                    )}
                    
                    {(vehicle.shipping.currentLocation || vehicle.shipping.lastKnownLocation) && (
                      <div>
                        <h3 className="text-sm text-gray-500">Current Location</h3>
                        <p className="font-medium">{vehicle.shipping.currentLocation || vehicle.shipping.lastKnownLocation}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Truck className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Shipping information not available</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Shipping details will be available once your vehicle is ready to be shipped.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Vehicle Documents</CardTitle>
                <CardDescription>
                  Important documents related to your vehicle purchase and shipping
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={async () => {
                    setIsDocumentsLoading(true);
                    // Reset the documents loaded ref to force a fresh fetch
                    documentsLoadedRef.current = false;
                    try {
                      const response = await fetch(`/api/customer/vehicles/${vehicleId}/documents`, {
                        credentials: 'include',
                        // Add cache: 'no-store' to avoid caching issues
                        cache: 'no-store',
                        // Add a timestamp to bust the cache
                        headers: {
                          'Cache-Control': 'no-cache',
                          'Pragma': 'no-cache',
                          'X-Timestamp': new Date().getTime()
                        }
                      });
                      
                      const data = await response.json();
                      console.log("Documents API response:", data);
                      
                      if (data.success && data.documents) {
                        setVehicle(prev => ({
                          ...prev,
                          documents: data.documents
                        }));
                        
                        toast({
                          title: `${data.documents.length} documents found`,
                          description: "The latest document list has been loaded."
                        });
                      } else {
                        toast({
                          title: "No documents found",
                          description: data.message || "Could not find any documents for this vehicle."
                        });
                      }
                    } catch (err) {
                      console.error("Error refreshing documents:", err);
                      toast({
                        title: "Error refreshing",
                        description: "Could not refresh the document list. Please try again later.",
                        variant: "destructive"
                      });
                    } finally {
                      setIsDocumentsLoading(false);
                    }
                  }}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isDocumentsLoading ? 'animate-spin' : ''}`} />
                  Refresh Documents
                </Button>
                
                {process.env.NODE_ENV === 'development' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      console.log("Current vehicle state:", vehicle);
                      console.log("Documents:", vehicle?.documents);
                      
                      if (vehicle?.documents && vehicle.documents.length > 0) {
                        toast({
                          title: `${vehicle.documents.length} documents in state`,
                          description: "Check browser console for details"
                        });
                      } else {
                        toast({
                          title: "No documents in state",
                          description: "The vehicle object doesn't have any documents"
                        });
                      }
                    }}
                  >
                    Debug Documents
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isDocumentsLoading ? (
                // Show loading state but preserve existing documents
                <div className="relative">
                  {/* Semi-transparent overlay */}
                  <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-2"></div>
                      <span className="text-sm text-gray-600">Refreshing documents...</span>
                    </div>
                  </div>
                  
                  {/* Show existing documents in background if any */}
                  {vehicle?.documents && vehicle.documents.length > 0 ? (
                    <div className="opacity-50">
                      {groupDocumentsByCategory(vehicle.documents).map(([category, docs]) => (
                        <div key={category} className="mb-6">
                          <h3 className="text-lg font-medium mb-3 capitalize">
                            {formatCategoryName(category)}
                          </h3>
                          <div className="space-y-3">
                            {docs.map((doc, index) => (
                              <div 
                                key={index} 
                                className="flex justify-between items-center p-4 bg-gray-50 rounded-md"
                              >
                                <div className="flex items-center">
                                  {getDocumentIconWithCategoryColor(doc.type || getFileTypeFromName(doc.name), doc.category)}
                                  <div className="ml-3">
                                    <p className="font-medium text-gray-900">{doc.name}</p>
                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                      <Calendar className="h-3.5 w-3.5 mr-1" />
                                      <span>{formatDate(doc.dateAdded || doc.uploadedAt)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Show skeleton loaders if no existing documents
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center space-x-3">
                            <Skeleton className="h-10 w-10 rounded" />
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                          <Skeleton className="h-8 w-24 rounded" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : vehicle?.documents && vehicle.documents.length > 0 ? (
                <div>
                  {groupDocumentsByCategory(vehicle.documents).map(([category, docs]) => (
                    <div key={category} className="mb-6">
                      <h3 className="text-lg font-medium mb-3 capitalize">
                        {formatCategoryName(category)}
                      </h3>
                      <div className="space-y-3">
                        {docs.map((doc, index) => (
                          <div 
                            key={index} 
                            className="flex justify-between items-center p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center">
                              {getDocumentIconWithCategoryColor(doc.type || getFileTypeFromName(doc.name), doc.category)}
                              <div className="ml-3">
                                <p className="font-medium text-gray-900">{doc.name}</p>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                  <Calendar className="h-3.5 w-3.5 mr-1" />
                                  <span>{formatDate(doc.dateAdded || doc.uploadedAt)}</span>
                                  {doc.fileSize && (
                                    <>
                                      <span className="mx-2">•</span>
                                      <span>{formatFileSize(doc.fileSize)}</span>
                                    </>
                                  )}
                                  {doc.originalName && doc.originalName !== doc.name && (
                                    <>
                                      <span className="mx-2">•</span>
                                      <span className="text-xs text-gray-400">ID: {doc.originalName}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              {doc.resourceType === 'image' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openPreview(doc)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Preview
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => downloadDocument(doc)}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No documents available</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    Documents will be added as they become available during the purchase and shipping process.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={closePreview}>
          <div className="relative max-w-3xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute top-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full"
              onClick={closePreview}
            >
              <X className="h-5 w-5" />
            </Button>
            <Image
              src={previewDoc.url}
              alt={previewDoc.name}
              width={800}
              height={600}
              className="max-h-[90vh] max-w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}