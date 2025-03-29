"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Ship, Container, FileText, AlertCircle, RefreshCw, ExternalLink, Map, Navigation } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// Define schema - this works in both TS and JS
const searchSchema = z.object({
  searchType: z.enum(["container", "bl", "booking"], {
    required_error: "Please select a search type",
  }),
  searchNumber: z.string().min(1, "Please enter a value to search"),
})

export default function TrackShipment() {
  const [isSearching, setIsSearching] = useState(false)
  const [shipmentData, setShipmentData] = useState(null)
  const [iframeUrl, setIframeUrl] = useState("")
  const { toast } = useToast()

  // Initialize form properly for JavaScript
  const form = useForm({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      searchType: "container",
      searchNumber: "",
    },
  })
  
  // Destructure needed methods from form
  const { handleSubmit, watch, control } = form;

  const onSubmit = async (values) => {
    try {
      setIsSearching(true)
      
      // Call your proxy API
      const response = await fetch(`/api/vessel-tracking?type=${values.searchType}&query=${encodeURIComponent(values.searchNumber)}`, {
        cache: 'no-store'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to retrieve shipment data")
      }
      
      const data = await response.json()
      
      if (data.success) {
        setShipmentData(data.data)
        
        // Set an iframe URL for the map display if we have coordinates
        if (data.data.position) {
          setIframeUrl(`https://www.marinetraffic.com/en/ais/home/centerx:${data.data.position.longitude}/centery:${data.data.position.latitude}/zoom:9`)
        } else if (data.data.mapUrl) {
          setIframeUrl(data.data.mapUrl)
        }
        
        toast({
          title: "Shipment Found",
          description: `Showing tracking information for ${data.data.container?.number || values.searchNumber}`,
        })
      } else {
        throw new Error(data.error || "No tracking information found")
      }
      
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to search shipment. Please try again.",
        variant: "destructive",
      })
      setShipmentData(null)
    } finally {
      setIsSearching(false)
    }
  }
  
  // Helper function to determine shipment status color
  const getStatusColor = (status) => {
    if (!status) return "bg-gray-200";
    
    status = status.toLowerCase();
    if (status.includes("delivered") || status.includes("arrival")) return "bg-green-500";
    if (status.includes("transit") || status.includes("sailing")) return "bg-blue-500";
    if (status.includes("loading") || status.includes("discharge")) return "bg-yellow-500";
    if (status.includes("delay") || status.includes("hold")) return "bg-orange-500";
    if (status.includes("error") || status.includes("exception")) return "bg-red-500";
    
    return "bg-gray-200";
  }
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  }
  
  // Get the current search type value
  const currentSearchType = watch("searchType");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto py-8 px-4"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Track Your Shipment</h1>
        <p className="text-gray-600">Enter container number or bill of lading to track your shipment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Search Shipment</CardTitle>
              <CardDescription>
                Enter shipment details to track
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={control}
                    name="searchType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Search By</FormLabel>
                        <FormControl>
                          <div className="flex flex-wrap gap-2">
                            <Tabs defaultValue={currentSearchType} className="w-full" onValueChange={field.onChange}>
                              <TabsList className="w-full">
                                <TabsTrigger 
                                  value="container" 
                                  className="flex-1"
                                >
                                  <Container className="h-4 w-4 mr-1" />
                                  Container
                                </TabsTrigger>
                                <TabsTrigger 
                                  value="bl" 
                                  className="flex-1"
                                >
                                  <FileText className="h-4 w-4 mr-1" />
                                  BL Number
                                </TabsTrigger>
                                <TabsTrigger 
                                  value="booking" 
                                  className="flex-1"
                                >
                                  <Ship className="h-4 w-4 mr-1" />
                                  Booking
                                </TabsTrigger>
                              </TabsList>
                            </Tabs>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="searchNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {currentSearchType === "container" ? "Container Number" : 
                           currentSearchType === "bl" ? "Bill of Lading Number" : "Booking Number"}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder={`Enter ${currentSearchType === "container" ? "container" : 
                                           currentSearchType === "bl" ? "BL" : "booking"} number`}
                              {...field}
                              className="pl-10"
                            />
                            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </motion.div>
                        <span>Searching...</span>
                      </>
                    ) : (
                      <span>Track Shipment</span>
                    )}
                  </Button>
                </form>
              </Form>
              
              <div className="mt-4 text-xs text-gray-500">
                <p><strong>Container Number</strong>: The number on your shipping container (e.g., MSDU7304509)</p>
                <p><strong>BL Number</strong>: Bill of Lading number provided by the carrier</p>
                <p><strong>Booking Number</strong>: Booking reference number for your shipment</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <AnimatePresence>
            {shipmentData ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Container Information */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Container Information</CardTitle>
                        <CardDescription>
                          Tracking details for your shipment
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className={`${getStatusColor(shipmentData.container?.trackingStatus)} text-white px-3 py-1`}>
                        {shipmentData.container?.trackingStatus || "Status Unknown"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Container Number</p>
                        <p className="font-medium">{shipmentData.container?.number || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Shipping Line</p>
                        <p className="font-medium">{shipmentData.container?.line || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">BL Number</p>
                        <p className="font-medium">{shipmentData.container?.blNumber || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Last Updated</p>
                        <p className="font-medium">{formatDate(shipmentData.position?.lastReport) || "N/A"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Voyage Information */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>{shipmentData.name || "Vessel"}</CardTitle>
                        <CardDescription>
                          {shipmentData.type || "Container Ship"}
                        </CardDescription>
                      </div>
                      {iframeUrl && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => window.open(iframeUrl, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open Map
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">IMO</p>
                        <p className="font-medium">{shipmentData.imo || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">MMSI</p>
                        <p className="font-medium">{shipmentData.mmsi || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Flag</p>
                        <p className="font-medium">{shipmentData.flag || "N/A"}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium mb-1">Origin</p>
                        <p className="text-base">{shipmentData.voyage?.origin || "N/A"}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium mb-1">Destination</p>
                        <p className="text-base">{shipmentData.voyage?.destination || "N/A"}</p>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium mb-1">Estimated Time of Arrival</p>
                      <p className="text-base">{formatDate(shipmentData.voyage?.etaDestination) || "N/A"}</p>
                    </div>
                    
                    {/* Map Display */}
                    {iframeUrl && (
                      <div className="mt-4 relative rounded-md overflow-hidden border border-gray-200 h-[400px]">
                        <iframe 
                          src={iframeUrl}
                          className="w-full h-full border-0"
                          title="Vessel Tracking Map"
                        />
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-500">
                      <p>Data is provided by JDM and is updated multiple times per day.</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center h-full"
              >
                <div className="text-center p-12 bg-gray-50 rounded-lg w-full">
                  <div className="mx-auto w-16 h-16 mb-4 bg-blue-50 rounded-full flex items-center justify-center">
                    <Map className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Shipment Selected</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Enter a container number, BL number, or booking number to see tracking information and current position on the map.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
} 

