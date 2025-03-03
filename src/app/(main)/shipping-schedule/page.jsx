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
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'

// Mobile version of the entire page
function MobileShippingSchedule({ 
  regions, 
  filters, 
  handleFilterChange, 
  handleSearch, 
  handleReset, 
  schedules, 
  searchError, 
  searchLoading 
}) {
  return (
    <div className="min-h-screen p-4">
      {/* Mobile Download Card */}
      <Card className="mb-4 border-none shadow-md bg-white/80 backdrop-blur-sm">
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <Ship className="h-5 w-5 text-gray-700 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Looking for More Options?
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Download our complete schedule document for additional routes.
              </p>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => window.open('/path-to-your-pdf.pdf', '_blank')}
              >
                Download Schedule
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Mobile Filter Card */}
      <Card className="mb-4 border-none shadow-md bg-white/80 backdrop-blur-sm">
        <div className="p-4">
          <form onSubmit={handleSearch}>
            <div className="space-y-4">
              {/* Region Selection */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Region
                </label>
                <Select
                  value={filters.region}
                  onValueChange={(value) => handleFilterChange('region', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Voyage Number */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Voyage Number
                </label>
                <Input
                  placeholder="Enter voyage number"
                  value={filters.voyageNo}
                  onChange={(e) => handleFilterChange('voyageNo', e.target.value)}
                />
              </div>

              {/* Ship Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Ship Name
                </label>
                <Input
                  placeholder="Enter ship name"
                  value={filters.shipName}
                  onChange={(e) => handleFilterChange('shipName', e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <Button 
                  type="submit"
                  className="w-full"
                  disabled={searchLoading}
                >
                  {searchLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Search
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Card>

      {/* Mobile Results Card */}
      <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Available Schedules</h2>
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
            <div className="space-y-4">
              {schedules.map((schedule, index) => (
                <div 
                  key={`${schedule.voyageNo}-${index}`}
                  className="border rounded-lg p-4"
                >
                  {/* Basic Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="font-medium">VOY NO:</span>
                      <span>{schedule.voyageNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Ship Company:</span>
                      <span>{schedule.shipCompany}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Ship Name:</span>
                      <span>{schedule.shipName}</span>
                    </div>
                  </div>

                  {/* Ports Accordion */}
                  <details>
                    <summary className="cursor-pointer text-blue-600 font-medium">
                      View Port Schedule
                    </summary>
                    <div className="mt-4 space-y-4">
                      {/* Japan Ports */}
                      <div>
                        <h4 className="font-medium text-sm bg-blue-50/50 p-2">Japan Ports</h4>
                        <div className="mt-2">
                          {Object.entries(schedule.ports || {})
                            .filter(([port]) => [
                              'YOKOHAMA', 'KISARAZU', 'KAWASAKI', 'HITACHINAKA',
                              'HAKATA', 'KANDA', 'FUKUOKA', 'KOBE', 'MOJI',
                              'NAGOYA', 'AICHI', 'OSAKA', 'SAKAI', 'SHIMONOSEKI',
                              'TOYAMA'
                            ].includes(port))
                            .map(([port, date]) => date && (
                              <div key={port} className="flex justify-between py-2 border-b text-sm">
                                <span>{port}</span>
                                <span>{new Date(date).toLocaleDateString()}</span>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Destination Ports */}
                      <div>
                        <h4 className="font-medium text-sm bg-green-50/50 p-2">Destination Ports</h4>
                        <div className="mt-2">
                          {Object.entries(schedule.ports || {})
                            .filter(([port]) => [
                              'MOMBASA', 'MAPUTO', 'DURBAN', 'DAR ES SALAAM',
                              'TEMA', 'LAGOS', 'ADELAIDE'
                            ].includes(port))
                            .map(([port, date]) => date && (
                              <div key={port} className="flex justify-between py-2 border-b text-sm">
                                <span>{port}</span>
                                <span>{new Date(date).toLocaleDateString()}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </details>
                </div>
              ))}
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
    </div>
  )
}

// Main ShippingSchedule Component (existing code remains exactly the same)
export default function ShippingSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regions, setRegions] = useState([]);
  const [ports, setPorts] = useState({ departure: [], arrival: [] });
  const [loadingPorts, setLoadingPorts] = useState(false);
  const [portsError, setPortsError] = useState(null);

  const [filters, setFilters] = useState({
    region: '',
    voyageNo: '',
    shipName: '',
    departurePort: '',
    arrivalPort: '',
    dateRange: null
  });

  // Fetch shipping data
  const fetchShippingData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/public/shipping?${queryParams}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setSchedules(data.schedules);
      setRegions(data.regions);
      setPorts(data.ports);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load shipping schedules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShippingData();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const breadcrumbItems = [
    { label: 'Shipping Schedule', href: '/shipping-schedule' }
  ]

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block">
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
                            date={filters.dateRange?.start}
                            setDate={(date) => handleFilterChange('dateRange.start', date)}
                            placeholder="From"
                          />
                          <DatePickerDemo
                            date={filters.dateRange?.end}
                            setDate={(date) => handleFilterChange('dateRange.end', date)}
                            placeholder="To"
                            fromDate={filters.dateRange?.start}
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
                      onClick={() => handleFilterChange('dateRange', null)}
                      className="border-gray-200 hover:bg-gray-50"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-theme-primary hover:bg-theme-primary/90"
                      onClick={(e) => {
                        e.preventDefault();
                        fetchShippingData();
                      }}
                      disabled={loading}
                    >
                      {loading ? (
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
                
                {error ? (
                  <div className="text-red-500 text-center py-4">{error}</div>
                ) : loading ? (
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
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <MobileShippingSchedule
          regions={regions}
          filters={filters}
          handleFilterChange={handleFilterChange}
          handleSearch={(e) => {
            e.preventDefault();
            fetchShippingData();
          }}
          handleReset={() => handleFilterChange('dateRange', null)}
          schedules={schedules}
          searchError={error}
          searchLoading={loading}
        />
      </div>
    </>
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