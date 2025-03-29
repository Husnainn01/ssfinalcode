"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FaInbox, 
  FaSearch, 
  FaFilter, 
  FaSort, 
  FaEye, 
  FaReply, 
  FaArchive,
  FaSpinner,
  FaCar,
  FaQuestionCircle
} from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";

// Types
const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  answered: "bg-green-100 text-green-800 border-green-200",
  closed: "bg-gray-100 text-gray-800 border-gray-200"
};

const categoryIcons = {
  vehicle: <FaCar className="w-4 h-4 mr-2" />,
  general: <FaQuestionCircle className="w-4 h-4 mr-2" />,
  support: <FaInbox className="w-4 h-4 mr-2" />
};

export default function InquiriesListPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState([]);
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [totalCount, setTotalCount] = useState({
    all: 0,
    pending: 0,
    answered: 0,
    closed: 0
  });

  useEffect(() => {
    fetchInquiries();
  }, []);

  useEffect(() => {
    filterAndSortInquiries();
  }, [inquiries, searchQuery, statusFilter, categoryFilter, sortBy]);

  const fetchInquiries = async () => {
    setIsLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (searchQuery) params.append("search", searchQuery);
      params.append("sort", sortBy);
      
      const response = await fetch(`/api/admin/inquiries?${params.toString()}`, {
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setInquiries(data.inquiries || []);
        setTotalCount(data.counts || {
          all: 0,
          pending: 0,
          answered: 0,
          closed: 0
        });
      } else {
        console.error("API Error:", data);
        toast({
          title: `Error (${response.status})`,
          description: data.message || "Failed to load inquiries. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortInquiries = () => {
    let filtered = [...inquiries];
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(inquiry => inquiry.status === statusFilter);
    }
    
    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(inquiry => inquiry.category === categoryFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(inquiry => 
        (inquiry.subject?.toLowerCase() || '').includes(query) ||
        (inquiry.customerName?.toLowerCase() || '').includes(query) ||
        (inquiry.customerEmail?.toLowerCase() || '').includes(query) ||
        (inquiry.referenceId?.toLowerCase() || '').includes(query)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "updated":
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        case "priority":
          // Pending first, then answered, then closed
          const priorityOrder = { pending: 0, answered: 1, closed: 2 };
          return priorityOrder[a.status] - priorityOrder[b.status];
        default:
          return 0;
      }
    });
    
    setFilteredInquiries(filtered);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewInquiry = (id) => {
    router.push(`/admin/dashboard/inquiries/${id}`);
  };

  const handleQuickReply = (id) => {
    router.push(`/admin/dashboard/inquiries/${id}?action=reply`);
  };

  const handleArchive = async (id) => {
    // This will be replaced with actual API call
    toast({
      title: "Inquiry Archived",
      description: "The inquiry has been moved to the archive.",
    });
    
    // Refresh the list
    fetchInquiries();
  };

  // Mock data generator - will be replaced with actual API
  const generateMockData = () => {
    const statuses = ["pending", "answered", "closed"];
    const categories = ["vehicle", "general", "support"];
    
    return Array.from({ length: 25 }, (_, i) => ({
      _id: `inq_${i + 1}`,
      subject: `Inquiry about ${i % 3 === 0 ? "vehicle purchase" : i % 3 === 1 ? "shipping options" : "account issues"}`,
      customerName: `Customer ${i + 1}`,
      customerEmail: `customer${i + 1}@example.com`,
      status: statuses[i % 3],
      category: categories[i % 3],
      createdAt: new Date(Date.now() - (i * 86400000)).toISOString(), // Days ago
      updatedAt: new Date(Date.now() - (i * 43200000)).toISOString(), // Half days ago
      unreadMessages: i % 5 === 0 ? 1 : 0,
      referenceId: i % 2 === 0 ? `REF-${1000 + i}` : null
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Inquiries</h1>
          <p className="text-muted-foreground mt-1">
            Manage and respond to customer inquiries and support requests
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCount.all}</div>
            <p className="text-xs text-muted-foreground mt-1">All inquiries</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-yellow-700">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-700">{totalCount.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting response</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-green-700">Answered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{totalCount.answered}</div>
            <p className="text-xs text-muted-foreground mt-1">Responded but open</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-700">Closed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-700">{totalCount.closed}</div>
            <p className="text-xs text-muted-foreground mt-1">Resolved inquiries</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search by name, email, subject or reference ID..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-40">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="answered">Answered</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full sm:w-40">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="vehicle">Vehicle</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full sm:w-40">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="updated">Recently Updated</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                variant="outline" 
                onClick={fetchInquiries}
                className="flex items-center gap-2"
              >
                <FaFilter className="w-4 h-4" />
                <span>Reset</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inquiries Table */}
      <Card className="bg-white">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <FaSpinner className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="text-center py-12">
              <FaInbox className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No inquiries found</h3>
              <p className="text-gray-500">
                {searchQuery || statusFilter !== "all" || categoryFilter !== "all" 
                  ? "Try adjusting your filters" 
                  : "There are no customer inquiries yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Subject</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInquiries.map((inquiry) => (
                    <TableRow key={inquiry._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-start">
                          <div>
                            <div className="flex items-center">
                              {inquiry.unreadMessages > 0 && (
                                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                              )}
                              <span className="line-clamp-1">{inquiry.subject}</span>
                            </div>
                            {inquiry.referenceId && (
                              <span className="text-xs text-gray-500 font-mono mt-1">
                                Ref: {inquiry.referenceId}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{inquiry.customerName}</div>
                          <div className="text-sm text-gray-500">{inquiry.customerEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center w-fit">
                          {categoryIcons[inquiry.category]}
                          <span className="capitalize">{inquiry.category}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[inquiry.status]}>
                          <span className="capitalize">{inquiry.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(inquiry.createdAt)}</div>
                          {inquiry.updatedAt !== inquiry.createdAt && (
                            <div className="text-xs text-gray-500">
                              Updated: {formatDate(inquiry.updatedAt)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewInquiry(inquiry._id)}
                            title="View Details"
                          >
                            <FaEye className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleQuickReply(inquiry._id)}
                            title="Reply"
                            disabled={inquiry.status === "closed"}
                          >
                            <FaReply className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleArchive(inquiry._id)}
                            title="Archive"
                            disabled={inquiry.status !== "closed"}
                          >
                            <FaArchive className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between py-4">
          <div className="text-sm text-gray-500">
            Showing {filteredInquiries.length} of {totalCount.all} inquiries
          </div>
          {/* Pagination can be added here if needed */}
        </CardFooter>
      </Card>
    </div>
  );
} 