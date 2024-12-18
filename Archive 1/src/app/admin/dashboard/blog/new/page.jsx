"use client"
import dynamic from 'next/dynamic';

const AddBlog = dynamic(() => import('@/app/admin/components/block/addBlog'), {
  ssr: false 
});

export default function App() {
  return (
    <div className="">
      <AddBlog></AddBlog>
    </div>
  );
}