"use client";

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Ship, Anchor, MapPin, Calendar, Loader2, RotateCcw } from 'lucide-react'
import { DatePickerDemo } from "@/components/ui/date-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import LeftSidebar from "@/components/template/leftsidebar"
import RightSidebar from "@/components/template/rightsidebar"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

import Breadcrumbs from '@/components/ui/breadcrumbs'

export default function ShippingSchedule() {
  // State for regions
  const [regions, setRegions] = useState([])
  const [selectedRegion, setSelectedRegion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // State for filters
  const [filters, setFilters] = useState({
    region: '',
    voyageNo: '',
    shipName: '',
    departurePort: '',
    arrivalPort: '',
    departureDateFrom: null,
    departureDateTo: null,
    arrivalDateFrom: null,
    arrivalDateTo: null
  })

  // Add ports state
  const [ports, setPorts] = useState({
    departure: [],
    arrival: []
  })
  const [loadingPorts, setLoadingPorts] = useState(false)
  const [portsError, setPortsError] = useState(null)

  // Add schedules state
  const [schedules, setSchedules] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState(null)

  // Fetch regions on component mount
  useEffect(() => {
    const fetchRegions = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/shipping-schedule?action=getRegions')
        if (!response.ok) throw new Error('Failed to fetch regions')
        const data = await response.json()
        if (data.error) throw new Error(data.error)
        setRegions(data.regions)
      } catch (error) {
        console.error('Error fetching regions:', error)
        setError('Failed to load regions')
      } finally {
        setLoading(false)
      }
    }

    fetchRegions()
  }, [])

  // Fetch ports when region changes
  useEffect(() => {
    const fetchPorts = async () => {
      setLoadingPorts(true)
      setPortsError(null)

      try {
        // Fetch departure ports (Japan ports) - these remain constant
        const departurePorts = await fetch('/api/shipping-schedule?action=getPorts&portType=departure')
        const departureData = await departurePorts.json()
        
        // Fetch arrival ports based on selected region
        const arrivalPorts = await fetch(`/api/shipping-schedule?action=getPorts&portType=arrival&region=${filters.region}`)
        const arrivalData = await arrivalPorts.json()
        
        setPorts({
          departure: departureData.ports,
          arrival: arrivalData.ports
        })
      } catch (error) {
        console.error('Error fetching ports:', error)
        setPortsError('Failed to load ports')
      } finally {
        setLoadingPorts(false)
      }
    }

    fetchPorts()
  }, [filters.region]) // Add region dependency

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    if (field === 'region') {
      // Reset arrival port when region changes
      setFilters(prev => ({
        ...prev,
        region: value,
        arrivalPort: '' // Reset arrival port
      }))
    } else {
      setFilters(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault()
    setSearchLoading(true)
    setSearchError(null)

    try {
      // Build query string from filters
      const queryParams = new URLSearchParams({
        action: 'search',
        ...filters,
        departureDateFrom: filters.departureDateFrom?.toISOString() || '',
        departureDateTo: filters.departureDateTo?.toISOString() || '',
        arrivalDateFrom: filters.arrivalDateFrom?.toISOString() || '',
        arrivalDateTo: filters.arrivalDateTo?.toISOString() || ''
      })

      const response = await fetch(`/api/shipping-schedule?${queryParams}`)
      if (!response.ok) throw new Error('Failed to fetch schedules')
      
      const data = await response.json()
      console.log('Search response:', data)
      
      if (data.error) throw new Error(data.error)
      if (!data.schedules) throw new Error('No schedules data received')
      
      setSchedules(data.schedules)
    } catch (error) {
      console.error('Error searching schedules:', error)
      setSearchError('Failed to search schedules')
      setSchedules([])
    } finally {
      setSearchLoading(false)
    }
  }

  // Add reset function
  const handleReset = () => {
    // Reset all filters to initial state
    setFilters({
      region: '',
      voyageNo: '',
      shipName: '',
      departurePort: '',
      arrivalPort: '',
      departureDateFrom: null,
      departureDateTo: null,
      arrivalDateFrom: null,
      arrivalDateTo: null
    })
    // Clear search results
    setSchedules([])
    // Clear any errors
    setSearchError(null)
  }

  const breadcrumbItems = [
    { label: 'Shipping Schedule', href: '/shipping-schedule' }
  ]

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Sidebar */}
      <div className="w-[280px] shrink-0">
        <LeftSidebar />
      </div>

      <main className="flex-1 p-8">
        {/* Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Important Note Section */}
        <Card className="mb-6 border-none shadow-sm bg-white/95 backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Ship className="h-5 w-5 text-gray-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Looking for More Shipping Options?
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  For a comprehensive view of all available shipping schedules, including additional routes and vessel options, 
                  please download our complete schedule document. This detailed PDF includes extended scheduling information 
                  and alternative shipping route.
                </p>
                <Button 
                  variant="outline"
                  className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700 font-medium shadow-sm
                    transition-all duration-200 hover:border-gray-300"
                  onClick={() => window.open('/path-to-your-pdf.pdf', '_blank')}
                >
                  <svg 
                    className="w-4 h-4 mr-2" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    />
                  </svg>
                  Download Complete Schedule
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Filter Card */}
        <Card className="p-6 mb-8 border-none shadow-md bg-white/80 backdrop-blur-sm">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Region Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
                  <MapPin className="w-4 h-4 text-theme-primary" />
                  Region
                </label>
                <Select
                  value={filters.region}
                  onValueChange={(value) => handleFilterChange('region', value)}
                >
                  <SelectTrigger className="bg-white border-gray-200 hover:border-theme-primary/50 transition-colors">
                    <SelectValue placeholder="Select Region" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    {loading ? (
                      <SelectItem value="loading" disabled>Loading regions...</SelectItem>
                    ) : error ? (
                      <SelectItem value="error" disabled>{error}</SelectItem>
                    ) : (
                      regions.map(region => (
                        <SelectItem key={region.value} value={region.value}>
                          {region.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Voyage Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
                  <Ship className="w-4 h-4 text-theme-primary" />
                  Voyage Number
                </label>
                <Input
                  type="text"
                  placeholder="Enter voyage number"
                  value={filters.voyageNo}
                  onChange={(e) => handleFilterChange('voyageNo', e.target.value)}
                  className="bg-white border-gray-200"
                />
              </div>

              {/* Ship Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
                  <Anchor className="w-4 h-4 text-theme-primary" />
                  Ship Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter ship name"
                  value={filters.shipName}
                  onChange={(e) => handleFilterChange('shipName', e.target.value)}
                  className="bg-white border-gray-200"
                />
              </div>

              {/* Departure Port */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
                  <MapPin className="w-4 h-4 text-theme-primary" />
                  Departure Port
                </label>
                <Select
                  value={filters.departurePort}
                  onValueChange={(value) => handleFilterChange('departurePort', value)}
                  disabled={loadingPorts}
                >
                  <SelectTrigger className="bg-white border-gray-200 hover:border-theme-primary/50 transition-colors">
                    <SelectValue placeholder={
                      loadingPorts ? "Loading ports..." : "Select departure port"
                    } />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    {loadingPorts ? (
                      <SelectItem value="loading" disabled>Loading ports...</SelectItem>
                    ) : portsError ? (
                      <SelectItem value="error" disabled>{portsError}</SelectItem>
                    ) : ports.departure?.length === 0 ? (
                      <SelectItem value="no-ports" disabled>No ports available</SelectItem>
                    ) : (
                      ports.departure?.map(port => (
                        <SelectItem key={port.value} value={port.value}>
                          {port.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Arrival Port */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-gray-700">
                  <MapPin className="w-4 h-4 text-theme-primary" />
                  Arrival Port
                </label>
                <Select
                  value={filters.arrivalPort}
                  onValueChange={(value) => handleFilterChange('arrivalPort', value)}
                  disabled={loadingPorts}
                >
                  <SelectTrigger className="bg-white border-gray-200 hover:border-theme-primary/50 transition-colors">
                    <SelectValue placeholder={
                      loadingPorts ? "Loading ports..." : "Select arrival port"
                    } />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    {loadingPorts ? (
                      <SelectItem value="loading" disabled>Loading ports...</SelectItem>
                    ) : portsError ? (
                      <SelectItem value="error" disabled>{portsError}</SelectItem>
                    ) : ports.arrival?.length === 0 ? (
                      <SelectItem value="no-ports" disabled>No ports available</SelectItem>
                    ) : (
                      ports.arrival?.map(port => (
                        <SelectItem key={port.value} value={port.value}>
                          {port.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Section */}
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-theme-primary" />
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-6">
                  {/* Departure Date Range */}
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Departure</p>
                    <div className="grid grid-cols-2 gap-2">
                      <DatePickerDemo
                        date={filters.departureDateFrom}
                        setDate={(date) => handleFilterChange('departureDateFrom', date)}
                        placeholder="From"
                      />
                      <DatePickerDemo
                        date={filters.departureDateTo}
                        setDate={(date) => handleFilterChange('departureDateTo', date)}
                        placeholder="To"
                        fromDate={filters.departureDateFrom}
                      />
                    </div>
                  </div>
                  {/* Arrival Date Range */}
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Arrival</p>
                    <div className="grid grid-cols-2 gap-2">
                      <DatePickerDemo
                        date={filters.arrivalDateFrom}
                        setDate={(date) => handleFilterChange('arrivalDateFrom', date)}
                        placeholder="From"
                      />
                      <DatePickerDemo
                        date={filters.arrivalDateTo}
                        setDate={(date) => handleFilterChange('arrivalDateTo', date)}
                        placeholder="To"
                        fromDate={filters.arrivalDateFrom}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Search and Reset Buttons */}
              <div className="col-span-full flex justify-end gap-4">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="border-gray-200 hover:bg-gray-50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button 
                  type="submit"
                  className="bg-theme-primary hover:bg-theme-primary/90"
                  onClick={handleSearch}
                  disabled={searchLoading}
                >
                  {searchLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {/* Results Table Section */}
        <Card className="mt-8 border-none shadow-md bg-white/80 backdrop-blur-sm">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Available Schedules</h2>
              {schedules.length > 0 && (
                <p className="text-sm text-gray-500">
                  Found {schedules.length} schedule(s)
                </p>
              )}
            </div>
            
            {searchError ? (
              <div className="text-red-500 text-center py-4">{searchError}</div>
            ) : searchLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-600" />
                <p className="mt-2 text-gray-600">Searching schedules...</p>
              </div>
            ) : schedules.length > 0 ? (
              <div className="border rounded-md">
                <div className="overflow-x-auto" style={{ maxWidth: 'calc(100vw - 690px)' }}>
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="w-[120px] bg-gray-50">VOY NO</TableHead>
                        <TableHead className="w-[150px] bg-gray-50">Ship Company</TableHead>
                        <TableHead className="w-[150px] bg-gray-50">Ship Name</TableHead>
                        
                        {/* Japan Ports */}
                        <TableHead 
                          colSpan={15} 
                          className="text-center bg-blue-50/50 border-l border-gray-200"
                        >
                          Japan Ports
                        </TableHead>

                        {/* Destination Ports */}
                        <TableHead 
                          colSpan={7} 
                          className="text-center bg-green-50/50 border-l border-gray-200"
                        >
                          Destination Ports
                        </TableHead>
                      </TableRow>
                      
                      <TableRow>
                        <TableHead className="bg-gray-50"></TableHead>
                        <TableHead className="bg-gray-50"></TableHead>
                        <TableHead className="bg-gray-50"></TableHead>
                        
                        {/* Japan Port Names */}
                        {[
                          'YOKOHAMA', 'KISARAZU', 'KAWASAKI', 'HITACHINAKA',
                          'HAKATA', 'KANDA', 'FUKUOKA', 'KOBE', 'MOJI',
                          'NAGOYA', 'AICHI', 'OSAKA', 'SAKAI', 'SHIMONOSEKI',
                          'TOYAMA'
                        ].map((port) => (
                          <TableHead 
                            key={port} 
                            className="text-sm font-medium bg-gray-50 px-2 whitespace-nowrap w-[120px]"
                          >
                            {port}
                          </TableHead>
                        ))}

                        {/* Separator between TOYAMA and MOMBASA */}
                        <TableHead className="text-center bg-gray-100 px-2 w-[50px] font-bold">≫</TableHead>

                        {/* Destination Port Names */}
                        {[
                          'MOMBASA', 'MAPUTO', 'DURBAN', 'DAR ES SALAAM',
                          'TEMA', 'LAGOS', 'ADELAIDE'
                        ].map((port) => (
                          <TableHead 
                            key={port} 
                            className="text-sm font-medium bg-green-50/50 px-2 whitespace-nowrap w-[120px]"
                          >
                            {port}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    
                    <TableBody>
                      {schedules.map((schedule, index) => (
                        <TableRow 
                          key={`${schedule.voyageNo}-${index}`}
                          className="hover:bg-gray-50/50"
                        >
                          <TableCell className="font-medium w-[120px]">{schedule.voyageNo}</TableCell>
                          <TableCell className="w-[150px]">{schedule.shipCompany}</TableCell>
                          <TableCell className="w-[150px]">{schedule.shipName}</TableCell>
                          
                          {/* Japan Ports Dates */}
                          {[
                            'YOKOHAMA', 'KISARAZU', 'KAWASAKI', 'HITACHINAKA',
                            'HAKATA', 'KANDA', 'FUKUOKA', 'KOBE', 'MOJI',
                            'NAGOYA', 'AICHI', 'OSAKA', 'SAKAI', 'SHIMONOSEKI',
                            'TOYAMA'
                          ].map((port) => (
                            <TableCell key={port} className="text-center px-2 w-[120px]">
                              {schedule.ports?.[port] ? (
                                <span className="text-sm">
                                  {new Date(schedule.ports[port]).toLocaleDateString()}
                                </span>
                              ) : '-'}
                            </TableCell>
                          ))}

                          {/* Separator column */}
                          <TableCell className="bg-gray-100 w-[50px]">≫</TableCell>

                          {/* Destination Ports Dates */}
                          {[
                            'MOMBASA', 'MAPUTO', 'DURBAN', 'DAR ES SALAAM',
                            'TEMA', 'LAGOS', 'ADELAIDE'
                          ].map((port) => (
                            <TableCell key={port} className="text-center px-2 w-[120px] bg-green-50/10">
                              {schedule.ports?.[port] ? (
                                <span className="text-sm">
                                  {new Date(schedule.ports[port]).toLocaleDateString()}
                                </span>
                              ) : '-'}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {filters.region || filters.voyageNo || filters.shipName ? (
                  "No schedules found matching your search criteria."
                ) : (
                  "Use the filters above to search for shipping schedules."
                )}
              </div>
            )}
          </div>
        </Card>
      </main>

      {/* Right Sidebar */}
      <div className="w-[280px] shrink-0">
        <RightSidebar />
      </div>
    </div>
  )
}

{/* Add a style to constrain the main content */}
<style jsx>{`
  .overflow-x-auto {
    max-width: calc(100vw - 600px);
  }
  
  table {
    width: 100%;
    table-layout: fixed;
  }
  
  th, td {
    width: 120px;
    min-width: 120px;
  }
  
  th:first-child, td:first-child {
    width: 100px;
    min-width: 100px;
  }
`}</style>