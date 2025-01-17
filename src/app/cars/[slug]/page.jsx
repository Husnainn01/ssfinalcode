import { notFound } from 'next/navigation';
import ListingPage from "./carPost";
import { FavoriteButton } from '@/components/ui/FavoriteButton';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';
// Commented out revalidate as it's not needed
// export const revalidate = 0;

async function fetchCar(slug) {
  try {
    console.log('Fetching car with slug:', slug);
    
    const timestamp = Date.now();
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cars/${slug}?t=${timestamp}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    
    if (!res.ok) {
      console.error('Failed to fetch car:', res.status);
      throw new Error('Failed to fetch car');
    }
    
    const data = await res.json();
    console.log('Fetched car data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching car:', error);
    throw error;
  }
}

export default async function CarDetailsPage({ params }) {
  console.log('CarDetailsPage params:', params); // Debug log
  
  try {
    const car = await fetchCar(params.slug);
    
    if (!car) {
      console.log('Car not found'); // Debug log
      notFound();
    }

    return (
      <div className="bg-[#E2F1E7]">
        <ListingPage 
          car={car} 
          slug={params.slug}
          favoriteButton={<FavoriteButton carId={car._id} />} 
        />
      </div>
    );
  } catch (error) {
    console.error('Error in CarDetailsPage:', error);
    notFound();
  }
}
