"use client"

import Breadcrumbs from '@/components/ui/breadcrumbs'
import { Shield, Lock, Eye, Bell, Share2, Trash2, Server, Settings, HelpCircle } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPolicy() {
  const lastUpdated = '2024-03-20'
  
  const breadcrumbItems = [
    { label: 'Legal', href: '/legal' },
    { label: 'Privacy Policy', href: '/legal/privacy' }
  ]

  const sections = [
    {
      icon: Shield,
      title: "Information We Collect",
      content: [
        "Personal identification information (Name, email address, phone number, etc.)",
        "Payment information and transaction history",
        "Device and browser information",
        "Usage data and preferences",
        "Communication history and preferences"
      ]
    },
    {
      icon: Lock,
      title: "How We Protect Your Data",
      content: [
        "Industry-standard encryption protocols",
        "Regular security audits and updates",
        "Strict access controls and authentication",
        "Secure data storage and backup systems",
        "Compliance with international security standards"
      ]
    },
    {
      icon: Eye,
      title: "How We Use Your Information",
      content: [
        "To provide and maintain our services",
        "To process your transactions and requests",
        "To send important service updates and notifications",
        "To improve our website and user experience",
        "To comply with legal obligations"
      ]
    },
    {
      icon: Share2,
      title: "Information Sharing",
      content: [
        "We never sell your personal information",
        "Limited sharing with service providers",
        "Legal requirements and law enforcement",
        "With your explicit consent only",
        "Anonymous aggregated data for analytics"
      ]
    },
    {
      icon: Bell,
      title: "Your Privacy Choices",
      content: [
        "Control your communication preferences",
        "Opt-out of marketing communications",
        "Access and update your personal information",
        "Request data deletion",
        "Manage cookie preferences"
      ]
    },
    {
      icon: Trash2,
      title: "Data Retention",
      content: [
        "Data kept only as long as necessary",
        "Regular review of stored information",
        "Secure data disposal procedures",
        "Archive policies for legal requirements",
        "User-initiated data deletion options"
      ]
    }
  ]

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-lg text-gray-600">
            Your privacy is important to us. This policy outlines how we collect, use, and protect your personal information.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Last updated: {new Date(lastUpdated).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
        
        <div className="space-y-12">
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
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">Have Questions?</h2>
          <p className="mb-6 text-gray-600">
            If you have any questions about our privacy policy or how we handle your data, please don't hesitate to contact us.
          </p>
          <Link
            href="/contact-us"
            className="inline-flex items-center justify-center rounded-lg bg-[#629584] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[#4a7164] focus:outline-none focus:ring-2 focus:ring-[#629584] focus:ring-offset-2"
          >
            Contact Our Privacy Team
          </Link>
        </div>
      </div>
    </div>
  )
} 