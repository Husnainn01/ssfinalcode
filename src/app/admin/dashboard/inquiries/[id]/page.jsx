"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { 
  FaArrowLeft, 
  FaInbox, 
  FaUser, 
  FaUserShield,
  FaEnvelope,
  FaPhone,
  FaCar,
  FaCalendarAlt,
  FaTag,
  FaExternalLinkAlt,
  FaPaperPlane,
  FaArchive,
  FaForward,
  FaSpinner,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaQuestionCircle,
  FaDollarSign,
  FaCheckCircle,
} from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { FaDollarSign as FaDollarSignIcon } from "react-icons/fa"
import { cn } from "@/lib/utils"
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Types and constants
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

// Form schema for price agreement
const agreePriceFormSchema = z.object({
  agreedPrice: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Agreed price must be a positive number",
  }),
  notes: z.string().optional(),
  estimatedDelivery: z.string().optional(),
});

export default function InquiryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const inquiryId = params.id;
  const { toast } = useToast();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isAgreePriceDialogOpen, setIsAgreePriceDialogOpen] = useState(false);
  const [isSubmittingPrice, setIsSubmittingPrice] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const messagesEndRef = useRef(null);

  // Get a default estimated delivery date (3 months from now)
  function getDefaultEstimatedDelivery() {
    const date = new Date();
    date.setMonth(date.getMonth() + 3);
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }

  // Initialize the form AFTER the function is defined
  const agreePriceForm = useForm({
    resolver: zodResolver(agreePriceFormSchema),
    defaultValues: {
      agreedPrice: "",
      notes: "",
      estimatedDelivery: getDefaultEstimatedDelivery(),
    },
  });
  
  // Update form defaults when inquiry is loaded
  useEffect(() => {
    if (inquiry?.vehicle?.price) {
      agreePriceForm.reset({
        agreedPrice: inquiry.vehicle.price.toString(),
        notes: "",
        estimatedDelivery: getDefaultEstimatedDelivery()
      });
    }
  }, [inquiry]);
  
  // Handle price agreement submission
  const handleAgreePriceSubmit = async (data) => {
    if (!inquiry) return;
    
    setIsSubmittingPrice(true);
    toast({
      title: "Processing",
      description: "Submitting agreed price...",
    });
    
    try {
      const response = await fetch(`/api/admin/inquiries/${inquiryId}/agree-price`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          agreedPrice: parseFloat(data.agreedPrice),
          notes: data.notes,
          estimatedDelivery: data.estimatedDelivery || null,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Price Agreed",
          description: "Vehicle created and customer notified of the agreed price.",
          variant: "success",
        });
        
        // Close dialog and refresh inquiry data
        setIsAgreePriceDialogOpen(false);
        fetchInquiryDetails();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to agree on price",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error agreeing price:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingPrice(false);
    }
  };

  useEffect(() => {
    if (inquiryId) {
      fetchInquiryDetails();
    }
  }, [inquiryId]);

  useEffect(() => {
    // Scroll to bottom of messages when new messages arrive
    scrollToBottom();
  }, [inquiry?.replies]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchInquiryDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/inquiries/${inquiryId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setInquiry(data.inquiry);
        setNewStatus(data.inquiry.status || "pending");
        console.log("Inquiry data received:", data.inquiry);
      } else {
        throw new Error(data.message || "Failed to fetch inquiry");
      }
    } catch (err) {
      console.error("Error fetching inquiry details:", err);
      setError(err.message || "An error occurred while fetching the inquiry");
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    
    if (!replyText.trim()) {
      toast({
        title: "Error",
        description: "Reply text cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    setSending(true);
    
    try {
      const response = await fetch(`/api/admin/inquiries/${inquiryId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          message: replyText,
          status: "answered",
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Reply Sent",
          description: "Your reply has been sent to the customer",
          variant: "success",
        });
        setReplyText("");
        fetchInquiryDetails(); // Refresh data
      } else {
        throw new Error(data.message || "Failed to send reply");
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send reply",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async () => {
    try {
      const response = await fetch(`/api/admin/inquiries/${inquiryId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Status Updated",
          description: `Inquiry status changed to ${newStatus}`,
          variant: "success",
        });
        setIsStatusDialogOpen(false);
        fetchInquiryDetails(); // Refresh data
      } else {
        throw new Error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      answered: "bg-blue-100 text-blue-800",
      resolved: "bg-green-100 text-green-800",
      agreed: "bg-purple-100 text-purple-800",
      completed: "bg-gray-100 text-gray-800",
    };

    return (
      <Badge className={statusClasses[status] || "bg-gray-100"}>
        {status || "Unknown"}
      </Badge>
    );
  };

  // Render buttons
  const renderReplyButton = () => (
    <Button onClick={handleSendReply} disabled={sending || !replyText.trim()}>
      {sending ? (
        <>
          <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <FaPaperPlane className="mr-2 h-4 w-4" />
          Send Reply
        </>
      )}
    </Button>
  );

  const renderStatusChangeButton = () => (
    <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FaCalendarAlt className="mr-2 h-4 w-4" />
          Update Status
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Inquiry Status</DialogTitle>
          <DialogDescription>
            Change the status of this inquiry to track its progress.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Select 
              value={newStatus} 
              onValueChange={setNewStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="answered">Answered</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="agreed">Agreed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleStatusChange}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const renderAgreePriceButton = () => {
    // Only show if inquiry status is not already 'agreed' or 'completed'
    if (inquiry?.status === 'agreed' || inquiry?.status === 'completed') {
      return (
        <Button variant="outline" disabled>
          <FaCheckCircle className="mr-2 h-4 w-4" />
          Price Already Agreed
        </Button>
      );
    }
    
    return (
      <Dialog open={isAgreePriceDialogOpen} onOpenChange={setIsAgreePriceDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <FaDollarSignIcon className="mr-2 h-4 w-4" />
            Agree on Price
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Agree on Vehicle Price</DialogTitle>
            <DialogDescription>
              Set an agreed price for this vehicle. This will create a vehicle entry and move this inquiry to 'Agreed' status.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...agreePriceForm}>
            <form onSubmit={agreePriceForm.handleSubmit(handleAgreePriceSubmit)} className="space-y-4 py-4">
              <FormField
                control={agreePriceForm.control}
                name="agreedPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agreed Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormDescription>
                      Original asked price: ${inquiry?.vehicle?.price?.toLocaleString() || 'N/A'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={agreePriceForm.control}
                name="estimatedDelivery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Delivery Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>
                      Approximate date when the vehicle will be delivered
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={agreePriceForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional details about the agreement"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={isSubmittingPrice}>
                  {isSubmittingPrice ? (
                    <>
                      <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="mr-2 h-4 w-4" />
                      Confirm Agreement
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  };

  // Add debugging for the inquiry data
  useEffect(() => {
    if (inquiry) {
      console.log("Inquiry data:", inquiry);
      console.log("Vehicle data:", inquiry.vehicle);
      console.log("Agreed price data:", inquiry.agreedPrice, inquiry.dateAgreed);
    }
  }, [inquiry]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <FaSpinner className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading inquiry details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 p-4 rounded-md">
          <div className="flex items-center">
            <FaExclamationTriangle className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-red-500 font-medium">Error</h3>
          </div>
          <p className="mt-2 text-red-600">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/admin/dashboard/inquiries")}
          >
            <FaArrowLeft className="mr-2 h-4 w-4" />
            Back to Inquiries
          </Button>
        </div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
          <div className="flex items-center">
            <FaExclamationTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="text-yellow-500 font-medium">Inquiry Not Found</h3>
          </div>
          <p className="mt-2 text-yellow-600">
            The inquiry you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/admin/dashboard/inquiries")}
          >
            <FaArrowLeft className="mr-2 h-4 w-4" />
            Back to Inquiries
          </Button>
        </div>
      </div>
    );
  }

  const vehicleId = inquiry?.vehicle?._id;

  // Add debug to check what IDs are available:
  console.log("Inquiry details:", {
    inquiryId: inquiry?._id,
    vehicleId: vehicleId,
    agreedPrice: inquiry?.agreedPrice,
    dateAgreed: inquiry?.dateAgreed
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            className="mr-4"
            onClick={() => router.push("/admin/dashboard/inquiries")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">
            Inquiry #{inquiry._id ? inquiry._id.substring(0, 8) : inquiryId.substring(0, 8)}
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-500 mr-2">Status:</div>
          {getStatusBadge(inquiry.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between">
                <span>Inquiry Details</span>
                <span className="text-sm text-gray-500">
                  {formatTimestamp(inquiry.createdAt)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg">{inquiry.subject}</h3>
                  <p className="mt-2 text-gray-700">{inquiry.message}</p>
                </div>

                {inquiry.vehicle && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h4 className="font-medium mb-2">Vehicle Information</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-gray-500">Make</div>
                      <div>{inquiry.vehicle.make || "N/A"}</div>

                      <div className="text-sm text-gray-500">Model</div>
                      <div>{inquiry.vehicle.model || "N/A"}</div>

                      <div className="text-sm text-gray-500">Year</div>
                      <div>{inquiry.vehicle.year || "N/A"}</div>

                      <div className="text-sm text-gray-500">Budget</div>
                      <div>
                        ${inquiry.vehicle.price?.toLocaleString() || "Not specified"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Original inquiry as first message */}
                <div className="flex gap-4">
                  <div
                    className={cn(
                      "bg-blue-50 p-3 rounded-lg max-w-[85%]"
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-blue-700">
                        {inquiry.customerName || "Customer"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(inquiry.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700">{inquiry.message}</p>
                  </div>
                </div>

                {/* Reply messages */}
                {inquiry.replies &&
                  inquiry.replies.map((reply, index) => (
                    <div className="flex gap-4" key={reply._id || index}>
                      <div
                        className={cn(
                          "p-3 rounded-lg max-w-[85%]",
                          reply.isAdmin
                            ? "bg-gray-100 ml-auto"
                            : "bg-blue-50"
                        )}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span
                            className={cn(
                              "font-medium",
                              reply.isAdmin
                                ? "text-gray-700"
                                : "text-blue-700"
                            )}
                          >
                            {reply.isAdmin
                              ? reply.adminName || "Admin"
                              : inquiry.customerName || "Customer"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700">{reply.message}</p>
                      </div>
                    </div>
                  ))}

                {/* Reply input */}
                <div className="mt-6">
                  <Textarea
                    placeholder="Type your reply here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="mb-4"
                    rows={4}
                  />
                  {renderReplyButton()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center">
                  <FaUser className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{inquiry.customerName || "Unknown"}</span>
                </div>
                <div className="flex items-center">
                  <FaEnvelope className="h-4 w-4 mr-2 text-gray-500" />
                  <a
                    href={`mailto:${inquiry.customerEmail}`}
                    className="text-blue-600 hover:underline"
                  >
                    {inquiry.customerEmail}
                  </a>
                </div>
                {inquiry.customerPhone && (
                  <div className="flex items-center">
                    <FaPhone className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{inquiry.customerPhone}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <FaCalendarAlt className="h-4 w-4 mr-2 text-gray-500" />
                  <span>Joined: {formatTimestamp(inquiry.customerCreatedAt)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/admin/dashboard/customers/${inquiry.userId}`)}
                >
                  <FaUser className="mr-2 h-4 w-4" />
                  View Customer Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {inquiry.status === 'agreed' && (inquiry.vehicleId || inquiry.vehicle?._id) && (
            <Card className="bg-purple-50">
              <CardHeader>
                <CardTitle className="text-purple-800">Vehicle Created</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-purple-50 p-6 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">Vehicle Created</h3>
                  <p className="text-purple-600 mb-4">
                    A vehicle has been created from this inquiry with an agreed price.
                  </p>
                  
                  <div className="mb-2">
                    <span className="text-gray-600">Agreed Price</span>
                    <div className="font-semibold">
                      {inquiry.agreedPrice 
                        ? `$${Number(inquiry.agreedPrice).toLocaleString()}` 
                        : inquiry.vehicle?.agreedPrice 
                          ? `$${Number(inquiry.vehicle.agreedPrice).toLocaleString()}` 
                          : "$N/A"}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-gray-600">Date Agreed</span>
                    <div className="font-semibold">
                      {inquiry.dateAgreed 
                        ? new Date(inquiry.dateAgreed).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          }) 
                        : inquiry.vehicle?.dateAgreed 
                          ? new Date(inquiry.vehicle.dateAgreed).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'short', day: 'numeric'
                            }) 
                          : "N/A"}
                    </div>
                  </div>
                  
                  {vehicleId ? (
                    <Link 
                      href={`/admin/dashboard/vehicles/${vehicleId}`} 
                      className="btn bg-blue-500 text-white hover:bg-blue-600 inline-flex items-center justify-center px-4 py-2 rounded"
                    >
                      <FaCar className="mr-2" /> View Vehicle
                    </Link>
                  ) : (
                    <div className="text-amber-600">
                      <span className="inline-flex items-center">
                        <FaExclamationTriangle className="mr-2" /> 
                        Vehicle ID missing. Please check with administrator.
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap gap-2">
            {renderStatusChangeButton()}
            {renderAgreePriceButton()}
          </div>
        </div>
      </div>
    </div>
  );
}