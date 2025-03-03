import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ShippingSchedule from '@/models/ShippingSchedule';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    
    // Get filter parameters
    const region = searchParams.get('region');
    const voyageNo = searchParams.get('voyageNo');
    const shipName = searchParams.get('shipName');
    const departurePort = searchParams.get('departurePort');
    const arrivalPort = searchParams.get('arrivalPort');
    const dateRange = searchParams.get('dateRange');

    // Build query
    let query = {};
    if (region) query.region = region;
    if (voyageNo) query.voyageNo = { $regex: voyageNo, $options: 'i' };
    if (shipName) query.shipName = { $regex: shipName, $options: 'i' };
    if (departurePort) query.japanPorts = departurePort;
    if (arrivalPort) query.destinationPorts = arrivalPort;
    if (dateRange) {
      const [start, end] = dateRange.split(',');
      query.departureDate = {
        $gte: new Date(start),
        $lte: new Date(end)
      };
    }

    // Fetch schedules
    const schedules = await ShippingSchedule.find(query)
      .sort({ departureDate: 1 });

    // Transform data for front-end format
    const formattedSchedules = schedules.map(schedule => ({
      voyageNo: schedule.voyageNo,
      shipCompany: schedule.company,
      shipName: schedule.shipName,
      ports: {
        // Convert Japan ports array to object with dates
        ...schedule.japanPorts.reduce((acc, port) => ({
          ...acc,
          [port]: schedule.departureDate // You might want to adjust dates based on port sequence
        }), {}),
        // Convert destination ports array to object with dates
        ...schedule.destinationPorts.reduce((acc, port) => ({
          ...acc,
          [port]: new Date(schedule.departureDate.getTime() + 
            (schedule.estimatedTime * 24 * 60 * 60 * 1000)) // Add estimated time for arrival
        }), {})
      }
    }));

    return NextResponse.json({
      schedules: formattedSchedules,
      regions: [
        { value: 'africa', label: 'Africa' },
        { value: 'europe', label: 'Europe' },
        { value: 'middleEast', label: 'Middle East' },
        { value: 'asia', label: 'Asia' },
        { value: 'oceania', label: 'Oceania' }
      ],
      ports: {
        departure: [
          'YOKOHAMA', 'KISARAZU', 'KAWASAKI', 'HITACHINAKA',
          'HAKATA', 'KANDA', 'FUKUOKA', 'KOBE', 'MOJI',
          'NAGOYA', 'AICHI', 'OSAKA', 'SAKAI', 'SHIMONOSEKI',
          'TOYAMA'
        ].map(port => ({ value: port, label: port })),
        arrival: [
          'MOMBASA', 'MAPUTO', 'DURBAN', 'DAR ES SALAAM',
          'TEMA', 'LAGOS', 'ADELAIDE'
        ].map(port => ({ value: port, label: port }))
      }
    });
  } catch (error) {
    console.error('Error fetching shipping schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipping schedules' },
      { status: 500 }
    );
  }
} 