"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Package, FileText, AlertCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const searchSchema = z.object({
  searchType: z.enum(["booking", "bl"], {
    required_error: "Please select a search type",
  }),
  searchNumber: z.string().min(1, "Please enter a number to search"),
})

export default function TrackShipment() {
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      searchType: "booking",
    },
  })

  const onSubmit = async (values: z.infer<typeof searchSchema>) => {
    try {
      setIsSearching(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast({
        title: "Searching...",
        description: `Searching for ${values.searchType === "booking" ? "Booking" : "BL"} Number: ${values.searchNumber}`,
      })
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search shipment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto py-8 px-4"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Track Your Shipment</h1>
        <p className="text-gray-600">Enter your booking number or BL number to track your shipment</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="searchType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Search By</FormLabel>
                  <FormControl>
                    <div className="flex space-x-4">
                      <div
                        onClick={() => field.onChange("booking")}
                        className={`
                          flex items-center p-4 rounded-lg border-2 cursor-pointer flex-1
                          ${field.value === "booking" ? "border-blue-500 bg-blue-50" : "border-gray-200"}
                        `}
                      >
                        <Package className="h-5 w-5 mr-2" />
                        <span>Booking Number</span>
                      </div>
                      <div
                        onClick={() => field.onChange("bl")}
                        className={`
                          flex items-center p-4 rounded-lg border-2 cursor-pointer flex-1
                          ${field.value === "bl" ? "border-blue-500 bg-blue-50" : "border-gray-200"}
                        `}
                      >
                        <FileText className="h-5 w-5 mr-2" />
                        <span>BL Number</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="searchNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {field.value === "booking" ? "Booking Number" : "BL Number"}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder={`Enter your ${field.value === "booking" ? "booking" : "BL"} number`}
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
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  </motion.div>
                  <span>Searching...</span>
                </>
              ) : (
                <span>Search</span>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </motion.div>
  )
} 