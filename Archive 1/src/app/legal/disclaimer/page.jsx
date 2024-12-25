"use client"

import Breadcrumbs from '@/components/ui/breadcrumbs'
import { 
  AlertTriangle, 
  Car, 
  ExternalLink, 
  BookOpen, 
  ShieldAlert, 
  DollarSign,
  Scale,
  HelpCircle
} from 'lucide-react'
import Link from 'next/link'

export default function Disclaimer() {
  const lastUpdated = '2024-03-20'
  
  const breadcrumbItems = [
    { label: 'Legal', href: '/legal' },
    { label: 'Disclaimer', href: '/legal/disclaimer' }
  ]

  const sections = [
    {
      icon: AlertTriangle,
      title: "General Disclaimer",
      content: [
        "Information provided is for general purposes only",
        "No warranties or guarantees of any kind are made",
        "Content accuracy is not guaranteed",
        "Use of the website is at your own risk",
        "We reserve the right to modify content without notice"
      ]
    },
    {
      icon: Car,
      title: "Vehicle Information",
      content: [
        "Vehicle specifications may vary from descriptions",
        "Prices are subject to change without notice",
        "Availability of vehicles cannot be guaranteed",
        "Images may not reflect actual vehicle condition",
        "Mileage and condition details are approximate"
      ]
    },
    {
      icon: DollarSign,
      title: "Financial Information",
      content: [
        "Prices shown are estimates only",
        "Final pricing may include additional fees",
        "Currency conversions are approximate",
        "Financial advice should be sought from professionals",
        "Payment terms may vary by region"
      ]
    },
    {
      icon: ExternalLink,
      title: "External Links",
      content: [
        "We are not responsible for external website content",
        "Third-party links are provided for convenience only",
        "External sites have their own terms of use",
        "We do not endorse linked websites",
        "Users access external links at their own risk"
      ]
    },
    {
      icon: BookOpen,
      title: "Professional Advice",
      content: [
        "Content should not be considered professional advice",
        "Consult qualified professionals for specific guidance",
        "Legal advice should be sought when necessary",
        "Technical specifications should be verified",
        "Business decisions require independent assessment"
      ]
    },
    {
      icon: ShieldAlert,
      title: "Liability Limitations",
      content: [
        "We are not liable for any damages or losses",
        "Use of information is at your own discretion",
        "No responsibility for user actions or decisions",
        "Indirect damages are expressly disclaimed",
        "Local laws and regulations may apply"
      ]
    }
  ]

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Disclaimer</h1>
          <p className="text-lg text-gray-600">
            Important information about the limitations and terms of use for our website and services.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Last updated: {new Date(lastUpdated).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>

        <div className="space-y-8">
          {sections.map((section, index) => (
            <section 
              key={index}
              className="group rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:border-[#629584] hover:shadow-md"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="rounded-full bg-[#629584]/10 p-3 text-[#629584] group-hover:bg-[#629584] group-hover:text-white transition-colors">
                  <section.icon className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">{section.title}</h2>
              </div>
              <ul className="space-y-3 text-gray-600">
                {section.content.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#629584]" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 rounded-2xl border border-gray-200 bg-[#629584]/5 p-8 text-center">
          <HelpCircle className="mx-auto mb-4 h-8 w-8 text-[#629584]" />
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">Questions About Our Disclaimer?</h2>
          <p className="mb-6 text-gray-600">
            If you need clarification about any part of our disclaimer, our team is here to help.
          </p>
          <Link
            href="/contact-us"
            className="inline-flex items-center justify-center rounded-lg bg-[#629584] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[#4a7164] focus:outline-none focus:ring-2 focus:ring-[#629584] focus:ring-offset-2"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
} 