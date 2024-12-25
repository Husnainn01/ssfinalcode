"use client"

import Breadcrumbs from '@/components/ui/breadcrumbs'
import { 
  FileText, 
  Scale, 
  ShieldCheck, 
  AlertCircle, 
  UserCheck, 
  Globe, 
  CreditCard,
  MessageSquare,
  HelpCircle
} from 'lucide-react'
import Link from 'next/link'

export default function TermsAndConditions() {
  const lastUpdated = '2024-03-20'
  
  const breadcrumbItems = [
    { label: 'Legal', href: '/legal' },
    { label: 'Terms and Conditions', href: '/legal/terms' }
  ]

  const sections = [
    {
      icon: UserCheck,
      title: "User Agreement",
      content: [
        "By accessing our website, you agree to these terms",
        "You must be at least 18 years old to use our services",
        "You are responsible for maintaining account security",
        "Accurate and current information is required",
        "Multiple accounts per user are not permitted"
      ]
    },
    {
      icon: Scale,
      title: "Legal Compliance",
      content: [
        "All transactions must comply with applicable laws",
        "Export and import regulations must be followed",
        "Tax obligations are the responsibility of users",
        "Anti-money laundering policies apply",
        "Compliance with trade sanctions required"
      ]
    },
    {
      icon: ShieldCheck,
      title: "Intellectual Property",
      content: [
        "All content is protected by copyright laws",
        "Trademarks and logos are our exclusive property",
        "Limited license for personal, non-commercial use",
        "No reproduction without written permission",
        "User-generated content rights and restrictions"
      ]
    },
    {
      icon: CreditCard,
      title: "Payment Terms",
      content: [
        "All prices are subject to change without notice",
        "Secure payment processing through verified providers",
        "Multiple payment methods accepted",
        "Refund and cancellation policies apply",
        "Currency conversion rates and fees may apply"
      ]
    },
    {
      icon: Globe,
      title: "Service Availability",
      content: [
        "Services available in specified regions only",
        "Right to modify or discontinue services",
        "No guarantee of continuous availability",
        "Maintenance windows and service updates",
        "Regional restrictions may apply"
      ]
    },
    {
      icon: AlertCircle,
      title: "Liability Limitations",
      content: [
        "Services provided 'as is' without warranties",
        "No liability for indirect or consequential damages",
        "Force majeure conditions",
        "Limitation of liability amount",
        "User indemnification obligations"
      ]
    }
  ]

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Terms and Conditions</h1>
          <p className="text-lg text-gray-600">
            Please read these terms and conditions carefully before using our services.
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
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">Need Clarification?</h2>
          <p className="mb-6 text-gray-600">
            If you have any questions about our terms and conditions, please contact our legal team.
          </p>
          <Link
            href="/contact-us"
            className="inline-flex items-center justify-center rounded-lg bg-[#629584] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[#4a7164] focus:outline-none focus:ring-2 focus:ring-[#629584] focus:ring-offset-2"
          >
            Contact Legal Team
          </Link>
        </div>
      </div>
    </div>
  )
} 