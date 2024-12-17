/* Cars page filter */

'use client'

import { useState, useEffect } from 'react'
import { Button } from "@nextui-org/react"
import { Select, SelectItem } from "@nextui-org/react"
import { useRouter, useSearchParams } from 'next/navigation'

export default function FilterList({ onFilterChange, size = "default" }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Initialize state from URL parameters
  const [filters, setFilters] = useState({
    make: searchParams.get('make') || '',
    model: searchParams.get('model') || '',
    price: searchParams.get('price') || '',
    type: searchParams.get('type') || '',
    steering: searchParams.get('steering') || '',
    yearFrom: searchParams.get('yearFrom') || '',
    yearTo: searchParams.get('yearTo') || ''
  })

  const [totalItems, setTotalItems] = useState(0)
  const [availableOptions, setAvailableOptions] = useState({
    makes: [],
    models: [],
    types: [],
    priceRanges: [],
    steerings: []
  })

  const fetchFilteredCount = async (params) => {
    try {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`/api/cars/count?${queryString}`);
        const data = await response.json();
        if (response.ok) {
            setTotalItems(data.count || 0);
            if (data.makes) setAvailableOptions(prev => ({ ...prev, makes: data.makes }));
            if (data.models) setAvailableOptions(prev => ({ ...prev, models: data.models }));
            if (data.types) setAvailableOptions(prev => ({ ...prev, types: data.types }));
            if (data.steering) setAvailableOptions(prev => ({ ...prev, steerings: data.steering }));
            if (data.priceRanges) setAvailableOptions(prev => ({ ...prev, priceRanges: data.priceRanges }));
        }
    } catch (error) {
        console.error('Error fetching count:', error);
        setTotalItems(0);
    }
  };

  const fetchOptions = async () => {
    try {
      const response = await fetch('/api/cars/filter-options');
      const data = await response.json();
      
      if (response.ok) {
        setAvailableOptions({
          makes: data.makes || [],
          models: data.models || [],
          types: data.types || [],
          steerings: data.steering || [],
          priceRanges: data.priceRanges || []
        });
      }
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  // Initial load - fetch options and counts based on URL params
  useEffect(() => {
    fetchOptions();
    fetchFilteredCount(filters);
  }, []);

  // Update filters when URL changes
  useEffect(() => {
    const newFilters = {
      make: searchParams.get('make') || '',
      model: searchParams.get('model') || '',
      price: searchParams.get('price') || '',
      type: searchParams.get('type') || '',
      steering: searchParams.get('steering') || '',
      yearFrom: searchParams.get('yearFrom') || '',
      yearTo: searchParams.get('yearTo') || ''
    };
    setFilters(newFilters);
    fetchFilteredCount(newFilters);
  }, [searchParams]);

  const handleSearch = () => {
    // Filter out empty values
    const filteredParams = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '')
    );
    
    const queryString = new URLSearchParams(filteredParams).toString();
    router.push(`/cars?${queryString}`);
  };

  // Define size classes
  const sizeClasses = {
    small: {
      container: "p-3 rounded-lg",
      grid: "grid-cols-1 md:grid-cols-2 gap-3",
      heading: "text-base mb-3",
      inputGroup: "space-y-1.5",
      label: "text-xs",
      matchCount: "text-base",
    },
    default: {
      container: "p-4 rounded-lg",
      grid: "grid-cols-1 md:grid-cols-3 gap-4",
      heading: "text-lg mb-4",
      inputGroup: "space-y-2",
      label: "text-sm",
      matchCount: "text-lg",
    },
    large: {
      container: "p-6 rounded-lg",
      grid: "grid-cols-1 md:grid-cols-3 gap-6",
      heading: "text-xl mb-6",
      inputGroup: "space-y-3",
      label: "text-base",
      matchCount: "text-xl",
    }
  }[size]

  return (
    <div className="bg-theme-secondary p-3 rounded-lg shadow-md w-[calc(100%-50px)] mx-auto my-4">
      <div className="flex items-center text-white font-semibold mb-2">
        <span className="mr-2">🔍</span>
        SEARCH FOR CARS
      </div>
      
      <div className="grid grid-cols-4 gap-x-3 gap-y-2">
        <div>
          <label className="text-white text-xs mb-1 block">Make</label>
          <Select 
            placeholder="Select make"
            value={filters.make}
            onChange={(e) => setFilters({...filters, make: e.target.value})}
            classNames={{
              base: "max-h-[32px]",
              trigger: "bg-white min-h-unit-7 py-0",
              value: "text-default-700 text-small"
            }}
            size="sm"
          >
            {availableOptions.makes && availableOptions.makes.length > 0 ? (
              availableOptions.makes.map(make => (
                <SelectItem key={make.value} value={make.value}>
                  {make.label}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="" disabled>No makes available</SelectItem>
            )}
          </Select>
        </div>

        <div>
          <label className="text-white text-xs mb-1 block">Model</label>
          <Select 
            placeholder="Select model"
            value={filters.model}
            onChange={(e) => setFilters({...filters, model: e.target.value})}
            classNames={{
              base: "max-h-[32px]",
              trigger: "bg-white min-h-unit-7 py-0",
              value: "text-default-700 text-small"
            }}
            size="sm"
          >
            {availableOptions.models && availableOptions.models.length > 0 ? (
              availableOptions.models.map(model => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="" disabled>No models available</SelectItem>
            )}
          </Select>
        </div>

        <div>
          <label className="text-white text-xs mb-1 block">Type</label>
          <Select 
            placeholder="Select type"
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            classNames={{
              base: "max-h-[32px]",
              trigger: "bg-white min-h-unit-7 py-0",
              value: "text-default-700 text-small"
            }}
            size="sm"
          >
            {availableOptions.types.length > 0 ? (
              availableOptions.types.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="" disabled>No types available</SelectItem>
            )}
          </Select>
        </div>

        <div>
          <label className="text-white text-xs mb-1 block">Price Range</label>
          <Select 
            placeholder="Select price"
            value={filters.price}
            onChange={(e) => setFilters({...filters, price: e.target.value})}
            classNames={{
              base: "max-h-[32px]",
              trigger: "bg-white min-h-unit-7 py-0",
              value: "text-default-700 text-small"
            }}
            size="sm"
          >
            {availableOptions.priceRanges.length > 0 ? (
              availableOptions.priceRanges.map(range => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="" disabled>No price ranges available</SelectItem>
            )}
          </Select>
        </div>

        <div>
          <label className="text-white text-xs mb-1 block">Steering</label>
          <Select 
            placeholder="Select steering"
            value={filters.steering}
            onChange={(e) => setFilters({...filters, steering: e.target.value})}
            classNames={{
              base: "max-h-[32px]",
              trigger: "bg-white min-h-unit-7 py-0",
              value: "text-default-700 text-small"
            }}
            size="sm"
          >
            {availableOptions.steerings && availableOptions.steerings.length > 0 ? (
              availableOptions.steerings.map(steering => (
                <SelectItem key={steering.value} value={steering.value}>
                  {steering.label}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="" disabled>No steering options available</SelectItem>
            )}
          </Select>
        </div>

        <div>
          <label className="text-white text-xs mb-1 block">Year From</label>
          <Select 
            placeholder="Select year"
            value={filters.yearFrom}
            onChange={(e) => setFilters({...filters, yearFrom: e.target.value})}
            classNames={{
              base: "max-h-[32px]",
              trigger: "bg-white min-h-unit-7 py-0",
              value: "text-default-700 text-small"
            }}
            size="sm"
          >
            {Array.from({length: 24}, (_, i) => 2000 + i).map(year => (
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            ))}
          </Select>
        </div>

        <div>
          <label className="text-white text-xs mb-1 block">Year To</label>
          <Select 
            placeholder="Select year"
            value={filters.yearTo}
            onChange={(e) => setFilters({...filters, yearTo: e.target.value})}
            classNames={{
              base: "max-h-[32px]",
              trigger: "bg-white min-h-unit-7 py-0",
              value: "text-default-700 text-small"
            }}
            size="sm"
          >
            {Array.from({length: 24}, (_, i) => 2000 + i).map(year => (
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            ))}
          </Select>
        </div>

        <div className="bg-white p-2 rounded-lg">
          <div className="text-theme-secondary font-bold text-sm mb-1">
            {totalItems.toLocaleString()} items match
          </div>
          <Button 
            className="w-full bg-theme-secondary hover:bg-theme-secondary-hover text-white h-[28px]"
            size="sm"
            onClick={handleSearch}
          >
            Search
          </Button>
        </div>
      </div>
    </div>
  )
}