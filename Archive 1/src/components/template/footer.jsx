'use client'

import { useState } from 'react'
import { Facebook, Twitter, Instagram, Youtube, Smartphone, MapPin, Phone, Mail, LinkedinIcon, GithubIcon, TwitchIcon } from "lucide-react"
import Image from 'next/image'
import countries from '@/data/countries.json'

export default function Footer() {
  const [email, setEmail] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Subscribe:', email)
  }

  return (
    <footer className="bg-[#243642] text-white">
      {/* Newsletter Bar with Enhanced UI */}
      <div className="border-b border-gray-700 bg-[#2d4050] py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:text-left">
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-wide">Subscribe to our newsletter</span>
            <span className="text-sm text-gray-300">Get exclusive deals and early access to new vehicles</span>
          </div>
          <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full rounded-lg border border-gray-600 bg-gray-800 px-10 py-2.5 text-sm text-white placeholder:text-gray-400 focus:border-[#F47B20] focus:outline-none focus:ring-2 focus:ring-[#F47B20] focus:ring-opacity-20"
                required
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-[#629584] px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#4a7164] focus:outline-none focus:ring-2 focus:ring-[#629584] focus:ring-opacity-50 active:scale-95"
            >
              Subscribe
            </button>
          </form>
          <a href="#" className="text-sm text-[#E2F1E7] transition-colors hover:text-[#629584] hover:underline">
            Privacy Policy
          </a>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Logo and Contact Section */}
        <div className="mb-12 grid gap-8 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="mb-8">
              <Image
                src="/sss-logo.png"
                alt="SS Holdings"
                width={300}
                height={100}
                className="h-[100px] w-auto object-contain"
                priority
              />
            </div>
            <div className="space-y-8">
              <div className="flex gap-4 pt-4">
                {[
                  { 
                    icon: Facebook, 
                    href: "https://facebook.com",
                    label: "Facebook",
                    color: "#1877F2",
                    hoverBg: "#1864D9"
                  },
                  { 
                    icon: Twitter, 
                    href: "https://twitter.com",
                    label: "Twitter",
                    color: "#1DA1F2",
                    hoverBg: "#1A8CD8"
                  },
                  { 
                    icon: Instagram, 
                    href: "https://instagram.com",
                    label: "Instagram",
                    color: "#E4405F",
                    hoverBg: "#D62E4C"
                  },
                  { 
                    icon: Youtube, 
                    href: "https://youtube.com",
                    label: "Youtube",
                    color: "#FF0000",
                    hoverBg: "#DC0000"
                  }
                ].map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow us on ${social.label}`}
                    className="group relative"
                  >
                    <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#629584] to-[#E2F1E7] opacity-0 blur transition duration-300 group-hover:opacity-100" />
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 transition-all duration-300 ease-out group-hover:bg-[#629584]">
                      <social.icon 
                        className="h-5 w-5 text-[#E2F1E7] transition-all duration-300 ease-out group-hover:text-white group-hover:scale-110" 
                      />
                      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 transform rounded-md bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        {social.label}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
              <div className="space-y-4 text-sm text-[#E2F1E7]">
                <div className="flex items-start gap-3 group">
                  <div className="relative">
                    <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#629584] to-[#E2F1E7] opacity-0 blur transition duration-300 group-hover:opacity-100" />
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 transition-all duration-300 group-hover:bg-gray-700">
                      <MapPin className="h-5 w-5 text-white transition-all duration-300 group-hover:text-[#629584] group-hover:scale-110" />
                    </div>
                  </div>
                  <p className="leading-relaxed pt-2">Aichi Ken Nagoya Shi Minati Ku Nishifukuta 1-1506</p>
                </div>

                <div className="flex items-center gap-3 group">
                  <div className="relative">
                    <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#629584] to-[#E2F1E7] opacity-0 blur transition duration-300 group-hover:opacity-100" />
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 transition-all duration-300 group-hover:bg-gray-700">
                      <Phone className="h-5 w-5 text-white transition-all duration-300 group-hover:text-[#629584] group-hover:scale-110" />
                    </div>
                  </div>
                  <a href="tel:+81052-387-9772" className="pt-2 hover:text-[#629584] transition-colors">
                    +81 052-387-9772
                  </a>
                </div>

                <div className="flex items-center gap-3 group">
                  <div className="relative">
                    <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#629584] to-[#E2F1E7] opacity-0 blur transition duration-300 group-hover:opacity-100" />
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 transition-all duration-300 group-hover:bg-gray-700">
                      <Mail className="h-5 w-5 text-white transition-all duration-300 group-hover:text-[#629584] group-hover:scale-110" />
                    </div>
                  </div>
                  <a href="mailto:csd@ss.Holdings" className="pt-2 hover:text-[#629584] transition-colors">
                    csd@ss.Holdings
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Grid with Enhanced Styling */}
          <div className="grid grid-cols-1 gap-8 md:col-span-8 md:grid-cols-5">
            {/* Browse Stock Column */}
            <div>
              <h6 className="mb-6 text-lg font-semibold text-[#629584]">Browse Stock</h6>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="group inline-flex items-center text-[#E2F1E7] transition-all hover:text-[#629584]">
                    <span className="translate-x-0 transition-transform group-hover:translate-x-1">Browse All Cars</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="group inline-flex items-center text-[#E2F1E7] transition-all hover:text-[#629584]">
                    <span className="translate-x-0 transition-transform group-hover:translate-x-1">New Arrivals</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="group inline-flex items-center text-[#E2F1E7] transition-all hover:text-[#629584]">
                    <span className="translate-x-0 transition-transform group-hover:translate-x-1">Featured Vehicles</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="group inline-flex items-center text-[#E2F1E7] transition-all hover:text-[#629584]">
                    <span className="translate-x-0 transition-transform group-hover:translate-x-1">Special Offers</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Countries Column */}
            <div>
              <h6 className="mb-6 text-lg font-semibold text-[#629584]">Popular Markets</h6>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="group inline-flex items-center text-[#E2F1E7] transition-all hover:text-[#629584]">
                    <span className="translate-x-0 transition-transform group-hover:translate-x-1">United Kingdom</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="group inline-flex items-center text-[#E2F1E7] transition-all hover:text-[#629584]">
                    <span className="translate-x-0 transition-transform group-hover:translate-x-1">European Union</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="group inline-flex items-center text-[#E2F1E7] transition-all hover:text-[#629584]">
                    <span className="translate-x-0 transition-transform group-hover:translate-x-1">United States</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="group inline-flex items-center text-[#E2F1E7] transition-all hover:text-[#629584]">
                    <span className="translate-x-0 transition-transform group-hover:translate-x-1">Asia Pacific</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="group inline-flex items-center text-[#E2F1E7] transition-all hover:text-[#629584]">
                    <span className="translate-x-0 transition-transform group-hover:translate-x-1">Middle East</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Quick Links Column */}
            <div>
              <h6 className="mb-6 text-lg font-semibold text-[#629584]">Quick Links</h6>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="group inline-flex items-center text-[#E2F1E7] transition-all hover:text-[#629584]">
                    <span className="translate-x-0 transition-transform group-hover:translate-x-1">About Us</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="group inline-flex items-center text-[#E2F1E7] transition-all hover:text-[#629584]">
                    <span className="translate-x-0 transition-transform group-hover:translate-x-1">Our Services</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="group inline-flex items-center text-[#E2F1E7] transition-all hover:text-[#629584]">
                    <span className="translate-x-0 transition-transform group-hover:translate-x-1">Contact Us</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="group inline-flex items-center text-[#E2F1E7] transition-all hover:text-[#629584]">
                    <span className="translate-x-0 transition-transform group-hover:translate-x-1">FAQ</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="group inline-flex items-center text-[#E2F1E7] transition-all hover:text-[#629584]">
                    <span className="translate-x-0 transition-transform group-hover:translate-x-1">Blog</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Customer Support Column */}
            <div>
              <h6 className="mb-6 text-lg font-semibold text-[#629584]">Customer Support</h6>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="group inline-flex items-center text-[#E2F1E7] transition-all hover:text-[#629584]">
                    <span className="translate-x-0 transition-transform group-hover:translate-x-1">Help Center</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="group inline-flex items-center text-[#E2F1E7] transition-all hover:text-[#629584]">
                    <span className="translate-x-0 transition-transform group-hover:translate-x-1">Shipping Information</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="group inline-flex items-center text-[#E2F1E7] transition-all hover:text-[#629584]">
                    <span className="translate-x-0 transition-transform group-hover:translate-x-1">Track Your Order</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="group inline-flex items-center text-[#E2F1E7] transition-all hover:text-[#629584]">
                    <span className="translate-x-0 transition-transform group-hover:translate-x-1">Returns & Refunds</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="group inline-flex items-center text-[#E2F1E7] transition-all hover:text-[#629584]">
                    <span className="translate-x-0 transition-transform group-hover:translate-x-1">24/7 Support</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Stock by Country Column */}
            <div>
              <h6 className="mb-6 text-lg font-semibold text-[#629584]">Stock by Country</h6>
              <ul className="space-y-3 text-sm">
                {countries.slice(0, 5).map((country) => (
                  <li key={country.code}>
                    <a href="#" className="group inline-flex items-center text-[#E2F1E7] transition-all hover:text-[#629584]">
                      <span className="mr-2">{country.flag}</span>
                      <span className="translate-x-0 transition-transform group-hover:translate-x-1">{country.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Copyright Bar */}
      <div className="bg-[#1A1A1A] py-6 text-sm">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center md:flex-row md:text-left">
          <div className="text-gray-400">
            © {new Date().getFullYear()} SS Holdings CO.,LTD. All rights reserved.
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-gray-400">
            {[
              { label: "Terms & Conditions", href: "/legal/terms" },
              { label: "Privacy Policy", href: "/legal/privacy" },
              { label: "Disclaimer", href: "/legal/disclaimer" },
              { label: "Site Map", href: "/sitemap" }
            ].map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="transition-colors hover:text-[#F47B20]"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}