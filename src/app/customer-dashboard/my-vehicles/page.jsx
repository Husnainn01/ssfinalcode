"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Car,
  Calendar,
  DollarSign,
  Clock,
  FileText,
  Eye,
  Download,
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  Truck,
  ShieldCheck
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"

export default function MyVehiclesPage() {
  const [vehicles, setVehicles] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  // Fetch vehicles from API
  useEffect(() => {
    const fetchVehicles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Use the correct path that matches your API route structure
        const response = await fetch('/api/customer/vehicles', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch vehicles');
        }
        
        const data = await response.json();
        console.log("Vehicles data:", data);
        
        if (data.success) {
          setVehicles(data.vehicles);
        } else {
          throw new Error(data.message || 'Failed to fetch vehicles');
        }
      } catch (err) {
        console.error('Error fetching vehicles:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVehicles();
  }, []);

  // Filter vehicles based on search term
  const filteredVehicles = vehicles.filter(vehicle => 
    vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vehicle.stockNumber && vehicle.stockNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  const downloadDocument = (document, e) => {
    e.stopPropagation()
    console.log(`Downloading document: ${document.url}`)
    alert(`Downloading ${document.name}`)
  }

  // Add a helper function to render inquiry link badge
  const renderInquiryBadge = (vehicle) => {
    if (!vehicle.inquiryId) return null;
    
    return (
      <div className="mt-2">
        <Link href={`/customer-dashboard/inquiries/${vehicle.inquiryId}`}>
          <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
            <FileText className="h-3 w-3 mr-1" />
            <span className="text-xs">From Inquiry #{vehicle.inquiryId.substring(0, 8)}</span>
          </Badge>
        </Link>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Vehicles</h1>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by make, model, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Error loading vehicles: {error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading vehicles...</span>
        </div>
      ) : (
        <>
          {filteredVehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map((vehicle) => (
                <Card 
                  key={vehicle.id} 
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48 w-full">
                    {vehicle.imageUrl || (vehicle.images && vehicle.images.length > 0) ? (
                      <Image
                        src={vehicle.imageUrl || vehicle.images[0]}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Car className="h-16 w-16 text-gray-300" />
                      </div>
                    )}
                    <Badge className={cn("absolute top-2 right-2", getStatusColor(vehicle.status))}>
                      <span className="flex items-center">
                        {getStatusIcon(vehicle.status)}
                        <span className="ml-1 capitalize">{vehicle.status}</span>
                      </span>
                    </Badge>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle>{vehicle.make} {vehicle.model} ({vehicle.year})</CardTitle>
                    <CardDescription>
                      {vehicle.stockNumber ? `Stock #: ${vehicle.stockNumber}` : `ID: ${vehicle.id?.substring(0, 8)}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 pb-2">
                    <div className="flex justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>${(vehicle.agreedPrice || vehicle.price || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>
                          {vehicle.dateAgreed 
                            ? new Date(vehicle.dateAgreed).toLocaleDateString() 
                            : vehicle.createdAt 
                              ? new Date(vehicle.createdAt).toLocaleDateString()
                              : 'N/A'}
                        </span>
                      </div>
                    </div>
                    {vehicle.estimatedDelivery && (
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Est. Delivery:</span> {new Date(vehicle.estimatedDelivery).toLocaleDateString()}
                      </div>
                    )}
                    
                    {/* Basic specs information */}
                    <div className="text-sm text-gray-500 mt-2 grid grid-cols-2 gap-x-2 gap-y-1">
                      {vehicle.specs?.color && (
                        <>
                          <span>Color:</span>
                          <span>{vehicle.specs.color}</span>
                        </>
                      )}
                      {vehicle.specs?.fuelType && (
                        <>
                          <span>Fuel:</span>
                          <span>{vehicle.specs.fuelType}</span>
                        </>
                      )}
                    </div>
                    
                    {/* Add the inquiry badge */}
                    {renderInquiryBadge(vehicle)}
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Link href={`/customer-dashboard/my-vehicles/${vehicle.id}`}>
                      <Button>View Details</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Car className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                You don't have any vehicles in your account yet. When you agree on a price for a vehicle through inquiries, it will appear here.
              </p>
              <Button variant="outline" onClick={() => router.push('/customer-dashboard/inquiries')}>
                Go to Inquiries
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Sample data for development/testing
const sampleVehicles = [
  {
    id: "VEH-001",
    make: "Toyota",
    model: "Supra",
    year: 2020,
    price: 65000,
    agreedPrice: 62500,
    status: "processing",
    imageUrl: "https://images.unsplash.com/photo-1632245889029-e406faaa34cd?q=80&w=1000",
    inquiryId: "INQ-123",
    dateAgreed: "2023-12-15",
    estimatedDelivery: "2024-03-20"
  },
  {
    id: "VEH-002",
    make: "Nissan",
    model: "GT-R",
    year: 2019,
    price: 85000,
    agreedPrice: 80000,
    status: "shipping",
    imageUrl: "https://images.unsplash.com/photo-1626668893632-6f3a4466d109?q=80&w=1000",
    inquiryId: "INQ-456",
    dateAgreed: "2023-11-10",
    estimatedDelivery: "2024-02-15"
  }
]; 