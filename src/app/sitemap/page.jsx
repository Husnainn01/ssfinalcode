"use client"

import Breadcrumbs from '@/components/ui/breadcrumbs'
import { 
  Home, 
  Car, 
  FileText, 
  HeadphonesIcon, 
  Globe, 
  Users, 
  ShoppingCart, 
  MessageSquare,
  MapPin,
  Settings,
  HelpCircle,
  Phone
} from 'lucide-react'



export default function Sitemap() {
  const lastUpdated = '2024-03-20'
  
  const breadcrumbItems = [
    { label: 'Sitemap', href: '/sitemap' }
  ]

  const sections = [
    {
      title: "Main Navigation",
      icon: Home,
      links: [
        { label: "Home", href: "/" },
        { label: "About Us", href: "/about" },
        { label: "Banking Information", href: "/banking" },
        { label: "How to Buy", href: "/how-to-buy" },
        { label: "FAQ", href: "/FAQ" },
        { label: "Contact Us", href: "/contact" }
      ]
    },
    {
      title: "Vehicle Inventory",
      icon: Car,
      links: [
        { label: "Browse All Cars", href: "/cars" },
        { label: "New Arrivals", href: "/cars" },
        { label: "Featured Vehicles", href: "/cars" },
        { label: "Special Offers", href: "/cars" }
      ]
    },
    {
      title: "Legal Information",
      icon: FileText,
      links: [
        { label: "Terms & Conditions", href: "/legal/terms" },
        { label: "Privacy Policy", href: "/legal/privacy" },
        { label: "Disclaimer", href: "/legal/disclaimer" },
      ]
    },
    {
      title: "Customer Support",
      icon: HeadphonesIcon,
      links: [
        { label: "Help Center", href: "/FAQ" },
        { label: "FAQ", href: "/FAQ" },
        { label: "Contact Support", href: "/contact" }
      ]
    },
    {
      title: "Regional Sites",
      icon: Globe,
      links: [
        { label: "Australia", href: "/cars/au" },
        { label: "United States", href: "/cars/us" },
        { label: "Bahamas", href: "/cars/bs" },
        { label: "Canda", href: "/cars/ca" },
        { label: "Chile", href: "/cars/cl" },
        { label: "Cyprus", href: "/cars/cy" },
        { label: "DR Congo", href: "/cars/cd" },
        { label: "Fiji", href: "/cars/fj" },
        { label: "Guyana", href: "/cars/gy" },
        { label: "ireland", href: "/cars/ie" },
        { label: "Jamica", href: "/cars/jm" },
        { label: "Kenya", href: "/cars/ke" },
        { label: "Mauritius", href: "/cars/mu" }
        
      ]
    },
    {
      title: "Company Info",
      icon: Users,
      links: [
        { label: "About Global Drive Motors", href: "/about" },
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="mx-auto max-w-7xl px-4">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Site Map</h1>
          <p className="text-lg text-gray-600">
            Find everything you need on our website with this comprehensive directory
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Last updated: {new Date(lastUpdated).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section, index) => (
            <div 
              key={index}
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-[#629584] hover:shadow-md"
            >
              <div className="mb-6 flex items-center gap-4">
                <div className="rounded-full bg-[#629584]/10 p-3 text-[#629584] group-hover:bg-[#629584] group-hover:text-white transition-colors">
                  <section.icon className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">{section.title}</h2>
              </div>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a 
                      href={link.href}
                      className="group/link flex items-center text-gray-600 hover:text-[#629584] transition-colors"
                    >
                      <span className="mr-2 h-1.5 w-1.5 rounded-full bg-[#629584]/50 group-hover/link:bg-[#629584]" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Quick Help Section */}
        <div className="mt-12 rounded-2xl border border-gray-200 bg-[#629584]/5 p-8 text-center">
          <HelpCircle className="mx-auto mb-4 h-8 w-8 text-[#629584]" />
          <h2 className="mb-4 text-2xl font-semibold text-gray-800">Can't Find What You're Looking For?</h2>
          <p className="mb-6 text-gray-600">
            Our customer support team is here to help you navigate our website and find exactly what you need.
          </p>
          <a
            href="/contact-us"
            className="inline-flex items-center justify-center rounded-lg bg-[#629584] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[#4a7164] focus:outline-none focus:ring-2 focus:ring-[#629584] focus:ring-offset-2"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
} 