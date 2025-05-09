'use client'
import { useState, useRef } from 'react'
import Breadcrumbs from '@/components/ui/breadcrumbs'
import { Turnstile } from '@marsidev/react-turnstile'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageSquare,
  Linkedin,
  Facebook,
  Instagram,
  Twitter
} from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  })
  const [status, setStatus] = useState({
    loading: false,
    error: null,
    success: false
  })
  const [turnstileToken, setTurnstileToken] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!turnstileToken) {
      setStatus({ 
        loading: false, 
        error: 'Please complete the security check', 
        success: false 
      })
      return
    }

    setStatus({ loading: true, error: null, success: false })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          to: 'support@ss-japan.com',
          turnstileToken
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to send message')
      }

      setStatus({ loading: false, error: null, success: true })
      setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' })
      setTurnstileToken(null)

      // Reset success message after 5 seconds
      setTimeout(() => {
        setStatus(prev => ({ ...prev, success: false }))
      }, 5000)

    } catch (error) {
      setStatus({ loading: false, error: error.message, success: false })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const breadcrumbItems = [
    { label: 'About', href: '/about' },
    { label: 'Contact Us', href: '/contact-us' }
  ]

  const contactMethods = [
    {
      icon: Phone,
      title: "Call Us",
      details: [
        "+1 (262) 598-4435",
        "Mon-Fri: 9:00 AM - 6:00 PM"
      ],
      action: "tel:+1 (262) 598-4435",
      actionText: "Call Now"
    },
    {
      icon: Mail,
      title: "Email Us",
      details: [
        "support@jdmglobal.com",
        "Support available 24/7"
      ],
      action: "mailto:support@jdmglobal.com",
      actionText: "Send Email"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: [
        "Nagoya, Japan",
        "Support available 24/7"
      ],
      action: "https://maps.google.com",
      actionText: "Get Directions"
    }
  ]

  const socialLinks = [
    { icon: Facebook, href: "https://www.facebook.com/profile.php?id=61573636123794", label: "Facebook" },
    { icon: Instagram, href: "https://www.instagram.com/jdmglobal", label: "Instagram" },
    { icon: Twitter, href: "https://www.twitter.com/jdmglobal", label: "Twitter" },
    { icon: Linkedin, href: "https://www.linkedin.com/company/jdmglobal", label: "LinkedIn" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="mb-8 md:mb-12 text-center">
          <h1 className="mb-3 md:mb-4 text-3xl md:text-4xl font-bold text-gray-900">Contact Us</h1>
          <p className="text-base md:text-lg text-gray-600 px-4">
            We're here to help and answer any questions you might have.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="mb-8 md:mb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {contactMethods.map((method, index) => (
            <div 
              key={index}
              className="group rounded-2xl border border-gray-200 bg-white p-6 md:p-8 text-center shadow-sm transition-all hover:border-[#629584] hover:shadow-md"
            >
              <div className="mx-auto mb-4 md:mb-6 rounded-full bg-[#629584]/10 p-3 md:p-4 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-[#629584] group-hover:bg-[#629584] group-hover:text-white transition-colors">
                <method.icon className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <h2 className="mb-3 md:mb-4 text-lg md:text-xl font-semibold text-gray-800">{method.title}</h2>
              {method.details.map((detail, detailIndex) => (
                <p key={detailIndex} className="text-sm md:text-base text-gray-600">{detail}</p>
              ))}
              <a
                href={method.action}
                className="mt-4 md:mt-6 inline-flex items-center justify-center rounded-lg border-2 border-[#629584] px-4 md:px-6 py-2 text-sm font-medium text-[#629584] transition-all hover:bg-[#629584] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#629584] focus:ring-offset-2 w-full md:w-auto"
              >
                {method.actionText}
              </a>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="mb-8 md:mb-16 rounded-2xl border border-gray-200 bg-white p-4 md:p-8 shadow-sm">
          <h2 className="mb-6 md:mb-8 text-center text-xl md:text-2xl font-semibold text-gray-800">Send Us a Message</h2>
          
          {status.success && (
            <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-700">
              Thank you for your message. We'll get back to you soon!
            </div>
          )}
          
          {status.error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
              {status.error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label htmlFor="firstName" className="mb-1 md:mb-2 block text-sm font-medium text-gray-700">First Name</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 md:px-4 py-2 text-sm md:text-base focus:border-[#629584] focus:outline-none focus:ring-2 focus:ring-[#629584]/20"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="mb-1 md:mb-2 block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 md:px-4 py-2 text-sm md:text-base focus:border-[#629584] focus:outline-none focus:ring-2 focus:ring-[#629584]/20"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="mb-1 md:mb-2 block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 md:px-4 py-2 text-sm md:text-base focus:border-[#629584] focus:outline-none focus:ring-2 focus:ring-[#629584]/20"
                required
              />
            </div>
            <div>
              <label htmlFor="subject" className="mb-1 md:mb-2 block text-sm font-medium text-gray-700">Subject</label>
              <input
                id="subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 md:px-4 py-2 text-sm md:text-base focus:border-[#629584] focus:outline-none focus:ring-2 focus:ring-[#629584]/20"
                required
              />
            </div>
            <div>
              <label htmlFor="message" className="mb-1 md:mb-2 block text-sm font-medium text-gray-700">Message</label>
              <textarea
                id="message"
                name="message"
                rows="4"
                value={formData.message}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 md:px-4 py-2 text-sm md:text-base focus:border-[#629584] focus:outline-none focus:ring-2 focus:ring-[#629584]/20"
                required
              ></textarea>
            </div>

            {/* Turnstile */}
            <div className="flex justify-center overflow-hidden">
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                onSuccess={setTurnstileToken}
                onError={() => {
                  setStatus({
                    loading: false,
                    error: 'Security check failed. Please try again.',
                    success: false
                  })
                }}
              />
            </div>

            <button
              type="submit"
              disabled={status.loading || !turnstileToken}
              className="w-full rounded-lg bg-[#629584] px-4 md:px-6 py-2 md:py-3 text-sm md:text-base font-medium text-white transition-all hover:bg-[#4a7164] focus:outline-none focus:ring-2 focus:ring-[#629584] focus:ring-offset-2 disabled:opacity-50"
            >
              {status.loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Social Links */}
        <div className="text-center">
          <h2 className="mb-4 md:mb-6 text-xl md:text-2xl font-semibold text-gray-800">Follow Us</h2>
          <div className="flex justify-center space-x-4 md:space-x-6">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                className="rounded-full bg-[#629584]/10 p-2 md:p-3 text-[#629584] transition-all hover:bg-[#629584] hover:text-white"
                aria-label={social.label}
              >
                <social.icon className="h-5 w-5 md:h-6 md:w-6" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}