// "use client"

// import { useState } from "react"
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuTrigger,
//   DropdownMenuSeparator,
//   DropdownMenuCheckboxItem,
// } from "@/components/ui/dropdown-menu"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import {
//   FileText,
//   Download,
//   Eye,
//   MoreHorizontal,
//   Search,
//   FileCheck,
//   Receipt,
//   FileWarning,
//   Filter,
//   ArrowUpDown,
//   FileDown,
//   Printer,
//   X
// } from "lucide-react"
// import { Badge } from "@/components/ui/badge"
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"

// interface Invoice {
//   id: string
//   documentType: 'invoice' | 'registration' | 'insurance' | 'maintenance'
//   carName: string
//   dateIssued: string
//   dueDate?: string
//   amount: number
//   status: 'paid' | 'pending' | 'overdue' | 'processed'
//   documentUrl: string
// }

// const initialInvoices: Invoice[] = [
//   {
//     id: "INV-001",
//     documentType: "invoice",
//     carName: "Mercedes-Benz C-Class",
//     dateIssued: "2024-01-15",
//     dueDate: "2024-02-15",
//     amount: 45000,
//     status: "paid",
//     documentUrl: "/documents/inv-001.pdf"
//   },
//   {
//     id: "REG-001",
//     documentType: "registration",
//     carName: "Mercedes-Benz C-Class",
//     dateIssued: "2024-01-10",
//     amount: 500,
//     status: "processed",
//     documentUrl: "/documents/reg-001.pdf"
//   },
//   {
//     id: "INS-001",
//     documentType: "insurance",
//     carName: "BMW X5",
//     dateIssued: "2024-01-01",
//     dueDate: "2024-12-31",
//     amount: 1200,
//     status: "paid",
//     documentUrl: "/documents/ins-001.pdf"
//   },
//   {
//     id: "MAIN-001",
//     documentType: "maintenance",
//     carName: "BMW X5",
//     dateIssued: "2024-01-20",
//     amount: 350,
//     status: "pending",
//     documentUrl: "/documents/main-001.pdf"
//   }
// ]

// export default function Invoices() {
//   const [searchTerm, setSearchTerm] = useState("")
//   const [invoices] = useState<Invoice[]>(initialInvoices)
//   const [currentPage, setCurrentPage] = useState(1)
//   const [itemsPerPage, setItemsPerPage] = useState(5)
//   const [sortConfig, setSortConfig] = useState<{
//     key: keyof Invoice
//     direction: 'asc' | 'desc'
//   } | null>(null)
//   const [selectedDocument, setSelectedDocument] = useState<Invoice | null>(null)
//   const [filters, setFilters] = useState({
//     documentType: [] as Invoice['documentType'][],
//     status: [] as Invoice['status'][]
//   })

//   const handleSort = (key: keyof Invoice) => {
//     setSortConfig(current => ({
//       key,
//       direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
//     }))
//   }

//   const getStatusColor = (status: Invoice['status']) => {
//     switch (status) {
//       case 'paid': return 'bg-green-100 text-green-800'
//       case 'pending': return 'bg-yellow-100 text-yellow-800'
//       case 'overdue': return 'bg-red-100 text-red-800'
//       case 'processed': return 'bg-blue-100 text-blue-800'
//       default: return ''
//     }
//   }

//   const getDocumentIcon = (type: Invoice['documentType']) => {
//     switch (type) {
//       case 'invoice': return <Receipt className="h-4 w-4" />
//       case 'registration': return <FileCheck className="h-4 w-4" />
//       case 'insurance': return <FileWarning className="h-4 w-4" />
//       case 'maintenance': return <FileText className="h-4 w-4" />
//     }
//   }

//   // Sorting
//   const sortedInvoices = [...invoices].sort((a, b) => {
//     if (!sortConfig) return 0
//     const { key, direction } = sortConfig
//     if (a[key] < b[key]) return direction === 'asc' ? -1 : 1
//     if (a[key] > b[key]) return direction === 'asc' ? 1 : -1
//     return 0
//   })

//   // Filtering
//   const filteredInvoices = sortedInvoices.filter(invoice => {
//     const matchesSearch = 
//       invoice.carName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
    
//     const matchesDocType = 
//       filters.documentType.length === 0 || 
//       filters.documentType.includes(invoice.documentType)
    
//     const matchesStatus = 
//       filters.status.length === 0 || 
//       filters.status.includes(invoice.status)

//     return matchesSearch && matchesDocType && matchesStatus
//   })

//   // Pagination
//   const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage)
//   const startIndex = (currentPage - 1) * itemsPerPage
//   const endIndex = startIndex + itemsPerPage
//   const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex)

//   const downloadDocument = (documentUrl: string) => {
//     // Implement actual download logic here
//     console.log(`Downloading document: ${documentUrl}`)
//   }

//   const exportToCSV = () => {
//     // Define CSV headers
//     const headers = [
//       'ID',
//       'Document Type',
//       'Car',
//       'Date Issued',
//       'Due Date',
//       'Amount',
//       'Status'
//     ].join(',')

//     // Convert invoice data to CSV rows
//     const csvRows = filteredInvoices.map(invoice => {
//       return [
//         invoice.id,
//         invoice.documentType,
//         invoice.carName,
//         new Date(invoice.dateIssued).toLocaleDateString(),
//         invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '',
//         invoice.amount.toLocaleString(),
//         invoice.status
//       ].join(',')
//     })

//     // Combine headers and rows
//     const csvContent = [headers, ...csvRows].join('\n')

//     // Create blob and download link
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
//     const link = document.createElement('a')
//     const url = URL.createObjectURL(blob)
    
//     link.setAttribute('href', url)
//     link.setAttribute('download', `invoices_${new Date().toISOString().split('T')[0]}.csv`)
//     link.style.visibility = 'hidden'
    
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
//   }

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold">Documents & Invoices</h1>
//         <div className="flex space-x-2">
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline">
//                 <Filter className="h-4 w-4 mr-2" />
//                 Filters
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="w-56">
//               <DropdownMenuLabel>Document Type</DropdownMenuLabel>
//               {['invoice', 'registration', 'insurance', 'maintenance'].map(type => (
//                 <DropdownMenuCheckboxItem
//                   key={type}
//                   checked={filters.documentType.includes(type as Invoice['documentType'])}
//                   onCheckedChange={(checked) => {
//                     setFilters(prev => ({
//                       ...prev,
//                       documentType: checked
//                         ? [...prev.documentType, type as Invoice['documentType']]
//                         : prev.documentType.filter(t => t !== type)
//                     }))
//                   }}
//                 >
//                   {type.charAt(0).toUpperCase() + type.slice(1)}
//                 </DropdownMenuCheckboxItem>
//               ))}
//               <DropdownMenuSeparator />
//               <DropdownMenuLabel>Status</DropdownMenuLabel>
//               {['paid', 'pending', 'overdue', 'processed'].map(status => (
//                 <DropdownMenuCheckboxItem
//                   key={status}
//                   checked={filters.status.includes(status as Invoice['status'])}
//                   onCheckedChange={(checked) => {
//                     setFilters(prev => ({
//                       ...prev,
//                       status: checked
//                         ? [...prev.status, status as Invoice['status']]
//                         : prev.status.filter(s => s !== status)
//                     }))
//                   }}
//                 >
//                   {status.charAt(0).toUpperCase() + status.slice(1)}
//                 </DropdownMenuCheckboxItem>
//               ))}
//             </DropdownMenuContent>
//           </DropdownMenu>

//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline">
//                 <FileDown className="h-4 w-4 mr-2" />
//                 Export
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//               <DropdownMenuItem onClick={exportToCSV}>
//                 <FileText className="h-4 w-4 mr-2" />
//                 Export to CSV
//               </DropdownMenuItem>
//               <DropdownMenuItem>
//                 <Printer className="h-4 w-4 mr-2" />
//                 Print
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>

//       <div className="flex items-center space-x-2">
//         <div className="relative flex-1">
//           <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="Search by car name or document ID..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="pl-8"
//           />
//         </div>
//       </div>

//       <div className="rounded-md border">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead onClick={() => handleSort('documentType')} className="cursor-pointer">
//                 Document Type {sortConfig?.key === 'documentType' && <ArrowUpDown className="h-4 w-4 inline" />}
//               </TableHead>
//               <TableHead onClick={() => handleSort('id')} className="cursor-pointer">
//                 ID {sortConfig?.key === 'id' && <ArrowUpDown className="h-4 w-4 inline" />}
//               </TableHead>
//               <TableHead onClick={() => handleSort('carName')} className="cursor-pointer">
//                 Car {sortConfig?.key === 'carName' && <ArrowUpDown className="h-4 w-4 inline" />}
//               </TableHead>
//               <TableHead onClick={() => handleSort('dateIssued')} className="cursor-pointer">
//                 Date Issued {sortConfig?.key === 'dateIssued' && <ArrowUpDown className="h-4 w-4 inline" />}
//               </TableHead>
//               <TableHead onClick={() => handleSort('dueDate')} className="cursor-pointer">
//                 Due Date {sortConfig?.key === 'dueDate' && <ArrowUpDown className="h-4 w-4 inline" />}
//               </TableHead>
//               <TableHead onClick={() => handleSort('amount')} className="cursor-pointer">
//                 Amount {sortConfig?.key === 'amount' && <ArrowUpDown className="h-4 w-4 inline" />}
//               </TableHead>
//               <TableHead onClick={() => handleSort('status')} className="cursor-pointer">
//                 Status {sortConfig?.key === 'status' && <ArrowUpDown className="h-4 w-4 inline" />}
//               </TableHead>
//               <TableHead>Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {Array.isArray(paginatedInvoices) && paginatedInvoices.map((invoice) => (
//               <TableRow key={invoice.id}>
//                 <TableCell>
//                   <div className="flex items-center space-x-2">
//                     {getDocumentIcon(invoice.documentType)}
//                     <span className="capitalize">{invoice.documentType}</span>
//                   </div>
//                 </TableCell>
//                 <TableCell>{invoice.id}</TableCell>
//                 <TableCell>{invoice.carName}</TableCell>
//                 <TableCell>{new Date(invoice.dateIssued).toLocaleDateString()}</TableCell>
//                 <TableCell>
//                   {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}
//                 </TableCell>
//                 <TableCell>${invoice.amount.toLocaleString()}</TableCell>
//                 <TableCell>
//                   <Badge className={getStatusColor(invoice.status)}>
//                     {invoice.status}
//                   </Badge>
//                 </TableCell>
//                 <TableCell>
//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button variant="ghost" size="icon">
//                         <MoreHorizontal className="h-4 w-4" />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent align="end">
//                       <DropdownMenuLabel>Actions</DropdownMenuLabel>
//                       <DropdownMenuItem onClick={() => setSelectedDocument(invoice)}>
//                         <Eye className="h-4 w-4 mr-2" />
//                         View
//                       </DropdownMenuItem>
//                       <DropdownMenuItem onClick={() => downloadDocument(invoice.documentUrl)}>
//                         <Download className="h-4 w-4 mr-2" />
//                         Download
//                       </DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>

//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-2">
//           <p className="text-sm text-gray-500">
//             Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length}
//           </p>
//           <Select
//             value={itemsPerPage.toString()}
//             onValueChange={(value) => {
//               setItemsPerPage(Number(value))
//               setCurrentPage(1)
//             }}
//           >
//             <SelectTrigger className="w-[70px]">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               {[5, 10, 20, 50].map((value) => (
//                 <SelectItem key={value} value={value.toString()}>
//                   {value}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//         <div className="flex space-x-2">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
//             disabled={currentPage === 1}
//           >
//             Previous
//           </Button>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
//             disabled={currentPage === totalPages}
//           >
//             Next
//           </Button>
//         </div>
//       </div>

//       <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
//         <DialogContent className="max-w-4xl">
//           <DialogHeader>
//             <DialogTitle>Document Preview</DialogTitle>
//           </DialogHeader>
//           <div className="mt-4">
//             <iframe
//               src={selectedDocument?.documentUrl}
//               className="w-full h-[600px]"
//               title="Document Preview"
//             />
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// } 


import { ComingSoon } from "@/components/ui/coming-soon"

export default function InvoicesPage() {
  return (
    <ComingSoon 
      title="Invoices - Coming Soon"
      message="View and manage all your invoices in one place. This feature will be available soon."
    />
  )
}