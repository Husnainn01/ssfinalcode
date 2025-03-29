"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  File
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

export default function OtherDocumentsPage() {
  const [documents, setDocuments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [uploadingVehicleId, setUploadingVehicleId] = useState(null)
  const [uploadingDocumentName, setUploadingDocumentName] = useState("")
  const [uploadingFile, setUploadingFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/admin/vehicles/documents?type=other')
        if (!response.ok) {
          throw new Error('Failed to fetch other documents')
        }
        const data = await response.json()
        setDocuments(data.documents)
      } catch (err) {
        setError(err.message)
        console.error('Error fetching other documents:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocuments()
  }, [])

  const filteredDocuments = documents.filter(doc => 
    doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.vehicleId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.vehicleInfo?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this document?")) {
      try {
        const response = await fetch(`/api/admin/vehicles/documents/${id}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          throw new Error('Failed to delete document')
        }
        
        // Remove the document from the state
        setDocuments(documents.filter(doc => doc.id !== id))
      } catch (err) {
        console.error('Error deleting document:', err)
        alert('Failed to delete document')
      }
    }
  }

  const handleFileChange = (e) => {
    setUploadingFile(e.target.files[0])
    setUploadError(null)
  }

  const handleUpload = async () => {
    if (!uploadingFile || !uploadingVehicleId || !uploadingDocumentName) {
      setUploadError("Please select a vehicle, enter a document name, and select a file")
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', uploadingFile)
      formData.append('vehicleId', uploadingVehicleId)
      formData.append('type', 'other')
      formData.append('name', uploadingDocumentName)
      
      const response = await fetch('/api/admin/vehicles/documents/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to upload document')
      }
      
      const result = await response.json()
      
      // Add the new document to the state
      setDocuments([...documents, result.document])
      
      // Reset the form
      setUploadingFile(null)
      setUploadingDocumentName("")
      
      // Close the dialog
      document.getElementById('closeUploadDialog').click()
    } catch (err) {
      setUploadError(err.message)
      console.error('Error uploading document:', err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/admin/dashboard/vehicles/documents')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to All Documents
          </Button>
          <h1 className="text-2xl font-bold">Other Documents</h1>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Upload Other Document</DialogTitle>
              <DialogDescription>
                Upload a miscellaneous document for a customer vehicle
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="vehicleId" className="text-right">
                  Vehicle
                </Label>
                <select
                  id="vehicleId"
                  value={uploadingVehicleId || ""}
                  onChange={(e) => setUploadingVehicleId(e.target.value)}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select a vehicle</option>
                  {/* This would be populated from an API call */}
                  <option value="vehicle1">2023 Toyota Supra - John Doe</option>
                  <option value="vehicle2">2022 Honda Civic - Jane Smith</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="documentName" className="text-right">
                  Document Name
                </Label>
                <Input
                  id="documentName"
                  value={uploadingDocumentName}
                  onChange={(e) => setUploadingDocumentName(e.target.value)}
                  placeholder="e.g., Registration Certificate"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file" className="text-right">
                  Document File
                </Label>
                <Input
                  id="file"
                  type="file"
                  className="col-span-3"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>
              {uploadError && (
                <div className="col-span-4 text-red-500 text-sm">
                  {uploadError}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button id="closeUploadDialog" variant="outline" type="button">
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-current rounded-full"></div>
                    Uploading...
                  </>
                ) : (
                  "Upload Document"
                )}
              </Button>
            </DialogFooter>
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
            <CardTitle>Other Documents</CardTitle>
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
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-purple-500" />
                          {doc.name}
                        </div>
                      </TableCell>
                      <TableCell>{doc.vehicleInfo}</TableCell>
                      <TableCell>{doc.customerName}</TableCell>
                      <TableCell>{new Date(doc.uploadedAt).toLocaleDateString()}</TableCell>
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
                              onClick={() => handleDelete(doc.id)}
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
                      No other documents found
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