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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  FileText,
  Download,
  Eye,
  MoreHorizontal,
  Search,
  FileCheck,
  Receipt,
  FileWarning,
  Filter,
  ArrowUpDown,
  FileDown,
  Printer,
  AlertCircle,
  RefreshCw,
  Calendar,
  X,
  Image as ImageIcon
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState("")
  const [invoices, setInvoices] = useState([])
  const [documents, setDocuments] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDocumentsLoading, setIsDocumentsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [sortConfig, setSortConfig] = useState(null)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [previewDoc, setPreviewDoc] = useState(null)
  const [previewError, setPreviewError] = useState(false)
  const [filters, setFilters] = useState({
    documentType: [],
    status: [],
    category: []
  })
  const [activeTab, setActiveTab] = useState("all-documents")

  // Fetch documents from API and parse them as invoices when applicable
  useEffect(() => {
    const fetchInvoices = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Get documents from the API
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/customer/documents/all?t=${timestamp}`, {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Documents/Invoices API response:", data);
        
        if (data.success && Array.isArray(data.documents)) {
          // Filter for invoice documents
          const invoiceDocs = data.documents
            .filter(doc => 
              doc.category === 'invoice' || 
              doc.name?.toLowerCase().includes('invoice') ||
              doc.name?.toLowerCase().includes('receipt')
            )
            .map(doc => ({
              id: doc.cloudinaryId || doc._id || `DOC-${Math.random().toString(36).substr(2, 9)}`,
              documentType: 'invoice',
              carName: doc.vehicleDetails?.make && doc.vehicleDetails?.model 
                ? `${doc.vehicleDetails.make} ${doc.vehicleDetails.model}`
                : doc.vehicleId ? `Vehicle: ${doc.vehicleId.substr(0, 8)}...` : 'Unknown',
              dateIssued: doc.dateAdded || doc.uploadedAt || new Date().toISOString(),
              amount: doc.amount || 0, // If your documents have amount data
              status: doc.status || 'processed',
              documentUrl: doc.url || doc.secure_url,
              cloudinaryId: doc.cloudinaryId,
              originalDocument: doc // Store the original document data for reference
            }));
          
          setInvoices(invoiceDocs);
          console.log(`Found ${invoiceDocs.length} invoice documents`);
          
          if (invoiceDocs.length === 0) {
            console.log("No invoice documents found");
          }
        } else {
          console.log("Document API returned no documents or error:", data.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching invoice documents:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInvoices();
  }, []);

  // Fetch all documents from Cloudinary
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsDocumentsLoading(true);
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/customer/documents/all?t=${timestamp}`, {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Documents API response:", data);
        
        if (data.success && Array.isArray(data.documents)) {
          setDocuments(data.documents);
          
          if (data.documents.length > 0) {
            console.log(`Found ${data.documents.length} documents`);
          } else {
            console.log("No documents found");
          }
        } else {
          console.log("Document API returned no documents or error:", data.message);
        }
      } catch (err) {
        console.error("Error fetching documents:", err);
        toast({
          title: "Error loading documents",
          description: err.message || "Could not load document list",
          variant: "destructive"
        });
      } finally {
        setIsDocumentsLoading(false);
      }
    };
    
    fetchDocuments();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filters])

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'processed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'invoice': return <Receipt className="h-4 w-4" />
      case 'registration': return <FileCheck className="h-4 w-4" />
      case 'insurance': return <FileWarning className="h-4 w-4" />
      case 'maintenance': return <FileText className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  // Get document icon by category with color
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
        return <div className={`${iconClasses} ${color}`}><ImageIcon className="h-6 w-6" /></div>;
      default:
        return <div className={`${iconClasses} ${color}`}><FileText className="h-6 w-6" /></div>;
    }
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return 'Unknown size';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    if (i === 0) return `${bytes} ${sizes[i]}`;
    return `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`;
  }

  // Format date
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

  // Function to group documents by category
  const groupDocumentsByCategory = (docs) => {
    if (!docs || !Array.isArray(docs)) return [];
    
    const grouped = docs.reduce((acc, doc) => {
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
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  // Function to extract file type from filename
  const getFileTypeFromName = (fileName) => {
    if (!fileName) return '';
    const extension = fileName.split('.').pop();
    return extension || '';
  };

  // Sorting
  const sortedInvoices = [...invoices].sort((a, b) => {
    if (!sortConfig) return 0
    const { key, direction } = sortConfig
    
    // Handle undefined values
    const aValue = a[key] ?? '';
    const bValue = b[key] ?? '';
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1
    if (aValue > bValue) return direction === 'asc' ? 1 : -1
    return 0
  })

  // Filtering for invoices
  const filteredInvoices = sortedInvoices.filter(invoice => {
    const matchesSearch = 
      (invoice.carName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (invoice.id?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    
    const matchesDocType = 
      filters.documentType.length === 0 || 
      filters.documentType.includes(invoice.documentType)
    
    const matchesStatus = 
      filters.status.length === 0 || 
      filters.status.includes(invoice.status)

    return matchesSearch && matchesDocType && matchesStatus
  })

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      (doc.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (doc.cloudinaryId?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    
    const matchesCategory = 
      filters.category.length === 0 || 
      filters.category.includes(doc.category)

    return matchesSearch && matchesCategory
  })

  // Pagination for invoices
  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex)

  // Group documents by each category for individual tabs
  const categorizedDocuments = {
    'invoice': documents.filter(doc => doc.category === 'invoice'),
    'purchase_agreement': documents.filter(doc => doc.category === 'purchase_agreement'),
    'customs_document': documents.filter(doc => doc.category === 'customs_document'),
    'shipping_document': documents.filter(doc => doc.category === 'shipping_document'),
    'other': documents.filter(doc => doc.category === 'other' || !doc.category)
  }

  const downloadDocument = async (doc, e) => {
    if (e) e.stopPropagation()
    
    try {
      // Handle different document types
      if (doc.documentUrl) {
        // For sample invoices that already have a URL
        window.open(doc.documentUrl, '_blank');
        return;
      }
      
      if (doc.url) {
        // If the document already has a URL from Cloudinary
        window.open(doc.url, '_blank');
        
        toast({
          title: "Download started",
          description: `Downloading ${doc.name}`
        });
        return;
      }
      
      if (doc.cloudinaryId) {
        // Determine resource type - use either what's in the doc or guess from extension
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
      
      // If we don't have any way to download
      throw new Error('Document has no URL or Cloudinary ID');
    } catch (err) {
      console.error('Error downloading document:', err);
      toast({
        title: "Download failed",
        description: err.message || "Could not download the document.",
        variant: "destructive"
      });
    }
  }

  const handlePreviewError = () => {
    setPreviewError(true)
  }

  const openPreview = (doc) => {
    setPreviewDoc(doc);
  }

  const closePreview = () => {
    setPreviewDoc(null);
  }

  const exportToCSV = () => {
    try {
      // Define CSV headers
      const headers = [
        'ID',
        'Document Type',
        'Car',
        'Date Issued',
        'Due Date',
        'Amount',
        'Status'
      ].join(',')

      // Convert invoice data to CSV rows
      const csvRows = filteredInvoices.map(invoice => {
        return [
          invoice.id,
          invoice.documentType,
          invoice.carName,
          new Date(invoice.dateIssued).toLocaleDateString(),
          invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '',
          invoice.amount.toLocaleString(),
          invoice.status
        ].join(',')
      })

      // Combine headers and rows
      const csvContent = [headers, ...csvRows].join('\n')

      // Create blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `invoices_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Error exporting to CSV:', err)
      alert('Failed to export data. Please try again.')
    }
  }

  // Add this new function to format file names for display
  const getDisplayName = (doc) => {
    // If there's an original file name stored, use that
    if (doc.originalName) return doc.originalName;
    
    // If there's a proper name already, use it
    if (doc.name && !doc.name.match(/^[a-z0-9]{20,}$/i)) return doc.name;
    
    // Try to extract a better name from cloudinaryId path
    if (doc.cloudinaryId) {
      // Get the last part of the path and remove any random IDs
      const pathParts = doc.cloudinaryId.split('/');
      const filename = pathParts[pathParts.length - 1];
      
      // If filename has extension, clean it up
      if (filename.includes('.')) {
        // Remove any random IDs and keep just meaningful parts
        const cleanName = filename.replace(/[a-z0-9]{20,}/i, '');
        if (cleanName && cleanName !== '.') return cleanName;
      }
      
      // If no good filename found, create one with the category
      if (doc.category) {
        const extension = getFileTypeFromName(filename);
        return `${formatCategoryName(doc.category)} Document${extension ? '.' + extension : ''}`;
      }
    }
    
    // Fallback - create a descriptive name based on document type or category
    const category = doc.category || 'document';
    const type = getFileTypeFromName(doc.name || '');
    return `${formatCategoryName(category)}${type ? '.' + type : ''}`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Documents & Invoices</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={async () => {
              setIsDocumentsLoading(true);
              try {
                const timestamp = new Date().getTime();
                const response = await fetch(`/api/customer/documents/all?t=${timestamp}`, {
                  credentials: 'include',
                  headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                  }
                });
                
                const data = await response.json();
                console.log("Documents refresh response:", data);
                
                if (data.success && Array.isArray(data.documents)) {
                  setDocuments(data.documents);
                  
                  toast({
                    title: `${data.documents.length} Documents found`,
                    description: "Document list has been refreshed"
                  });
                } else {
                  toast({
                    title: "No documents found",
                    description: data.message || "Could not find any documents"
                  });
                }
              } catch (err) {
                console.error("Error refreshing documents:", err);
                toast({
                  title: "Error refreshing",
                  description: "Could not refresh document list",
                  variant: "destructive"
                });
              } finally {
                setIsDocumentsLoading(false);
              }
            }}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isDocumentsLoading ? 'animate-spin' : ''}`} />
            Refresh Documents
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Document Category</DropdownMenuLabel>
              {['purchase_agreement', 'invoice', 'customs_document', 'shipping_document', 'other'].map(category => (
                <DropdownMenuCheckboxItem
                  key={category}
                  checked={filters.category.includes(category)}
                  onCheckedChange={(checked) => {
                    setFilters(prev => ({
                      ...prev,
                      category: checked
                        ? [...prev.category, category]
                        : prev.category.filter(c => c !== category)
                    }))
                  }}
                >
                  {formatCategoryName(category)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileDown className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToCSV}>
                <FileText className="h-4 w-4 mr-2" />
                Export to CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Tabs defaultValue="all-documents" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="all-documents">All Documents</TabsTrigger>
          <TabsTrigger value="invoice">Invoice Documents</TabsTrigger>
          <TabsTrigger value="purchase_agreement">Purchase Agreements</TabsTrigger>
          <TabsTrigger value="customs_document">Customs Documents</TabsTrigger>
          <TabsTrigger value="shipping_document">Shipping Documents</TabsTrigger>
          <TabsTrigger value="other">Other Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="all-documents">
          {isDocumentsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-2">Loading documents...</span>
            </div>
          ) : filteredDocuments.length > 0 ? (
            <div className="space-y-6">
              {groupDocumentsByCategory(filteredDocuments).map(([category, docs]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle>{formatCategoryName(category)}</CardTitle>
                    <CardDescription>
                      {docs.length} document{docs.length !== 1 ? 's' : ''} found
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {docs.map((doc, index) => (
                        <div 
                          key={index} 
                          className="flex justify-between items-center p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center">
                            {getDocumentIconWithCategoryColor(doc.type || getFileTypeFromName(doc.name), doc.category)}
                            <div className="ml-3">
                              <p className="font-medium text-gray-900">{getDisplayName(doc)}</p>
                              <div className="flex flex-wrap items-center text-sm text-gray-500 mt-1">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                <span className="mr-3">{formatDate(doc.dateAdded || doc.uploadedAt)}</span>
                                {doc.fileSize && (
                                  <span className="mr-3">{formatFileSize(doc.fileSize)}</span>
                                )}
                                {doc.vehicleId && (
                                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded mr-3">
                                    Vehicle: {doc.vehicleId.substring(0, 8)}...
                                  </span>
                                )}
                                {doc.cloudinaryId && (
                                  <span className="text-xs text-gray-400 mr-3">
                                    ID: {doc.cloudinaryId.split('/').pop().substring(0, 12)}...
                                  </span>
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
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents available</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {searchTerm || filters.category.length > 0 ? 
                  "No documents match your search criteria. Try adjusting your filters." : 
                  "Documents will be added as they become available during the purchase and shipping process."}
              </p>
              {(searchTerm || filters.category.length > 0) && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setFilters(prev => ({...prev, category: []}));
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        {/* Individual Category Tabs */}
        {['invoice', 'purchase_agreement', 'customs_document', 'shipping_document', 'other'].map((category) => (
          <TabsContent key={category} value={category}>
            {isDocumentsLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-2">Loading {formatCategoryName(category)}...</span>
              </div>
            ) : categorizedDocuments[category].length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>{formatCategoryName(category)}</CardTitle>
                  <CardDescription>
                    {categorizedDocuments[category].length} document{categorizedDocuments[category].length !== 1 ? 's' : ''} found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categorizedDocuments[category].map((doc, index) => (
                      <div 
                        key={index} 
                        className="flex justify-between items-center p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center">
                          {getDocumentIconWithCategoryColor(doc.type || getFileTypeFromName(doc.name), doc.category)}
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">{getDisplayName(doc)}</p>
                            <div className="flex flex-wrap items-center text-sm text-gray-500 mt-1">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              <span className="mr-3">{formatDate(doc.dateAdded || doc.uploadedAt)}</span>
                              {doc.fileSize && (
                                <span className="mr-3">{formatFileSize(doc.fileSize)}</span>
                              )}
                              {doc.vehicleId && (
                                <span className="text-xs bg-gray-200 px-2 py-0.5 rounded mr-3">
                                  Vehicle: {doc.vehicleId.substring(0, 8)}...
                                </span>
                              )}
                              {doc.cloudinaryId && (
                                <span className="text-xs text-gray-400 mr-3">
                                  ID: {doc.cloudinaryId.split('/').pop().substring(0, 12)}...
                                </span>
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
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No {formatCategoryName(category)} available</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  {searchTerm ? 
                    `No ${formatCategoryName(category)} match your search criteria.` : 
                    `${formatCategoryName(category)} will be added as they become available during the purchase and shipping process.`}
                </p>
                {searchTerm && (
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchTerm('')}
                  >
                    Clear search
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={!!selectedDocument} onOpenChange={(open) => {
        if (!open) {
          setSelectedDocument(null)
          setPreviewError(false)
        }
      }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
            <DialogDescription>
              {selectedDocument ? getDisplayName(selectedDocument) : 'Document'} 
              {selectedDocument?.carName ? ` for ${selectedDocument.carName}` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {previewError ? (
              <div className="border rounded-md p-8 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Preview not available</h3>
                <p className="text-gray-500 mb-4">
                  The document preview could not be loaded. You can download the document instead.
                </p>
                <Button onClick={(e) => selectedDocument && downloadDocument(selectedDocument, e)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Document
                </Button>
              </div>
            ) : (
              <iframe
                src={selectedDocument?.documentUrl}
                className="w-full h-[600px] border rounded"
                title="Document Preview"
                onError={handlePreviewError}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

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
              src={previewDoc.url || previewDoc.secure_url}
              alt={previewDoc.name}
              width={800}
              height={600}
              className="max-h-[90vh] max-w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}
