// "use client"

// import { useState } from "react"
// import { motion, AnimatePresence } from "framer-motion"
// import { useForm } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import * as z from "zod"
// import { 
//   Container, 
//   Car, 
//   Ship, 
//   Camera, 
//   FileText, 
//   CheckCircle,
//   AlertCircle,
//   AlertTriangle,
//   CheckCircle2,
//   ArrowLeft
// } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form"
// import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
// import { useToast } from "@/components/ui/use-toast"
// import {
//   Alert,
//   AlertDescription,
//   AlertTitle,
// } from "@/components/ui/alert"
// import { useRouter } from "next/navigation"

// // Enhanced form schema with more specific validations
// const formSchema = z.object({
//   planType: z.enum(["container", "roro"], {
//     required_error: "Please select a plan type",
//   }),
//   containerType: z.enum(["stock", "determined"])
//     .optional()
//     .refine((val) => val !== undefined, {
//       message: "Please select a container type",
//     }),
//   area: z.string()
//     .optional()
//     .refine((val) => !val || val.length >= 2, {
//       message: "Area must be at least 2 characters",
//     }),
//   country: z.string()
//     .min(2, { message: "Country must be at least 2 characters" })
//     .refine((val) => val.trim().length > 0, {
//       message: "Country is required",
//     }),
//   port: z.string()
//     .min(2, { message: "Port must be at least 2 characters" })
//     .refine((val) => val.trim().length > 0, {
//       message: "Port is required",
//     }),
//   otherDetails: z.string()
//     .optional()
//     .refine((val) => !val || val.length <= 500, {
//       message: "Other details must not exceed 500 characters",
//     }),
//   services: z.array(z.string()).optional(),
//   inspectionAgency: z.enum(["JAAI", "JEVIC", "EAA", "QISJ", "JAAI_PRICE", "PSI"], {
//     required_error: "Please select an inspection agency",
//   }).optional(),
//   remarks: z.string()
//     .optional()
//     .refine((val) => !val || val.length <= 1000, {
//       message: "Remarks must not exceed 1000 characters",
//     }),
//   photoDetails: z.string()
//     .optional()
//     .refine((val) => !val || val.length <= 500, {
//       message: "Photo details must not exceed 500 characters",
//     }),
// })

// const services = [
//   {
//     id: "deregistration",
//     label: "De-Registration Service",
//     price: "¥3,900 or ¥4,900"
//   },
//   {
//     id: "exportCertificate",
//     label: "English Export Certificate Service",
//     price: "¥500"
//   },
//   {
//     id: "standardPhotos",
//     label: "Photo Services (Standard Shots)",
//     price: "Free"
//   },
//   {
//     id: "requestPhotos",
//     label: "Photo Services (Request Shoots)",
//     price: "¥1,000"
//   },
//   {
//     id: "easyWork",
//     label: "Easy Work",
//     price: "Depends on Work Descriptions"
//   },
// ]

// const inspectionAgencies = [
//   { value: "JAAI", label: "JAAI" },
//   { value: "JEVIC", label: "JEVIC" },
//   { value: "EAA", label: "EAA" },
//   { value: "QISJ", label: "QISJ" },
//   { value: "JAAI_PRICE", label: "JAAI(Price Assessment)" },
//   { value: "PSI", label: "PSI" }
// ]

// export default function CreateOrder() {
//   const [step, setStep] = useState(1)
//   const [submitting, setSubmitting] = useState(false)
//   const [formError, setFormError] = useState<string | null>(null)
//   const [isSuccess, setIsSuccess] = useState(false)
//   const { toast } = useToast()
//   const router = useRouter()
  
//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       services: [],
//     },
//     mode: "onChange" // Enable real-time validation
//   })

//   const planType = form.watch("planType")
//   const containerType = form.watch("containerType")

//   const onSubmit = async (values: z.infer<typeof formSchema>) => {
//     try {
//       setSubmitting(true)
//       setFormError(null)

//       // For RORO, we only need to validate country and port
//       if (planType === "roro") {
//         if (!values.country || !values.port) {
//           throw new Error("Please fill in all required fields")
//         }
//       } else {
//         // Container validation remains the same
//         if (!containerType) {
//           throw new Error("Please select a container type")
//         }

//         if (step === 1) {
//           setStep(2)
//           setSubmitting(false)
//           return
//         }

//         if (!values.inspectionAgency) {
//           throw new Error("Please select an inspection agency for container shipment")
//         }
//       }

//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 1000))

//       // Show success state
//       setIsSuccess(true)
      
//       toast({
//         title: "Success!",
//         description: "Your order has been created successfully.",
//         duration: 5000,
//       })

//     } catch (error) {
//       setFormError(error instanceof Error ? error.message : "An unexpected error occurred")
//       toast({
//         title: "Error",
//         description: error instanceof Error ? error.message : "Failed to create order",
//         variant: "destructive",
//       })
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   const handleNext = () => {
//     const currentFields = [
//       "planType",
//       "country",
//       "port",
//       ...(planType === "container" ? ["containerType"] : [])
//     ]

//     // Check if current step fields are valid
//     const isStepValid = currentFields.every(field => !form.formState.errors[field])

//     if (!isStepValid) {
//       setFormError("Please fill in all required fields correctly")
//       return
//     }

//     setFormError(null)
//     setStep(2)
//   }

//   if (isSuccess) {
//     return (
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="max-w-3xl mx-auto py-8"
//       >
//         <div className="bg-white rounded-xl shadow-sm p-8 text-center">
//           <motion.div
//             initial={{ scale: 0 }}
//             animate={{ scale: 1 }}
//             transition={{ type: "spring", duration: 0.5 }}
//             className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4"
//           >
//             <CheckCircle2 className="h-8 w-8 text-green-600" />
//           </motion.div>
          
//           <h2 className="text-2xl font-bold mb-4">Order Created Successfully!</h2>
//           <p className="text-gray-600 mb-8">
//             Your order has been submitted and is being processed. You can track its status in your dashboard.
//           </p>

//           <div className="space-x-4">
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setIsSuccess(false)
//                 setStep(1)
//                 form.reset()
//               }}
//             >
//               <ArrowLeft className="mr-2 h-4 w-4" />
//               Create Another Order
//             </Button>
            
//             <Button
//               onClick={() => router.push('/customer-dashboard/orders')}
//             >
//               View Orders
//             </Button>
//           </div>
//         </div>
//       </motion.div>
//     )
//   }

//   return (
//     <motion.div 
//       className="max-w-3xl mx-auto py-8 space-y-8"
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//     >
//       <div className="space-y-2">
//         <h1 className="text-3xl font-bold">Create New Order</h1>
//         <p className="text-gray-500">Please fill in the details below to create your order.</p>
//       </div>

//       <div className="bg-white rounded-xl shadow-sm p-6">
//         {formError && (
//           <Alert variant="destructive" className="mb-6">
//             <AlertTriangle className="h-4 w-4" />
//             <AlertTitle>Error</AlertTitle>
//             <AlertDescription>{formError}</AlertDescription>
//           </Alert>
//         )}

//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
//             {step === 1 && (
//               <motion.div
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: -20 }}
//                 className="space-y-6"
//               >
//                 <FormField
//                   control={form.control}
//                   name="planType"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Select Your Plan</FormLabel>
//                       <FormControl>
//                         <div className="grid grid-cols-2 gap-4">
//                           <div
//                             onClick={() => field.onChange("container")}
//                             className={`
//                               flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer
//                               ${field.value === 'container' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
//                             `}
//                           >
//                             <Container className="h-8 w-8 mb-2" />
//                             <span>Container</span>
//                           </div>
//                           <div
//                             onClick={() => field.onChange("roro")}
//                             className={`
//                               flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer
//                               ${field.value === 'roro' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
//                             `}
//                           >
//                             <Ship className="h-8 w-8 mb-2" />
//                             <span>RORO</span>
//                           </div>
//                         </div>
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 {planType === "container" && (
//                   <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     className="space-y-6"
//                   >
//                     <FormField
//                       control={form.control}
//                       name="containerType"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Container Type</FormLabel>
//                           <FormControl>
//                             <div className="space-y-4">
//                               <div
//                                 onClick={() => field.onChange("stock")}
//                                 className={`
//                                   p-4 rounded-lg border-2 cursor-pointer
//                                   ${field.value === 'stock' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
//                                 `}
//                               >
//                                 <div className="font-medium">Stock Cars</div>
//                                 <div className="text-sm text-gray-500">Country is Not Determined</div>
//                               </div>
//                               <div
//                                 onClick={() => field.onChange("determined")}
//                                 className={`
//                                   p-4 rounded-lg border-2 cursor-pointer
//                                   ${field.value === 'determined' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
//                                 `}
//                               >
//                                 <div className="font-medium">Determined Destination</div>
//                                 <div className="text-sm text-gray-500">Country and Port are Determined</div>
//                               </div>
//                             </div>
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />

//                     {containerType && (
//                       <motion.div
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         className="space-y-4"
//                       >
//                         <FormField
//                           control={form.control}
//                           name="area"
//                           render={({ field }) => (
//                             <FormItem>
//                               <FormLabel>Area</FormLabel>
//                               <FormControl>
//                                 <Input placeholder="Enter area" {...field} />
//                               </FormControl>
//                               <FormMessage />
//                             </FormItem>
//                           )}
//                         />

//                         <FormField
//                           control={form.control}
//                           name="country"
//                           render={({ field }) => (
//                             <FormItem>
//                               <FormLabel className="text-red-500">Country (Required)</FormLabel>
//                               <FormControl>
//                                 <Input placeholder="Enter country" {...field} />
//                               </FormControl>
//                               <FormMessage />
//                             </FormItem>
//                           )}
//                         />

//                         <FormField
//                           control={form.control}
//                           name="port"
//                           render={({ field }) => (
//                             <FormItem>
//                               <FormLabel className="text-red-500">Port (Required)</FormLabel>
//                               <FormControl>
//                                 <Input placeholder="Enter port" {...field} />
//                               </FormControl>
//                               <FormMessage />
//                             </FormItem>
//                           )}
//                         />

//                         <FormField
//                           control={form.control}
//                           name="otherDetails"
//                           render={({ field }) => (
//                             <FormItem>
//                               <FormLabel>Other Country and Port Details</FormLabel>
//                               <FormControl>
//                                 <Input placeholder="Enter additional details" {...field} />
//                               </FormControl>
//                               <FormMessage />
//                             </FormItem>
//                           )}
//                         />
//                       </motion.div>
//                     )}
//                   </motion.div>
//                 )}

//                 {planType === "roro" && (
//                   <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     className="space-y-4"
//                   >
//                     <FormField
//                       control={form.control}
//                       name="country"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel className="text-red-500">Country (Required)</FormLabel>
//                           <FormControl>
//                             <Input placeholder="Enter country" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />

//                     <FormField
//                       control={form.control}
//                       name="port"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel className="text-red-500">Port (Required)</FormLabel>
//                           <FormControl>
//                             <Input placeholder="Enter port" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </motion.div>
//                 )}
//               </motion.div>
//             )}

//             {step === 2 && planType === "container" && (
//               <motion.div
//                 initial={{ opacity: 0, x: 20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: -20 }}
//                 className="space-y-6"
//               >
//                 <div className="space-y-4">
//                   <h3 className="text-lg font-medium">Services Before Shipping</h3>
//                   {services.map((service) => (
//                     <div key={service.id} className="flex items-center space-x-2">
//                       <input
//                         type="checkbox"
//                         id={service.id}
//                         value={service.id}
//                         {...form.register("services")}
//                         className="rounded border-gray-300"
//                       />
//                       <label htmlFor={service.id} className="flex-1">
//                         {service.label}
//                         <span className="text-sm text-gray-500 ml-2">
//                           ({service.price})
//                         </span>
//                       </label>
//                     </div>
//                   ))}
//                 </div>

//                 <FormField
//                   control={form.control}
//                   name="inspectionAgency"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Export Inspection Agency</FormLabel>
//                       <FormControl>
//                         <div className="grid grid-cols-3 gap-4">
//                           {inspectionAgencies.map((agency) => (
//                             <div
//                               key={agency.value}
//                               onClick={() => field.onChange(agency.value)}
//                               className={`
//                                 p-4 rounded-lg border-2 cursor-pointer text-center transition-all
//                                 ${field.value === agency.value 
//                                   ? 'border-blue-500 bg-blue-50' 
//                                   : 'border-gray-200 hover:border-blue-200'
//                                 }
//                               `}
//                             >
//                               {agency.label}
//                             </div>
//                           ))}
//                         </div>
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="remarks"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Remarks</FormLabel>
//                       <FormControl>
//                         <Textarea 
//                           placeholder="Enter any additional remarks"
//                           className="min-h-[100px]"
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="photoDetails"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Details of your Request for Photos</FormLabel>
//                       <FormControl>
//                         <Textarea 
//                           placeholder="Enter details for photo requests"
//                           className="min-h-[100px]"
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </motion.div>
//             )}

//             <div className="flex justify-between pt-4 border-t">
//               {step === 2 && (
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => {
//                     setStep(1)
//                     setFormError(null)
//                   }}
//                   disabled={submitting}
//                 >
//                   Previous
//                 </Button>
//               )}
              
//               {step === 1 && planType === "container" && containerType && (
//                 <Button
//                   type="button"
//                   onClick={handleNext}
//                   disabled={submitting}
//                 >
//                   Next
//                 </Button>
//               )}

//               {((step === 1 && planType === "roro") || 
//                 (step === 2 && planType === "container")) && (
//                 <Button 
//                   type="submit"
//                   disabled={submitting || 
//                     (planType === "roro" && (!form.getValues("country") || !form.getValues("port")))
//                   }
//                   className="relative"
//                 >
//                   {submitting ? (
//                     <>
//                       <span className="opacity-0">Confirm Order</span>
//                       <motion.div 
//                         className="absolute inset-0 flex items-center justify-center"
//                         animate={{ rotate: 360 }}
//                         transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//                       >
//                         <AlertCircle className="h-5 w-5" />
//                       </motion.div>
//                     </>
//                   ) : (
//                     "Confirm Order"
//                   )}
//                 </Button>
//               )}
//             </div>
//           </form>
//         </Form>
//       </div>
//     </motion.div>
//   )
// } 


import { ComingSoon } from "@/components/ui/coming-soon"

export default function CreateOrderPage() {
  return (
    <ComingSoon 
      title="Create Order - Coming Soon"
      message="Our order creation system is being developed to provide you with a seamless shipping experience."
    />
  )
}