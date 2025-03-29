"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import Image from "next/image"
import { 
  ArrowLeft, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle,
  Send,
  Car,
  RefreshCw,
  ExternalLink,
  User,
  UserCheck,
  DollarSign
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { useCustomerAuth } from '@/hooks/useCustomerAuth'
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
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

export default function InquiryDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { user, isLoading } = useCustomerAuth()
  const [inquiry, setInquiry] = useState(null)
  const [sidebarInquiries, setSidebarInquiries] = useState([])
  const [isLoadingInquiry, setIsLoadingInquiry] = useState(true)
  const [isLoadingSidebar, setIsLoadingSidebar] = useState(true)
  const [replyMessage, setReplyMessage] = useState("")
  const [isSendingReply, setIsSendingReply] = useState(false)
  const messagesEndRef = useRef(null)
  const inquiryId = params.id

  useEffect(() => {
    if (user && inquiryId) {
      fetchInquiryDetails()
      fetchSidebarInquiries()
    }
  }, [user, inquiryId])

  useEffect(() => {
    // Scroll to bottom of messages when new messages arrive
    scrollToBottom()
  }, [inquiry?.replies])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchInquiryDetails = async () => {
    setIsLoadingInquiry(true)
    try {
      const response = await fetch(`/api/customer/inquiries/${inquiryId}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setInquiry(data.inquiry)
      } else {
        toast({
          title: "Error",
          description: "Failed to load inquiry details. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error fetching inquiry details:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoadingInquiry(false)
    }
  }

  const fetchSidebarInquiries = async () => {
    setIsLoadingSidebar(true)
    try {
      const response = await fetch('/api/customer/inquiries', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setSidebarInquiries(data.inquiries || [])
      }
    } catch (error) {
      console.error("Error fetching sidebar inquiries:", error)
    } finally {
      setIsLoadingSidebar(false)
    }
  }

  const handleSendReply = async (e) => {
    e.preventDefault()
    
    if (!replyMessage.trim()) {
      return
    }
    
    setIsSendingReply(true)
    
    try {
      const response = await fetch(`/api/customer/inquiries/${inquiryId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: replyMessage }),
        credentials: 'include'
      })
      
      if (response.ok) {
        setReplyMessage("")
        fetchInquiryDetails() // Refresh to get the new reply
      } else {
        toast({
          title: "Error",
          description: "Failed to send your message. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error sending reply:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSendingReply(false)
    }
  }

  const getStatusBadge = (status) => {
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Render the agreed price section if inquiry status is 'agreed' or 'completed'
  const renderAgreedPriceSection = () => {
    if (inquiry?.status !== 'agreed' && inquiry?.status !== 'completed') {
      return null;
    }
    
    return (
      <Card className="bg-green-50 border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center text-green-800">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            Price Agreement
          </CardTitle>
          <CardDescription className="text-green-700">
            Your vehicle request has been approved with the following details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <div className="text-sm text-gray-600">Original Price</div>
              <div className="font-medium">${inquiry.vehicle?.price?.toLocaleString() || 'N/A'}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600">Agreed Price</div>
              <div className="font-bold text-green-700">${inquiry.agreedPrice?.toLocaleString() || 'N/A'}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600">Date Agreed</div>
              <div className="font-medium">
                {inquiry.dateAgreed ? new Date(inquiry.dateAgreed).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600">Estimated Delivery</div>
              <div className="font-medium">
                {inquiry.estimatedDelivery ? new Date(inquiry.estimatedDelivery).toLocaleDateString() : 'To be determined'}
              </div>
            </div>
          </div>
          
          {inquiry.notes && (
            <div className="mt-4 p-3 bg-white rounded-md">
              <div className="text-sm text-gray-600 mb-1">Additional Notes</div>
              <div className="text-gray-800">{inquiry.notes}</div>
            </div>
          )}
          
          {(inquiry.vehicleId || inquiry.vehicle?._id) && (
            <div className="mt-4">
              <Button 
                onClick={() => router.push(`/customer-dashboard/my-vehicles/${inquiry.vehicleId || inquiry.vehicle?._id}`)}
                className="w-full md:w-auto bg-green-600 hover:bg-green-700"
              >
                <Car className="mr-2 h-4 w-4" />
                View My Vehicle Details
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading || isLoadingInquiry) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!inquiry) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Inquiry Not Found</h2>
        <p className="text-gray-500 mb-6">The inquiry you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button 
          onClick={() => router.push('/customer-dashboard/inquiries')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Inquiries
        </Button>
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
      <motion.div variants={itemVariants} className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => router.push('/customer-dashboard/inquiries')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Inquiry Details</h2>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with other inquiries */}
        <motion.div variants={itemVariants} className="hidden lg:block">
          <Card className="h-[calc(100vh-200px)] overflow-hidden">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg">Recent Inquiries</CardTitle>
            </CardHeader>
            <div className="overflow-y-auto h-full pb-4">
              {isLoadingSidebar ? (
                <div className="flex justify-center p-4">
                  <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {sidebarInquiries.map((item) => (
                    <div 
                      key={item._id}
                      className={`p-2 rounded-md cursor-pointer transition-colors ${
                        item._id === inquiryId 
                          ? 'bg-blue-50 border-l-4 border-blue-500' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => router.push(`/customer-dashboard/inquiries/${item._id}`)}
                    >
                      <div className="flex items-start gap-2">
                        {item.category === 'vehicle' ? (
                          <Car className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                        ) : (
                          <MessageSquare className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.subject}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`w-2 h-2 rounded-full ${
                              item.status === 'pending' ? 'bg-yellow-500' :
                              item.status === 'answered' ? 'bg-green-500' : 
                              item.status === 'agreed' ? 'bg-purple-500' : 'bg-gray-500'
                            }`}></span>
                            <span className="text-xs text-gray-500">
                              {formatDate(item.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Main content */}
        <motion.div variants={itemVariants} className="lg:col-span-3 space-y-6">
          {/* Inquiry header */}
          <Card>
            <CardHeader className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {inquiry.category === 'vehicle' && (
                    <span className="bg-blue-100 p-1.5 rounded-md">
                      <Car className="w-5 h-5 text-blue-600" />
                    </span>
                  )}
                  <div>
                    <CardTitle className="text-xl">{inquiry.subject}</CardTitle>
                    <CardDescription className="mt-1">
                      Created on {formatDate(inquiry.createdAt)}
                      {inquiry.referenceId && (
                        <span className="ml-2 font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                          Ref: {inquiry.referenceId}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(inquiry.status)}
              </div>
            </CardHeader>
          </Card>

          {/* Agreed Price section for agreed/completed inquiries */}
          {renderAgreedPriceSection()}

          {/* Car details if this is a vehicle inquiry */}
          {inquiry.category === 'vehicle' && inquiry.carDetails && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">Vehicle Details</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex flex-col md:flex-row gap-4">
                    {inquiry.carDetails.images && (
                      <div className="w-full md:w-1/3">
                        <div className="relative h-48 rounded-lg overflow-hidden">
                          <Image
                            src={inquiry.carDetails.images}
                            alt={inquiry.carDetails.model}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    )}
                    <div className="w-full md:w-2/3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p className="text-sm text-gray-500">Make & Model</p>
                          <p className="font-medium">{inquiry.carDetails.make} {inquiry.carDetails.model}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Year</p>
                          <p className="font-medium">{inquiry.carDetails.year}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Stock Number</p>
                          <p className="font-medium">{inquiry.carDetails.stockNo}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Price</p>
                          <p className="font-medium">${inquiry.carDetails.price?.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Button
                          onClick={() => window.open(`/cars/${inquiry.carDetails.id}`, '_blank')}
                          variant="outline"
                          size="sm"
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-2" />
                          View Vehicle
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Messages section */}
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg">Conversation</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[500px] overflow-y-auto p-4">
                  {/* Initial inquiry message */}
                  <div className="flex gap-3 mb-6">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-blue-50 p-3 rounded-lg rounded-tl-none">
                        <p className="text-gray-800 whitespace-pre-line">{inquiry.message}</p>
                      </div>
                      <div className="mt-1 flex justify-between">
                        <span className="text-xs text-gray-500">
                          You • {formatDate(inquiry.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Response from admin if any */}
                  {inquiry.response && (
                    <div className="flex gap-3 mb-6">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <UserCheck className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-purple-50 p-3 rounded-lg rounded-tl-none">
                          <p className="text-gray-800 whitespace-pre-line">{inquiry.response.message}</p>
                        </div>
                        <div className="mt-1 flex justify-between">
                          <span className="text-xs text-gray-500">
                            Support • {formatDate(inquiry.response.respondedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional replies */}
                  {inquiry.replies && inquiry.replies.map((reply, index) => (
                    <div 
                      key={reply._id || index} 
                      className={`flex gap-3 mb-6 ${reply.isAdmin ? 'flex-row' : 'flex-row-reverse'}`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full ${
                        reply.isAdmin 
                          ? 'bg-purple-100 flex items-center justify-center' 
                          : 'bg-blue-100 flex items-center justify-center'
                      }`}>
                        {reply.isAdmin ? (
                          <UserCheck className="w-4 h-4 text-purple-600" />
                        ) : (
                          <User className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`p-3 rounded-lg ${
                          reply.isAdmin 
                            ? 'bg-purple-50 rounded-tl-none' 
                            : 'bg-blue-50 rounded-tr-none'
                        }`}>
                          <p className="text-gray-800 whitespace-pre-line">{reply.message}</p>
                        </div>
                        <div className={`mt-1 flex ${reply.isAdmin ? 'justify-start' : 'justify-end'}`}>
                          <span className="text-xs text-gray-500">
                            {reply.isAdmin ? 'Support' : 'You'} • {formatDate(reply.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Scroll anchor */}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>

              {/* Reply form - Don't show if inquiry is already in agreed or closed status */}
              {inquiry.status !== 'closed' && inquiry.status !== 'agreed' && inquiry.status !== 'completed' && (
                <CardFooter className="p-4 border-t">
                  <form onSubmit={handleSendReply} className="w-full">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Type your message here..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        className="flex-1 min-h-[80px] resize-none"
                      />
                      <Button 
                        type="submit" 
                        className="self-end bg-blue-600 hover:bg-blue-700"
                        disabled={isSendingReply || !replyMessage.trim()}
                      >
                        {isSendingReply ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </form>
                </CardFooter>
              )}
              
              {/* Message for inquiries that can't be replied to */}
              {(inquiry.status === 'agreed' || inquiry.status === 'completed' || inquiry.status === 'closed') && (
                <CardFooter className="p-4 border-t bg-gray-50">
                  <div className="w-full text-center text-gray-500 text-sm">
                    This conversation has been {inquiry.status === 'closed' ? 'closed' : 'completed'}.
                    {inquiry.status === 'agreed' && " Your vehicle purchase is being processed."}
                  </div>
                </CardFooter>
              )}
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
} 