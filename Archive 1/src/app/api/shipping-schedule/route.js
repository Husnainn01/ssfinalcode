import { NextResponse } from 'next/server'

async function fetchRegions(API_KEY) {
  try {
    console.log('Fetching regions with API key:', API_KEY ? 'Present' : 'Missing')

    // For testing, you can use this mock data
    const mockRegions = [
      { code: 'ASIA', name: 'Asia Pacific' },
      { code: 'EUR', name: 'Europe' },
      { code: 'NAM', name: 'North America' },
      { code: 'SAM', name: 'South America' },
      { code: 'AFR', name: 'Africa' },
      { code: 'ME', name: 'Middle East' }
    ]

    // Return mock data for now
    return { regions: mockRegions }

    // Uncomment below for real API call
    /*
    const response = await fetch('https://apiv2.fleetmon.com/regions/', {
      headers: {
        'Api-Key': API_KEY,
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Regions API error: ${response.status}`)
    }
    
    return await response.json()
    */
  } catch (error) {
    console.error('Error fetching regions:', error)
    throw error
  }
}

async function fetchPortsByRegion(region, portType = 'all') {
  // Mock port data with Japan ports and worldwide ports
  const mockPorts = {
    // Japan Ports (Departure Ports)
    'JAPAN': [
      { id: 'TYO', name: 'Tokyo Port', country: 'Japan' },
      { id: 'YOK', name: 'Yokohama Port', country: 'Japan' },
      { id: 'OSA', name: 'Osaka Port', country: 'Japan' },
      { id: 'KOB', name: 'Kobe Port', country: 'Japan' },
      { id: 'NAG', name: 'Nagoya Port', country: 'Japan' },
      { id: 'HAK', name: 'Hakata Port', country: 'Japan' },
      { id: 'SHI', name: 'Shimizu Port', country: 'Japan' },
      { id: 'TOY', name: 'Toyama Port', country: 'Japan' }
    ],
    // Worldwide Ports by Region (Arrival Ports)
    'ASIA': [
      { id: 'SIN', name: 'Singapore Port', country: 'Singapore' },
      { id: 'HKG', name: 'Hong Kong Port', country: 'Hong Kong' },
      { id: 'SHA', name: 'Shanghai Port', country: 'China' },
      { id: 'BUS', name: 'Busan Port', country: 'South Korea' },
      { id: 'KAO', name: 'Kaohsiung Port', country: 'Taiwan' }
    ],
    'EUR': [
      { id: 'ROT', name: 'Rotterdam Port', country: 'Netherlands' },
      { id: 'HAM', name: 'Hamburg Port', country: 'Germany' },
      { id: 'ANT', name: 'Antwerp Port', country: 'Belgium' },
      { id: 'PIR', name: 'Piraeus Port', country: 'Greece' },
      { id: 'VAL', name: 'Valencia Port', country: 'Spain' }
    ],
    'NAM': [
      { id: 'LAX', name: 'Los Angeles Port', country: 'USA' },
      { id: 'NYC', name: 'New York Port', country: 'USA' },
      { id: 'MIA', name: 'Miami Port', country: 'USA' },
      { id: 'VAN', name: 'Vancouver Port', country: 'Canada' },
      { id: 'MTR', name: 'Montreal Port', country: 'Canada' }
    ]
  }

  if (portType === 'departure') {
    // Return only Japan ports for departure
    return mockPorts['JAPAN'].map(port => ({
      value: port.id,
      label: `${port.name}, ${port.country}`
    }))
  } else if (portType === 'arrival') {
    if (!region) {
      // If no region selected, return all ports except Japan
      const allPorts = Object.values(mockPorts)
        .flat()
        .filter(port => port.country !== 'Japan')
        .map(port => ({
          value: port.id,
          label: `${port.name}, ${port.country}`
        }))
      return allPorts
    } else {
      // Return ports for specific region
      return (mockPorts[region] || []).map(port => ({
        value: port.id,
        label: `${port.name}, ${port.country}`
      }))
    }
  }

  // Default return for backward compatibility
  return []
}

async function fetchSchedules(filters) {
  console.log('Searching with filters:', filters)
  
  // Mock schedule data
  const mockSchedules = [
    {
      voyageNo: 'VOY001',
      shipCompany: 'Maersk Line',
      shipName: 'Star Vessel',
      vesselType: 'Container Ship',
      flag: 'Singapore',
      departurePort: 'SIN',
      arrivalPort: 'HKG',
      departureDate: '2024-03-20',
      arrivalDate: '2024-03-25',
      status: 'IN_PROGRESS'
    },
    {
      voyageNo: 'VOY002',
      shipCompany: 'MSC',
      shipName: 'Ocean Queen',
      vesselType: 'Bulk Carrier',
      flag: 'Panama',
      departurePort: 'ROT',
      arrivalPort: 'HAM',
      departureDate: '2024-03-22',
      arrivalDate: '2024-03-24',
      status: 'SCHEDULED'
    },
    {
      voyageNo: 'VOY003',
      shipCompany: 'CMA CGM',
      shipName: 'Pacific Explorer',
      vesselType: 'Container Ship',
      flag: 'France',
      departurePort: 'ROT',
      arrivalPort: 'HAM',
      departureDate: '2024-03-25',
      arrivalDate: '2024-03-28',
      status: 'SCHEDULED'
    }
  ]

  // Filter the mock data based on search criteria
  const filteredSchedules = mockSchedules.filter(schedule => {
    // Helper function to do case-insensitive partial match
    const matches = (value, filter) => {
      if (!filter) return true
      return value.toLowerCase().includes(filter.toLowerCase().trim())
    }

    // Individual filter checks
    const matchesVoyage = matches(schedule.voyageNo, filters.voyageNo)
    const matchesShipName = matches(schedule.shipName, filters.shipName)
    
    // Region matching - if region is selected but no ports, show all schedules for that region
    const matchesRegion = !filters.region || 
      (schedule.departurePort === filters.departurePort ||
       schedule.arrivalPort === filters.arrivalPort ||
       (!filters.departurePort && !filters.arrivalPort)) // Show all if no ports selected

    // Port matching - only if ports are selected
    const matchesDeparturePort = !filters.departurePort || 
      schedule.departurePort === filters.departurePort
    
    const matchesArrivalPort = !filters.arrivalPort || 
      schedule.arrivalPort === filters.arrivalPort

    // Date matching (if implemented)
    const matchesDates = true // TODO: Implement date filtering

    // Debug logging for each condition
    console.log('Matching conditions for', schedule.voyageNo, {
      matchesVoyage,
      matchesShipName,
      matchesRegion,
      matchesDeparturePort,
      matchesArrivalPort
    })

    // Return true only if all conditions match
    return (
      matchesVoyage &&
      matchesShipName &&
      matchesRegion &&
      matchesDeparturePort &&
      matchesArrivalPort &&
      matchesDates
    )
  })

  console.log('Filtered schedules:', filteredSchedules)
  return filteredSchedules
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const region = searchParams.get('region')
    const portType = searchParams.get('portType')
    const API_KEY = process.env.FLEETMON_API_KEY

    console.log('API Route called with action:', action)

    if (!API_KEY) {
      console.error('FLEETMON_API_KEY is not set')
      return NextResponse.json({ error: 'API key is not configured' }, { status: 500 })
    }

    // If requesting regions data
    if (action === 'getRegions') {
      const data = await fetchRegions(API_KEY)
      const formattedRegions = data.regions.map(region => ({
        value: region.code,
        label: region.name
      }))
      console.log('Sending formatted regions:', formattedRegions)
      return NextResponse.json({ regions: formattedRegions })
    }

    // Update ports handling
    if (action === 'getPorts') {
      const ports = await fetchPortsByRegion(region, portType)
      return NextResponse.json({ ports })
    }

    // Add search handling
    if (action === 'search') {
      const filters = {
        region: searchParams.get('region'),
        voyageNo: searchParams.get('voyageNo'),
        shipName: searchParams.get('shipName'),
        departurePort: searchParams.get('departurePort'),
        arrivalPort: searchParams.get('arrivalPort'),
        departureDateFrom: searchParams.get('departureDateFrom'),
        departureDateTo: searchParams.get('departureDateTo'),
        arrivalDateFrom: searchParams.get('arrivalDateFrom'),
        arrivalDateTo: searchParams.get('arrivalDateTo')
      }

      const schedules = await fetchSchedules(filters)
      console.log('Sending schedules:', schedules)
      return NextResponse.json({ schedules })
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 })

  } catch (error) {
    console.error('API Route Error:', error)
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    )
  }
} 