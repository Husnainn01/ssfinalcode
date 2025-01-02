"use client";
import dynamic from 'next/dynamic';

const AddListing = dynamic(() => import('@/app/admin/cars/edit/[id]/page'), {
  ssr: false 
});

export default function App(context) {
  

  const params = context.searchParams

  return (
    <div className="">
      <AddListing listingId={params.id} />
    </div>
  );
}
