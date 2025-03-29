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
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Trash, 
  Download, 
  Upload, 
  AlertCircle,
  ArrowLeft,
  FileText,
  Truck,
  Loader2,
  XCircle,
  CheckCircle2
} from "lucide-react"
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

export default function ShippingDocumentsPage() {
  const [documents, setDocuments] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [uploadingVehicleId, setUploadingVehicleId] = useState("")
  const [uploadingFile, setUploadingFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [successOperation, setSuccessOperation] = useState('upload')
  const [errorDialogOpen, setErrorDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const vehicleId = searchParams.get('vehicleId')

  // Fetch shipping documents
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true)
      try {
        // Build query URL with type filter
        let url = '/api/admin/vehicles/documents?type=shipping_document'
        if (vehicleId) {
          url += `&vehicleId=${vehicleId}`
        }
        
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error('Failed to fetch shipping documents')
        }
        
        const data = await response.json()
        console.log('Fetched shipping documents:', data.documents)
        setDocuments(data.documents || [])
      } catch (err) {
        setError(err.message)
        console.error('Error fetching shipping documents:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocuments()
  }, [vehicleId])

  // Fetch available vehicles for the dropdown
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch('/api/admin/vehicles')
        if (!response.ok) {
          throw new Error('Failed to fetch vehicles')
        }
        
        const data = await response.json()
        console.log('Fetched vehicles for dropdown:', data.vehicles?.length || 0)
        setVehicles(data.vehicles || [])
        
        // If vehicleId is in query params, set it as selected
        if (vehicleId) {
          setUploadingVehicleId(vehicleId)
        }
      } catch (err) {
        console.error('Error fetching vehicles:', err)
      }
    }

    fetchVehicles()
  }, [vehicleId])

  const filteredDocuments = documents.filter(doc => {
    // First apply search filter
    return (
      doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.originalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.vehicleId?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.vehicleInfo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadingFile(e.target.files[0])
      setUploadError(null)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    
    if (!uploadingFile) {
      setUploadError("Please select a file to upload")
      return
    }
    
    if (!uploadingVehicleId) {
      setUploadError("Please select a vehicle")
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', uploadingFile)
      formData.append('vehicleId', uploadingVehicleId)
      formData.append('documentType', 'shipping_document')
      
      console.log('Uploading document for vehicle:', uploadingVehicleId)
      
      const response = await fetch('/api/admin/vehicles/documents/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload shipping document')
      }
      
      const result = await response.json()
      console.log('Upload successful:', result)
      
      // Show success dialog
      setSuccessOperation('upload')
      setShowSuccessDialog(true)
      
      // Refresh document list
      const updatedResponse = await fetch('/api/admin/vehicles/documents?type=shipping_document')
      const updatedData = await updatedResponse.json()
      setDocuments(updatedData.documents || [])
      
      // Reset form state
      setUploadingFile(null)
      setIsDialogOpen(false)
      
      // Auto-close success message after 2 seconds
      setTimeout(() => {
        setShowSuccessDialog(false)
      }, 2000)
      
    } catch (err) {
      console.error('Error uploading shipping document:', err)
      setErrorMessage(err.message || 'Failed to upload document')
      setErrorDialogOpen(true)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteClick = (doc) => {
    setDocumentToDelete(doc)
    setDeleteDialogOpen(true)
  }
  
  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return
    
    setIsDeleting(true)
    
    try {
      const response = await fetch(`/api/admin/vehicles/documents/${documentToDelete._id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete document')
      }
      
      // Show success dialog
      setSuccessOperation('delete')
      setShowSuccessDialog(true)
      
      // Refresh documents list
      const updatedResponse = await fetch('/api/admin/vehicles/documents?type=shipping_document')
      const updatedData = await updatedResponse.json()
      setDocuments(updatedData.documents || [])
      
      // Close dialog
      setDeleteDialogOpen(false)
      
      // Auto-close success dialog after 2 seconds
      setTimeout(() => {
        setShowSuccessDialog(false)
      }, 2000)
      
    } catch (err) {
      console.error('Error deleting document:', err)
      setErrorMessage(err.message || 'Failed to delete document')
      setErrorDialogOpen(true)
      setDeleteDialogOpen(false)
    } finally {
      setIsDeleting(false)
      setDocumentToDelete(null)
    }
  }

  // Format the date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const SuccessDialog = () => (
    <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
      <DialogContent className="sm:max-w-[440px] p-0">
        <div className="p-6">
          <div className="flex items-center justify-center flex-col">
            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900 mb-2">
              {successOperation === 'upload' ? 'Document Uploaded' : 'Document Deleted'}
            </DialogTitle>
            <p className="text-sm text-gray-600 text-center">
              {successOperation === 'upload' 
                ? 'The shipping document has been successfully uploaded.' 
                : 'The shipping document has been successfully deleted.'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const ErrorDialog = () => (
    <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
      <DialogContent className="sm:max-w-[440px] p-0">
        <div className="p-6">
          <div className="flex items-center justify-center flex-col">
            <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900 mb-2">
              {successOperation === 'upload' ? 'Upload Failed' : 'Delete Failed'}
            </DialogTitle>
            <p className="text-sm text-gray-600 text-center">
              {errorMessage}
            </p>
          </div>
          <div className="mt-6">
            <Button 
              className="w-full" 
              onClick={() => setErrorDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/admin/dashboard/vehicles/documents')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to All Documents
          </Button>
          
          {vehicleId && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push(`/admin/dashboard/vehicles/${vehicleId}`)}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Vehicle
            </Button>
          )}
          
          <h1 className="text-2xl font-bold">
            {vehicleId ? 'Vehicle Shipping Documents' : 'All Shipping Documents'}
          </h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Shipping Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Upload Shipping Document</DialogTitle>
              <DialogDescription>
                Upload a shipping document for a vehicle
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpload} encType="multipart/form-data">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="vehicleId" className="text-right">
                    Vehicle
                  </Label>
                  <select
                    id="vehicleId"
                    name="vehicleId"
                    value={uploadingVehicleId || ""}
                    onChange={(e) => setUploadingVehicleId(e.target.value)}
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="">Select a vehicle</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle._id} value={vehicle._id}>
                        {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.stockNumber ? `(HSW-${vehicle.stockNumber})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="file" className="text-right">
                    Document File
                  </Label>
                  <Input
                    id="file"
                    name="file"
                    type="file"
                    className="col-span-3"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    required
                  />
                </div>
                {uploadError && (
                  <div className="col-span-4 text-red-500 text-sm flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {uploadError}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setUploadingFile(null);
                    setUploadError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search shipping documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Error loading shipping documents: {error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading shipping documents...</span>
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Shipping Documents</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Name</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc) => (
                    <TableRow key={doc._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Truck className="h-4 w-4 mr-2 text-purple-500" />
                          {doc.originalName || doc.name}
                        </div>
                      </TableCell>
                      <TableCell>{doc.vehicleInfo || `Vehicle #${doc.vehicleId}`}</TableCell>
                      <TableCell>{doc.customerName || 'N/A'}</TableCell>
                      <TableCell>{formatDate(doc.createdAt || doc.uploadedAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => window.open(doc.url, '_blank')}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(doc.url, '_blank')}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(doc)}
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
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No shipping documents found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setDocumentToDelete(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[440px] p-0">
          <div className="border-b border-gray-200">
            <DialogHeader className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold text-gray-900">
                    Delete Shipping Document
                  </DialogTitle>
                  <p className="mt-1 text-sm text-gray-500">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete this shipping document?
              </p>
              {documentToDelete && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    {documentToDelete.originalName || documentToDelete.name}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 text-gray-700 hover:text-gray-900"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setDocumentToDelete(null);
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-500"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Deleting...
                  </div>
                ) : (
                  'Delete Document'
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success and Error Dialogs */}
      <SuccessDialog />
      <ErrorDialog />
    </div>
  )
}
