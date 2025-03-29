"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, Eye, Edit, Trash, FileText, Truck, AlertCircle, User } from "lucide-react"
import Link from "next/link"

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [totalVehicles, setTotalVehicles] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const router = useRouter()
  const searchParams = useSearchParams()
  const customerId = searchParams.get('customerId')

  useEffect(() => {
    const fetchVehicles = async () => {
      setIsLoading(true)
      try {
        // Use the actual API endpoint
        let url = `/api/admin/vehicles?page=${currentPage}&limit=100`
        if (customerId) {
          url += `&customerId=${customerId}`
        }
        
        console.log("Fetching vehicles from:", url)
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error('Failed to fetch vehicles')
        }
        
        const data = await response.json()
        
        if (data.success) {
          console.log("Fetched vehicles:", data.vehicles.length)
          console.log("Total vehicles:", data.pagination.total)
          
          // Log the first vehicle to check customer data
          if (data.vehicles.length > 0) {
            console.log("Sample vehicle:", {
              id: data.vehicles[0].id,
              customerId: data.vehicles[0].customerId,
              customerName: data.vehicles[0].customerName
            });
          }
          
          setVehicles(data.vehicles || [])
          setTotalVehicles(data.pagination.total)
          setTotalPages(data.pagination.pages)
        } else {
          throw new Error(data.message || 'Failed to load vehicles')
        }
      } catch (err) {
        setError(err.message)
        console.error('Error fetching vehicles:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVehicles()
  }, [customerId, currentPage])

  const filteredVehicles = vehicles.filter(vehicle => 
    vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipping: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800"
    }
    
    return (
      <Badge className={statusColors[status] || "bg-gray-100"}>
        <span className="capitalize">{status || 'unknown'}</span>
      </Badge>
    )
  }

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      try {
        const response = await fetch(`/api/admin/vehicles/${id}`, {
          method: 'DELETE',
        })
        
        if (!response.ok) {
          throw new Error('Failed to delete vehicle')
        }
        
        const data = await response.json()
        
        if (data.success) {
          // Remove from state after successful deletion
          setVehicles(vehicles.filter(vehicle => vehicle.id !== id))
          setTotalVehicles(prev => prev - 1)
          alert('Vehicle deleted successfully')
        } else {
          throw new Error(data.message || 'Failed to delete vehicle')
        }
      } catch (err) {
        console.error('Error deleting vehicle:', err)
        alert('Failed to delete vehicle: ' + err.message)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {customerId ? 'Customer Vehicles' : 'All Customer Vehicles'}
        </h1>
        <Button onClick={() => router.push(`/admin/dashboard/vehicles/add${customerId ? `?customerId=${customerId}` : ''}`)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by make, model, ID, or customer name..."
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Vehicle List</CardTitle>
            <CardDescription>
              Showing {filteredVehicles.length} of {totalVehicles} vehicles
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Est. Delivery</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.length > 0 ? (
                  filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">{vehicle.id}</TableCell>
                      <TableCell>
                        {vehicle.customerId ? (
                          <div className="flex items-center">
                            <span>{vehicle.customerName || "Unknown"}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="ml-1 h-6 w-6"
                              onClick={() => router.push(`/admin/dashboard/customers/${vehicle.customerId}`)}
                            >
                              <User className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span className="text-gray-500">No Customer</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="ml-1 h-6 w-6 text-blue-500"
                              onClick={() => router.push(`/admin/dashboard/vehicles/${vehicle.id}/edit`)}
                              title="Assign Customer"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{vehicle.year} {vehicle.make} {vehicle.model}</TableCell>
                      <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                      <TableCell>${vehicle.price?.toLocaleString() || "N/A"}</TableCell>
                      <TableCell>
                        {vehicle.estimatedDelivery 
                          ? new Date(vehicle.estimatedDelivery).toLocaleDateString() 
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/admin/dashboard/vehicles/${vehicle.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/admin/dashboard/vehicles/${vehicle.id}/edit`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/admin/dashboard/vehicles/${vehicle.id}/documents`)}>
                              <FileText className="h-4 w-4 mr-2" />
                              Manage Documents
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/admin/dashboard/vehicles/${vehicle.id}/shipping`)}>
                              <Truck className="h-4 w-4 mr-2" />
                              Update Shipping
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(vehicle.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {customerId 
                        ? "No vehicles found for this customer" 
                        : "No vehicles found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          {totalPages > 1 && (
            <CardFooter className="flex justify-center py-4">
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    // Show first page, last page, and pages around current page
                    let pagesToShow = [];
                    if (totalPages <= 5) {
                      // If 5 or fewer pages, show all
                      pagesToShow = Array.from({ length: totalPages }, (_, i) => i + 1);
                    } else {
                      // Always show first and last page
                      pagesToShow = [1];
                      
                      // Calculate range around current page
                      const start = Math.max(2, currentPage - 1);
                      const end = Math.min(totalPages - 1, currentPage + 1);
                      
                      // Add ellipsis if needed
                      if (start > 2) {
                        pagesToShow.push('...');
                      }
                      
                      // Add pages around current page
                      for (let i = start; i <= end; i++) {
                        pagesToShow.push(i);
                      }
                      
                      // Add ellipsis if needed
                      if (end < totalPages - 1) {
                        pagesToShow.push('...');
                      }
                      
                      // Add last page
                      pagesToShow.push(totalPages);
                    }
                    
                    return pagesToShow;
                  }).flat().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-2">...</span>
                    ) : (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    )
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  Next
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      )}

      {/* Debug information */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Debug Info:</h3>
          <p>Total vehicles in database: {totalVehicles}</p>
          <p>Vehicles fetched: {vehicles.length}</p>
          <p>Filtered vehicles: {filteredVehicles.length}</p>
          <p>Current page: {currentPage} of {totalPages}</p>
          <p>Customer ID filter: {customerId || 'None'}</p>
          <p>Search term: "{searchTerm}"</p>
          <details>
            <summary className="cursor-pointer text-blue-600">Customer data</summary>
            <pre className="mt-2 p-2 bg-gray-200 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(
                vehicles.map(v => ({ 
                  id: v.id, 
                  customerId: v.customerId, 
                  customerName: v.customerName 
                })), 
                null, 2
              )}
            </pre>
          </details>
        </div>
      )}
    </div>
  )
} 