'use client'

import { useState, useEffect } from 'react'
import { Button } from "@nextui-org/react"
import { Select, SelectItem } from "@nextui-org/react"
import { useRouter } from 'next/navigation'

export default function FilterList({ onFilterChange }) {
  const router = useRouter()
  const [searchParams, setSearchParams] = useState({
    make: '',
    model: '',
    price: '',
    type: '',
    steering: '',
    yearFrom: '',
    yearTo: ''
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

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(searchParams)
    }
    fetchFilteredCount(searchParams)
  }, [searchParams, onFilterChange])

  const handleSearch = async () => {
    // Filter out empty values
    const filteredParams = Object.fromEntries(
        Object.entries(searchParams).filter(([_, value]) => value !== '')
    );
    
    try {
        // First, update the URL with search params
        const queryString = new URLSearchParams(filteredParams).toString();
        router.push(`/cars?${queryString}`);

        // Then fetch filtered listings
        const response = await fetch(`/api/listing?${queryString}`);
        if (!response.ok) {
            throw new Error('Failed to fetch filtered listings');
        }
        
        const data = await response.json();
        if (onFilterChange) {
            onFilterChange(data); // Pass filtered results to parent component
        }
    } catch (error) {
        console.error('Error searching cars:', error);
    }
  };

  return (
    <div className="bg-[#387478] p-4 rounded-lg shadow-md">
      <div className="text-white font-semibold text-lg mb-4">
        <span className="mr-2">🔍</span>
        SEARCH FOR CARS
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-white text-sm mb-1 block">Make</label>
              <Select 
                placeholder="Select make"
                value={searchParams.make}
                onChange={(e) => setSearchParams({...searchParams, make: e.target.value})}
                className="w-full"
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
            <div className="flex-1">
              <label className="text-white text-sm mb-1 block">Model</label>
              <Select 
                placeholder="Select model"
                value={searchParams.model}
                onChange={(e) => setSearchParams({...searchParams, model: e.target.value})}
                className="w-full"
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
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-white text-sm mb-1 block">Type</label>
              <Select 
                placeholder="Select type"
                value={searchParams.type}
                onChange={(e) => setSearchParams({...searchParams, type: e.target.value})}
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
            <div className="flex-1">
              <label className="text-white text-sm mb-1 block">Price Range</label>
              <Select 
                placeholder="Select price"
                value={searchParams.price}
                onChange={(e) => setSearchParams({...searchParams, price: e.target.value})}
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
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-white text-sm mb-1 block">Steering</label>
              <Select 
                placeholder="Select steering"
                value={searchParams.steering}
                onChange={(e) => setSearchParams({...searchParams, steering: e.target.value})}
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
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-white text-sm mb-1 block">Year From</label>
              <Select 
                placeholder="Select year"
                value={searchParams.yearFrom}
                onChange={(e) => setSearchParams({...searchParams, yearFrom: e.target.value})}
              >
                {Array.from({length: 24}, (_, i) => 2000 + i).map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-white text-sm mb-1 block">Year To</label>
              <Select 
                placeholder="Select year"
                value={searchParams.yearTo}
                onChange={(e) => setSearchParams({...searchParams, yearTo: e.target.value})}
              >
                {Array.from({length: 24}, (_, i) => 2000 + i).map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-end">
          <div className="bg-white p-3 rounded-lg">
            <div className="text-orange-600 font-bold text-lg mb-2">
              {totalItems.toLocaleString()} items match
            </div>
            <Button 
              className="w-full bg-theme-secondary hover:bg-theme-secondary-hover text-black"
              onClick={handleSearch}
            >
              SEARCH
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}