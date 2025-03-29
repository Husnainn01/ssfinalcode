"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  ArrowLeft,
  Truck, 
  FileText, 
  Ship,
  Calendar,
  Clock,
  MapPin,
  Package,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Settings,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function VehicleShippingPage() {
  const [vehicles, setVehicles] = useState([])
  const [shippingRecords, setShippingRecords] = useState([])
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [shippingDialogOpen, setShippingDialogOpen] = useState(false)
  const [shippingFormData, setShippingFormData] = useState({
    status: "Not started",
    method: "",
    trackingNumber: "",
    expectedArrival: "",
    carrier: "",
    notes: "",
  })
  const [isUpdatingShipping, setIsUpdatingShipping] = useState(false)
  const [shippingUpdateError, setShippingUpdateError] = useState(null)
  const [shippingUpdateSuccess, setShippingUpdateSuccess] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const vehicleId = searchParams.get('vehicleId')

  useEffect(() => {
    if (vehicleId) {
      fetchVehicleDetails(vehicleId)
    } else {
      fetchVehicles()
    }
  }, [vehicleId])

  const fetchVehicles = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/vehicles')
      if (!response.ok) {
        throw new Error('Failed to fetch vehicles')
      }
      
      const data = await response.json()
      console.log('Fetched vehicles:', data.vehicles?.length || 0)
      setVehicles(data.vehicles || [])
      setIsLoading(false)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching vehicles:', err)
      setIsLoading(false)
    }
  }

  const fetchVehicleDetails = async (id) => {
    setIsLoading(true)
    try {
      // Fetch vehicle details
      const vehicleResponse = await fetch(`/api/admin/vehicles/${id}`)
      if (!vehicleResponse.ok) {
        throw new Error('Failed to fetch vehicle details')
      }
      
      const vehicleData = await vehicleResponse.json()
      
      // Fetch shipping history for this vehicle
      const shippingResponse = await fetch(`/api/admin/vehicles/${id}/shipping`)
      if (!shippingResponse.ok) {
        throw new Error('Failed to fetch shipping history')
      }
      
      const shippingData = await shippingResponse.json()
      
      console.log('Fetched vehicle:', vehicleData.vehicle)
      console.log('Fetched shipping records:', shippingData.shipping)
      
      setSelectedVehicle(vehicleData.vehicle)
      setShippingRecords(shippingData.shipping || [])
      
      // Set shipping form data based on the most recent shipping record
      if (shippingData.shipping && shippingData.shipping.length > 0) {
        const latestShipping = shippingData.shipping[0]  // Assuming sorted by newest first
        setShippingFormData({
          status: latestShipping.status || "Not started",
          method: latestShipping.method || "",
          trackingNumber: latestShipping.trackingNumber || "",
          expectedArrival: latestShipping.expectedArrival ? 
            new Date(latestShipping.expectedArrival).toISOString().split('T')[0] : "",
          carrier: latestShipping.carrier || "",
          notes: latestShipping.notes || "",
        })
      }
      
      setIsLoading(false)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching vehicle details:', err)
      setIsLoading(false)
    }
  }

  const filteredVehicles = vehicles.filter(vehicle => 
    (vehicle.make + ' ' + vehicle.model + ' ' + vehicle.year + ' ' + (vehicle.vin || '')).toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleShippingFormChange = (e) => {
    const { name, value } = e.target
    setShippingFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleShippingSubmit = async (e) => {
    e.preventDefault()
    setIsUpdatingShipping(true)
    setShippingUpdateError(null)
    setShippingUpdateSuccess(false)
    
    try {
      console.log('Sending shipping update for vehicle:', selectedVehicle._id)
      console.log('Shipping data:', shippingFormData)
      
      const response = await fetch(`/api/admin/vehicles/${selectedVehicle._id}/shipping`, {
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
      fetchVehicleDetails(selectedVehicle._id)
      
      setTimeout(() => {
        setShippingDialogOpen(false)
      }, 1500)
      
    } catch (err) {
      console.error('Error updating shipping info:', err)
      setShippingUpdateError(err.message)
    } finally {
      setIsUpdatingShipping(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Not started': return 'bg-gray-100 text-gray-800'
      case 'Preparing': return 'bg-blue-100 text-blue-800'
      case 'Shipped': return 'bg-purple-100 text-purple-800'
      case 'In transit': return 'bg-amber-100 text-amber-800'
      case 'Customs': return 'bg-cyan-100 text-cyan-800'
      case 'Delivered': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Format the date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return format(date, 'MMM dd, yyyy');
  };

  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return format(date, 'MMM dd, yyyy HH:mm');
  };

  if (vehicleId && selectedVehicle) {
    // Detail view for a specific vehicle
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/admin/dashboard/vehicles/shipping')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to All Vehicles
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push(`/admin/dashboard/vehicles/${selectedVehicle._id}`)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Vehicle
          </Button>
          
          <h1 className="text-2xl font-bold flex items-center">
            <Truck className="h-6 w-6 mr-2 text-primary" />
            Shipping Management: {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
          </h1>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">Shipping History</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle>Current Shipping Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Status</h3>
                        <div className="mt-1">
                          <Badge className={`text-sm px-3 py-1 ${getStatusColor(shippingRecords[0]?.status || 'Not started')}`}>
                            {shippingRecords[0]?.status || 'Not started'}
                          </Badge>
                        </div>
                      </div>
                      <Button onClick={() => setShippingDialogOpen(true)}>
                        Update Shipping Status
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Shipping Method</h3>
                        <p className="mt-1">{shippingRecords[0]?.method || 'N/A'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Carrier</h3>
                        <p className="mt-1">{shippingRecords[0]?.carrier || 'N/A'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Tracking Number</h3>
                        <p className="mt-1">{shippingRecords[0]?.trackingNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Expected Arrival</h3>
                        <p className="mt-1">{shippingRecords[0]?.expectedArrival ? formatDate(shippingRecords[0].expectedArrival) : 'N/A'}</p>
                      </div>
                    </div>
                    
                    {shippingRecords[0]?.notes && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                          <p className="mt-1 text-sm">{shippingRecords[0].notes}</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Vehicle Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Vehicle</h3>
                      <p className="mt-1">{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</p>
                    </div>
                    {selectedVehicle.vin && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">VIN</h3>
                        <p className="mt-1 font-mono text-xs">{selectedVehicle.vin}</p>
                      </div>
                    )}
                    {selectedVehicle.stockNumber && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Stock Number</h3>
                        <p className="mt-1">HSW-{selectedVehicle.stockNumber}</p>
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Customer</h3>
                      <p className="mt-1">{selectedVehicle.customerName || selectedVehicle.customer?.name || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button variant="outline" className="w-full" onClick={() => router.push(`/admin/dashboard/vehicles/${selectedVehicle._id}`)}>
                    View Full Vehicle Details
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Shipping Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {shippingRecords.length > 0 ? (
                  <div className="relative pl-6 border-l border-gray-200">
                    {shippingRecords.map((record, index) => (
                      <div key={record._id || index} className="mb-6 relative">
                        <div className="absolute -left-[25px] mt-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                          <Truck className="h-3 w-3" />
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <Badge className={`mb-2 ${getStatusColor(record.status)}`}>
                                {record.status}
                              </Badge>
                              <h3 className="font-medium">
                                {record.method ? `Via ${record.method}` : 'Status Updated'} 
                                {record.carrier ? ` • ${record.carrier}` : ''}
                              </h3>
                              {record.trackingNumber && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Tracking: {record.trackingNumber}
                                </p>
                              )}
                              {record.notes && (
                                <p className="text-sm mt-2 text-gray-700">{record.notes}</p>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDateTime(record.createdAt)}
                            </div>
                          </div>
                          {record.expectedArrival && (
                            <div className="mt-2 flex items-center text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-1" />
                              Expected arrival: {formatDate(record.expectedArrival)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No shipping history available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Shipping History</CardTitle>
                <CardDescription>Complete history of all shipping status updates</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Carrier</TableHead>
                      <TableHead>Tracking #</TableHead>
                      <TableHead>Expected Arrival</TableHead>
                      <TableHead>Updated By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shippingRecords.length > 0 ? (
                      shippingRecords.map((record, index) => (
                        <TableRow key={record._id || index}>
                          <TableCell>{formatDateTime(record.createdAt)}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(record.status)}>
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{record.method || 'N/A'}</TableCell>
                          <TableCell>{record.carrier || 'N/A'}</TableCell>
                          <TableCell>{record.trackingNumber || 'N/A'}</TableCell>
                          <TableCell>{record.expectedArrival ? formatDate(record.expectedArrival) : 'N/A'}</TableCell>
                          <TableCell>{record.updatedBy || 'N/A'}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                          No shipping history available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Documents</CardTitle>
                <CardDescription>Documents related to this shipment</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">Manage Shipping Documents</h3>
                <p className="text-sm text-gray-500 mb-6 text-center max-w-md">
                  View and manage all shipping-related documents for this vehicle including invoices, 
                  bills of lading, customs documents, and more.
                </p>
                <Button 
                  onClick={() => router.push(`/admin/dashboard/vehicles/documents/shipping?vehicleId=${selectedVehicle._id}`)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Go to Shipping Documents
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Update Shipping Dialog */}
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

  // List view for all vehicles
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vehicle Shipping Management</h1>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vehicles..."
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
            <CardTitle>Vehicles</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Stock Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Shipping Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.length > 0 ? (
                  filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle._id}>
                      <TableCell className="font-medium">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </TableCell>
                      <TableCell>{vehicle.stockNumber ? `HSW-${vehicle.stockNumber}` : 'N/A'}</TableCell>
                      <TableCell>{vehicle.customerName || vehicle.customer?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {vehicle.shipping?.status ? (
                          <Badge className={getStatusColor(vehicle.shipping.status)}>
                            {vehicle.shipping.status}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not started</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/admin/dashboard/vehicles/shipping?vehicleId=${vehicle._id}`)}
                        >
                          <Truck className="h-4 w-4 mr-2" />
                          Manage Shipping
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No vehicles found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}