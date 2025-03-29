import { NextResponse } from 'next/server';

const TEST_RESPONSES = {
  // Test BL numbers
  'MAEU5678912345': {
    container: {
      number: 'CMAU1234567',
      line: 'MAERSK',
      blNumber: 'MAEU5678912345',
      trackingStatus: 'In Transit'
    },
    name: 'MAERSK SENTOSA',
    imo: '9876543',
    mmsi: '123456789',
    flag: 'Denmark',
    type: 'Container Ship',
    position: {
      latitude: '32.3456',
      longitude: '-122.4657',
      lastReport: new Date().toISOString()
    },
    voyage: {
      origin: 'Shanghai, China',
      destination: 'Los Angeles, USA',
      etaDestination: new Date(Date.now() + 5*24*60*60*1000).toISOString(),
      status: 'In Transit'
    },
    mapUrl: 'https://www.marinetraffic.com/en/ais/home/centerx:-122.4657/centery:32.3456/zoom:9'
  },
  
  // Test booking number
  'BOOK12345678': {
    container: {
      number: 'HLXU8765432',
      line: 'HAPAG LLOYD',
      blNumber: 'HLXU9876543210',
      trackingStatus: 'Loading'
    },
    name: 'HAPAG HOUSTON',
    imo: '1234567',
    mmsi: '987654321',
    flag: 'Germany',
    type: 'Container Ship',
    position: {
      latitude: '35.6821',
      longitude: '139.7661',
      lastReport: new Date().toISOString()
    },
    voyage: {
      origin: 'Tokyo, Japan',
      destination: 'Hamburg, Germany',
      etaDestination: new Date(Date.now() + 18*24*60*60*1000).toISOString(),
      status: 'Loading'
    },
    mapUrl: 'https://www.marinetraffic.com/en/ais/home/centerx:139.7661/centery:35.6821/zoom:9'
  }
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const searchType = searchParams.get('type') || 'container'; // container, bl, booking
  const searchValue = searchParams.get('query');
  
  if (!searchValue) {
    return NextResponse.json({ 
      success: false, 
      error: 'Missing search query parameter' 
    }, { status: 400 });
  }
  
  // Check if this is a test number
  if (TEST_RESPONSES[searchValue]) {
    console.log('Using test data for:', searchValue);
    return NextResponse.json({
      success: true,
      source: 'test-data',
      data: TEST_RESPONSES[searchValue]
    });
  }
  
  const SHIPSGO_API_KEY = process.env.SHIPSGO_API_KEY;
  
  if (!SHIPSGO_API_KEY) {
    return NextResponse.json({ 
      success: false, 
      error: 'API key not configured' 
    }, { status: 500 });
  }
  
  try {
    console.log(`Tracking ${searchType}: ${searchValue}`);
    
    // First, create a tracking request via POST
    const requestId = await createTrackingRequest(searchType, searchValue, SHIPSGO_API_KEY);
    
    if (!requestId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create tracking request' 
      }, { status: 500 });
    }
    
    // Then get the voyage data with map coordinates
    const voyageData = await getVoyageData(requestId, SHIPSGO_API_KEY);
    
    return NextResponse.json({
      success: true,
      source: 'shipsgo',
      requestId: requestId,
      data: voyageData
    });
    
  } catch (error) {
    console.error('Vessel tracking error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to retrieve vessel data' 
    }, { status: 500 });
  }
}

async function createTrackingRequest(searchType, searchValue, apiKey) {
  let endpoint, formData;
  
  // Prepare endpoint and form data based on search type
  if (searchType === 'container') {
    endpoint = 'https://shipsgo.com/api/v1.2/ContainerService/PostContainerInfo';
    formData = new URLSearchParams({
      authCode: apiKey,
      containerNumber: searchValue,
      shippingLine: 'OTHERS' // Default value if shipping line is unknown
    });
  } else if (searchType === 'bl' || searchType === 'booking') {
    endpoint = 'https://shipsgo.com/api/v1.2/ContainerService/PostContainerInfoWithBl';
    formData = new URLSearchParams({
      authCode: apiKey,
      blContainersRef: searchValue,
      shippingLine: 'OTHERS' // Default value if shipping line is unknown
    });
  } else {
    throw new Error('Invalid search type');
  }
  
  console.log(`Creating tracking request via ${endpoint}`);
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
    cache: 'no-store'
  });
  
  const data = await response.text();
  
  if (!response.ok) {
    console.error('Error response from Shipsgo:', data);
    throw new Error(`Shipsgo API responded with status: ${response.status}`);
  }
  
  // The response should be a requestId if successful
  if (data && !data.includes('error')) {
    console.log('Created tracking request with ID:', data);
    return data.trim();
  } else {
    console.error('Failed to create tracking request:', data);
    throw new Error('Failed to create tracking request');
  }
}

async function getVoyageData(requestId, apiKey) {
  const endpoint = `https://shipsgo.com/api/v1.2/ContainerService/GetContainerInfo/?authCode=${apiKey}&requestId=${requestId}&mapPoint=true`;
  
  console.log('Fetching voyage data for request ID:', requestId);
  
  const response = await fetch(endpoint, {
    headers: {
      'Accept': 'application/json',
    },
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error(`Voyage data request failed with status: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Format the data to match what our frontend expects
  return formatVoyageData(data);
}

function formatVoyageData(rawData) {
  // Extract vessel and voyage information from Shipsgo data
  // This is a simplified example - adjust based on actual data structure
  try {
    const currentVessel = rawData.vessels?.find(v => v.current);
    const currentVoyage = rawData.voyages?.find(v => v.current);
    
    return {
      // Basic vessel info
      name: currentVessel?.vesselName || rawData.vesselName || 'Unknown vessel',
      imo: currentVessel?.imo || rawData.imo,
      mmsi: currentVessel?.mmsi || rawData.mmsi,
      flag: currentVessel?.flag || rawData.flag,
      type: currentVessel?.type || 'Container Ship',
      
      // Position data (if available)
      position: currentVessel?.coordinates ? {
        latitude: currentVessel.coordinates.lat,
        longitude: currentVessel.coordinates.lon,
        lastReport: currentVessel.lastReport || new Date().toISOString()
      } : null,
      
      // Voyage details
      voyage: {
        origin: currentVoyage?.origin || rawData.origin,
        destination: currentVoyage?.destination || rawData.destination,
        etaDestination: currentVoyage?.eta || rawData.eta,
        status: currentVoyage?.status || rawData.status
      },
      
      // Container details
      container: {
        number: rawData.containerNumber,
        line: rawData.shippingLine,
        blNumber: rawData.blNumber,
        trackingStatus: rawData.status
      },
      
      // Provide a direct link to a map
      mapUrl: currentVessel?.coordinates 
        ? `https://www.marinetraffic.com/en/ais/home/centerx:${currentVessel.coordinates.lon}/centery:${currentVessel.coordinates.lat}/zoom:9`
        : null,
        
      // Include raw data for debugging or advanced use
      rawData: rawData
    };
  } catch (error) {
    console.error('Error formatting voyage data:', error);
    // Return minimally processed data if formatting fails
    return {
      name: rawData.vesselName || 'Unknown vessel',
      container: {
        number: rawData.containerNumber,
        status: rawData.status
      },
      rawData: rawData
    };
  }
} 