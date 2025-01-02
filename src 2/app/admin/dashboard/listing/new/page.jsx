"use client"
import dynamic from 'next/dynamic';

const AddListing = dynamic(() => import('@/app/admin/components/block/addList'), {
  ssr: false 
});

export default function App() {
  return (
    <div className="">
      <AddListing />
    </div>
  );
}