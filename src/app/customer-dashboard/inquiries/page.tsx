"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  MessageSquare, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Search,
  Car,
  DollarSign
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tabs, Tab } from "@nextui-org/react"
import { useCustomerAuth } from '@/hooks/useCustomerAuth'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren"
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }
}

// Types
interface Inquiry {
  _id: string;
  subject: string;
  message: string;
  status: 'pending' | 'answered' | 'agreed' | 'closed';
  createdAt: string;
  updatedAt: string;
  response?: {
    message: string;
    respondedAt: string;
    respondedBy: string;
  };
  category: string;
  referenceId?: string;
  agreedPrice?: number;
  dateAgreed?: string;
}

export default function InquiriesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isLoading } = useCustomerAuth()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [filteredInquiries, setFilteredInquiries] = useState<Inquiry[]>([])
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<string>("all")

  useEffect(() => {
    if (user) {
      fetchInquiries()
    }
  }, [user])

  useEffect(() => {
    if (inquiries.length > 0) {
      filterInquiries(activeTab, searchQuery)
    }
  }, [inquiries, activeTab, searchQuery])

  const fetchInquiries = async () => {
    setIsLoadingInquiries(true)
    try {
      const response = await fetch('/api/customer/inquiries', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setInquiries(data.inquiries || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to load inquiries. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoadingInquiries(false)
    }
  }

  const filterInquiries = (status: string, query: string) => {
    let filtered = [...inquiries]
    
    // Filter by status
    if (status !== "all") {
      filtered = filtered.filter(inquiry => inquiry.status === status)
    }
    
    // Filter by search query
    if (query) {
      const lowercaseQuery = query.toLowerCase()
      filtered = filtered.filter(inquiry => 
        inquiry.subject.toLowerCase().includes(lowercaseQuery) || 
        inquiry.message.toLowerCase().includes(lowercaseQuery)
      )
    }
    
    setFilteredInquiries(filtered)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" /> Pending
        </Badge>
      case 'answered':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" /> Answered
        </Badge>
      case 'agreed':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          <DollarSign className="w-3 h-3 mr-1" /> Agreed
        </Badge>
      case 'closed':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          <XCircle className="w-3 h-3 mr-1" /> Closed
        </Badge>
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        variants={itemVariants}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Inquiries</h2>
          <p className="text-muted-foreground mt-1">
            View and manage your inquiries and support requests
          </p>
        </div>
        <Button 
          onClick={() => router.push('/customer-dashboard/inquiries/new')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Inquiry
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search inquiries..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={fetchInquiries}
          disabled={isLoadingInquiries}
        >
          <RefreshCw className={`h-4 w-4 ${isLoadingInquiries ? 'animate-spin' : ''}`} />
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs 
          aria-label="Inquiry status tabs" 
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          className="mb-4"
        >
          <Tab key="all" title="All Inquiries">
            {renderInquiriesList()}
          </Tab>
          <Tab key="pending" title="Pending">
            {renderInquiriesList()}
          </Tab>
          <Tab key="answered" title="Answered">
            {renderInquiriesList()}
          </Tab>
          <Tab key="agreed" title="Agreed">
            {renderInquiriesList()}
          </Tab>
          <Tab key="closed" title="Closed">
            {renderInquiriesList()}
          </Tab>
        </Tabs>
      </motion.div>
    </motion.div>
  )

  function renderInquiriesList() {
    if (isLoadingInquiries) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (filteredInquiries.length === 0) {
      return (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No inquiries found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery 
              ? "Try adjusting your search query" 
              : activeTab !== "all" 
                ? `You don't have any ${activeTab} inquiries yet` 
                : "You haven't submitted any inquiries yet"}
          </p>
          {!searchQuery && activeTab === "all" && (
            <Button 
              onClick={() => router.push('/customer-dashboard/inquiries/new')}
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create your first inquiry
            </Button>
          )}
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {filteredInquiries.map((inquiry) => (
          <motion.div
            key={inquiry._id}
            variants={itemVariants}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
            onClick={() => router.push(`/customer-dashboard/inquiries/${inquiry._id}`)}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                {inquiry.category === 'vehicle' && (
                  <span className="bg-blue-100 p-1 rounded">
                    <Car className="w-4 h-4 text-blue-600" />
                  </span>
                )}
                <h3 className="font-medium text-lg">{inquiry.subject}</h3>
              </div>
              {getStatusBadge(inquiry.status)}
            </div>
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">{inquiry.message}</p>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500">
              <span>Created: {formatDate(inquiry.createdAt)}</span>
              
              {/* Show different information based on status */}
              {inquiry.status === 'answered' && inquiry.response && (
                <span>Responded: {formatDate(inquiry.response.respondedAt)}</span>
              )}
              
              {inquiry.status === 'agreed' && inquiry.agreedPrice && (
                <span className="text-purple-600 font-semibold">
                  Agreed Price: ${inquiry.agreedPrice.toLocaleString()}
                </span>
              )}
              
              {inquiry.referenceId && (
                <span className="font-mono">Ref: {inquiry.referenceId}</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    )
  }
} 