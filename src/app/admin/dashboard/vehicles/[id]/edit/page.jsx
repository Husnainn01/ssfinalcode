"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, AlertCircle } from "lucide-react"

export default function EditVehiclePage() {
  const router = useRouter()
  const params = useParams()
  const vehicleId = params.id
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [customers, setCustomers] = useState([])
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    price: "",
    status: "pending",
    customerId: "",
    estimatedDelivery: "",
    notes: ""
  })
  
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await fetch(`/api/admin/vehicles/${vehicleId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch vehicle')
        }
        
        const data = await response.json()
        if (data.success) {
          // Format date for input field
          let estimatedDelivery = ""
          if (data.vehicle.estimatedDelivery) {
            const date = new Date(data.vehicle.estimatedDelivery)
            estimatedDelivery = date.toISOString().split('T')[0]
          }
          
          setFormData({
            make: data.vehicle.make || "",
            model: data.vehicle.model || "",
            year: data.vehicle.year || "",
            price: data.vehicle.price || "",
            status: data.vehicle.status || "pending",
            customerId: data.vehicle.customerId || "",
            estimatedDelivery: estimatedDelivery,
            notes: data.vehicle.notes || ""
          })
        } else {
          throw new Error(data.message || 'Failed to load vehicle')
        }
      } catch (err) {
        setError(err.message)
        console.error('Error fetching vehicle:', err)
      }
    }
    
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/admin/customers')
        if (!response.ok) {
          throw new Error('Failed to fetch customers')
        }
        
        const data = await response.json()
        if (data.success) {
          setCustomers(data.customers || [])
        } else {
          throw new Error(data.message || 'Failed to load customers')
        }
      } catch (err) {
        console.error('Error fetching customers:', err)
        // Don't set error state here to avoid blocking the form
      }
    }
    
    Promise.all([fetchVehicle(), fetchCustomers()])
      .finally(() => setIsLoading(false))
  }, [vehicleId])
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/admin/vehicles/${vehicleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to update vehicle')
      }
      
      const data = await response.json()
      
      if (data.success) {
        alert('Vehicle updated successfully')
        router.push(`/admin/dashboard/vehicles/${vehicleId}`)
      } else {
        throw new Error(data.message || 'Failed to update vehicle')
      }
    } catch (err) {
      setError(err.message)
      console.error('Error updating vehicle:', err)
    } finally {
      setIsSaving(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading vehicle details...</span>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Edit Vehicle</h1>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Make</Label>
                <Input 
                  id="make" 
                  name="make" 
                  value={formData.make} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input 
                  id="model" 
                  name="model" 
                  value={formData.model} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input 
                  id="year" 
                  name="year" 
                  type="number" 
                  value={formData.year} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input 
                  id="price" 
                  name="price" 
                  type="number" 
                  value={formData.price} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipping">Shipping</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="estimatedDelivery">Estimated Delivery Date</Label>
                <Input 
                  id="estimatedDelivery" 
                  name="estimatedDelivery" 
                  type="date" 
                  value={formData.estimatedDelivery} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="customerId">Customer</Label>
                <Select 
                  value={formData.customerId || ""} 
                  onValueChange={(value) => handleSelectChange('customerId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Customer</SelectItem>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} ({customer.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleChange} 
                  rows={4} 
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
} 