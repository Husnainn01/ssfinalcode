"use client";

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Building, 
  CreditCard, 
  Landmark, 
  Globe, 
  ShieldCheck, 
  Copy,
  ChevronRight,
  MessageSquare
} from 'lucide-react'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import LeftSidebar from "@/components/template/leftsidebar"
import RightSidebar from "@/components/template/rightsidebar"
import Breadcrumbs from '@/components/ui/breadcrumbs'

export default function BankingInformation() {
  const [copied, setCopied] = useState('')

  const bankAccounts = [
    {
      bank: 'Japan Bank',
      accountName: 'SS Holdings Co., Ltd',
      accountNumber: '1234-5678-9012',
      swiftCode: 'JPBKJPJT',
      branch: 'Tokyo Main Branch',
      Icon: Building
    },
    {
      bank: 'International Bank',
      accountName: 'SS Holdings Co., Ltd',
      accountNumber: '9876-5432-1098',
      swiftCode: 'INTBJPJT',
      branch: 'Osaka Branch',
      Icon: Landmark
    }
  ]

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(''), 2000)
  }

  const breadcrumbItems = [
    { label: 'Banking', href: '/banking' }
  ]

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Sidebar */}
      <div className="hidden md:block md:w-1/5 lg:w-1/6 bg-white">
        <div className="sticky top-0">
          <LeftSidebar />
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full md:w-3/5 lg:w-4/6">
        {/* Enhanced Header Section */}
        <motion.header 
          className="bg-gradient-to-r from-[#14225D] to-[#1a2d7c] text-white py-12 md:py-24 px-4 relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <motion.div 
            className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ duration: 1 }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
          <div className="container mx-auto text-center relative z-10">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6 md:mb-8"
            >
              <Building className="w-12 h-12 md:w-16 md:h-16 mx-auto text-white/80" />
            </motion.div>
            <motion.h1 
              className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Banking Information
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto px-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              Secure and convenient payment options for our valued customers
            </motion.p>
          </div>
        </motion.header>

        {/* Add Breadcrumbs here */}
        <div className="container mx-auto px-4 py-4 bg-gray-50/50">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <div className="px-4 md:px-8 py-8 md:py-12 bg-gray-50/50">
          {/* Enhanced Important Notice */}
          <motion.div
            className="max-w-4xl mx-auto bg-gradient-to-r from-yellow-50 to-orange-50 p-4 md:p-6 rounded-2xl shadow-md border border-yellow-100 mb-8 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-start space-x-4">
              <div className="bg-yellow-100 rounded-xl p-2 md:p-3">
                <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-semibold text-yellow-800 mb-2">Important Notice</h3>
                <p className="text-sm md:text-base text-yellow-700">
                  Please verify all banking details before making any transfers. Contact our support team to confirm transaction details.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Bank Accounts Grid */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8 md:mb-16">
            {bankAccounts.map((account, index) => (
              <motion.div
                key={account.bank}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="group"
              >
                <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-[#14225D] to-[#1a2d7c] text-white p-4 md:p-6">
                    <CardTitle className="flex items-center space-x-4">
                      <div className="bg-white/10 rounded-xl p-2 group-hover:scale-110 transition-transform duration-300">
                        {account.Icon && <account.Icon className="w-5 h-5 md:w-6 md:h-6" />}
                      </div>
                      <span className="text-lg md:text-xl">{account.bank}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
                    {[
                      { label: 'Account Name', value: account.accountName },
                      { label: 'Account Number', value: account.accountNumber },
                      { label: 'Swift Code', value: account.swiftCode },
                      { label: 'Branch', value: account.branch },
                    ].map((detail) => (
                      <motion.div 
                        key={detail.label} 
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 md:p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 gap-2 sm:gap-4"
                        whileHover={{ x: 5 }}
                      >
                        <span className="text-gray-600 font-medium text-sm md:text-base">{detail.label}:</span>
                        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                          <span className="font-semibold text-gray-800 text-sm md:text-base">{detail.value}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(detail.value, `${account.bank}-${detail.label}`)}
                            className="hover:bg-gray-100 rounded-lg transition-all duration-200"
                          >
                            <Copy className={`w-4 h-4 ${copied === `${account.bank}-${detail.label}` ? 'text-green-500' : 'text-gray-400'}`} />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Enhanced Payment Guidelines */}
          <motion.section
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-[#14225D] text-center">Payment Guidelines</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-start space-x-4">
                      <div className="bg-[#14225D]/5 rounded-xl p-2 md:p-3">
                        <Globe className="w-5 h-5 md:w-6 md:h-6 text-[#14225D]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base md:text-lg mb-2 md:mb-3 text-[#14225D]">International Transfers</h3>
                        <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                          Please ensure all international transfers include your invoice number as reference.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-start space-x-4">
                      <div className="bg-[#14225D]/5 rounded-xl p-2 md:p-3">
                        <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-[#14225D]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base md:text-lg mb-2 md:mb-3 text-[#14225D]">Processing Time</h3>
                        <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                          Bank transfers typically process within 2-3 business days.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.section>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden md:block md:w-1/5 lg:w-1/6 bg-white">
        <div className="sticky top-0">
          <RightSidebar />
        </div>
      </div>
    </div>
  )
}
