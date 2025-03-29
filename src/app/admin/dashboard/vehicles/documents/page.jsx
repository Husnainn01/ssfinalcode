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
  Edit, 
  Trash, 
  Download, 
  Upload, 
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  XCircle
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from 'react-hot-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function VehicleDocumentsPage() {
  const [documents, setDocuments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [uploadingVehicleId, setUploadingVehicleId] = useState(null)
  const [uploadingDocumentType, setUploadingDocumentType] = useState("")
  const [uploadingFile, setUploadingFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [activeTab, setActiveTab] = useState("all")
  const router = useRouter()
  const searchParams = useSearchParams()
  const vehicleId = searchParams.get('vehicleId')
  const [vehicles, setVehicles] = useState([])
  const [uploadingCustomerId, setUploadingCustomerId] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState(null)
  const [openDropdownId, setOpenDropdownId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorDialogOpen, setErrorDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successOperation, setSuccessOperation] = useState('')

  const fetchDocuments = async () => {
    setIsLoading(true)
    try {
      let url = '/api/admin/vehicles/documents'
      if (vehicleId) {
        url += `?vehicleId=${vehicleId}`
        console.log("Fetching documents for vehicle:", vehicleId)
      }
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }
      const data = await response.json()
      setDocuments(data.documents)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching documents:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [vehicleId])

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch('/api/admin/vehicles')
        if (!response.ok) throw new Error('Failed to fetch vehicles')
        const data = await response.json()
        setVehicles(data.vehicles || [])
      } catch (err) {
        console.error('Error fetching vehicles:', err)
      }
    }

    fetchVehicles()
  }, [])

  useEffect(() => {
    if (vehicleId) {
      setUploadingVehicleId(vehicleId)
    }
  }, [vehicleId])

  const filteredDocuments = documents.filter(doc => {
    // First apply search filter
    const matchesSearch = 
      doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.vehicleId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.vehicleInfo?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Then apply tab filter
    if (activeTab === "all") return matchesSearch
    return matchesSearch && doc.type === activeTab
  })

  // Format the vehicle info for display
  const formatVehicleInfo = (doc) => {
    if (!doc) return 'N/A';
    
    // Check if vehicleId is populated object or just an ID
    const vehicle = doc.vehicleId || {};
    const stockNumber = vehicle.stockNumber ? `(HSW-${vehicle.stockNumber})` : '';
    
    // If we have make/model directly in the document
    if (doc.vehicleInfo) {
      return doc.vehicleInfo;
    }
    
    // If we have populated vehicle data
    if (vehicle.make && vehicle.model) {
      return `${vehicle.year || ''} ${vehicle.make} ${vehicle.model} ${stockNumber}`.trim();
    }
    
    return 'N/A';
  };

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

  const handleFileChange = (e) => {
    setUploadingFile(e.target.files[0])
    setUploadError(null)
  }

  const handleFileUpload = async (e) => {
    e.preventDefault();
    console.log("Upload form submitted");
    
    try {
      const form = e.target;
      const formData = new FormData(form);
      
      // Log form data for debugging
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value instanceof File ? value.name : value}`);
      }
      
      setIsUploading(true);
      
      const response = await fetch('/api/admin/vehicles/documents/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      console.log("Response status:", response.status);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }
      
      // Success handling
      setSuccessOperation('upload');
      setShowSuccessDialog(true);
      setIsDialogOpen(false);
      
      // Reset form and state
      form.reset();
      setUploadingFile(null);
      setUploadingDocumentType("");
      
      // Refresh document list
      await fetchDocuments();
      
      // Auto-hide success message
      setTimeout(() => {
        setShowSuccessDialog(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error uploading document:', error);
      setErrorMessage(error.message || 'Failed to upload document');
      setErrorDialogOpen(true);
    } finally {
      setIsUploading(false);
    }
  };

  const documentTypes = [
    { value: "invoice", label: "Invoice" },
    { value: "purchase_agreement", label: "Purchase Agreement" },
    { value: "shipping_document", label: "Shipping Document" },
    { value: "customs_document", label: "Customs Document" },
    { value: "other", label: "Other" }
  ]

  const handleDeleteClick = (doc) => {
    setDocumentToDelete(doc)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/admin/vehicles/documents/${documentToDelete._id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete document');
      }

      // Set operation type to 'delete' before showing success dialog
      setSuccessOperation('delete');
      
      // Close delete dialog first
      setDeleteDialogOpen(false);
      
      // Show success dialog
      setShowSuccessDialog(true);
      
      // Refresh documents list
      await fetchDocuments();
      
      // Close success dialog after delay
      setTimeout(() => {
        setShowSuccessDialog(false);
      }, 2000);

    } catch (error) {
      console.error('Error deleting document:', error);
      setErrorMessage(error.message || 'Failed to delete document');
      setDeleteDialogOpen(false);
      setErrorDialogOpen(true);
    } finally {
      setIsDeleting(false);
      setDocumentToDelete(null);
    }
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
                ? 'The document has been successfully uploaded.' 
                : 'The document has been successfully deleted.'}
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
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">
            {vehicleId ? `Documents for Vehicle #${vehicleId}` : 'All Vehicle Documents'}
          </h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Vehicle Document</DialogTitle>
              <DialogDescription>
                Upload a document for vehicle #{vehicleId}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleFileUpload} encType="multipart/form-data">
              <div className="grid gap-4 py-4">
                {!vehicleId && (
                  <div className="grid gap-2">
                    <Label htmlFor="vehicleId">Vehicle</Label>
                    <select
                      id="vehicleId"
                      name="vehicleId"
                      value={uploadingVehicleId || ""}
                      onChange={(e) => setUploadingVehicleId(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                    >
                      <option value="">Select a vehicle</option>
                      {vehicles.map((vehicle) => (
                        <option key={vehicle._id} value={vehicle._id}>
                          {vehicle.year} {vehicle.make} {vehicle.model} - #{vehicle.stockNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {vehicleId && (
                  <input type="hidden" name="vehicleId" value={vehicleId} />
                )}

                <div className="grid gap-2">
                  <Label htmlFor="documentType">Document Type</Label>
                  <select
                    id="documentType"
                    name="documentType"
                    value={uploadingDocumentType}
                    onChange={(e) => setUploadingDocumentType(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select type</option>
                    {documentTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="file">File</Label>
                  <Input
                    id="file"
                    name="file"
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: PDF, DOC, DOCX, PNG, JPG
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setUploadingFile(null);
                    setUploadingDocumentType("");
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
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="invoice">Invoices</TabsTrigger>
          <TabsTrigger value="purchase_agreement">Purchase Agreements</TabsTrigger>
          <TabsTrigger value="shipping_document">Shipping</TabsTrigger>
          <TabsTrigger value="customs_document">Customs</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>
      </Tabs>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Error loading documents: {error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading documents...</span>
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Document List</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Name</TableHead>
                  <TableHead>Type</TableHead>
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
                        {doc.originalName || doc.name}
                      </TableCell>
                      <TableCell>
                        <Badge className="capitalize">
                          {doc.type.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatVehicleInfo(doc)}</TableCell>
                      <TableCell>{doc.customerName || 'N/A'}</TableCell>
                      <TableCell>
                        {formatDate(doc.createdAt || doc.uploadedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu open={openDropdownId === doc._id} onOpenChange={(open) => {
                          setOpenDropdownId(open ? doc._id : null);
                        }}>
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
                              onClick={() => {
                                handleDeleteClick(doc);
                                setOpenDropdownId(null);
                              }}
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
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No documents found
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
            setOpenDropdownId(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[440px] p-0">
          <div className="border-b border-gray-200">
            <DialogHeader className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold text-gray-900">
                    Delete Document
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
                Are you sure you want to delete this document?
              </p>
              {documentToDelete && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    {documentToDelete.originalName || documentToDelete.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Type: {documentToDelete.type?.replace(/_/g, ' ')}
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

      {/* Updated Success Dialog */}
      <SuccessDialog />
      <ErrorDialog />
    </div>
  )
} 