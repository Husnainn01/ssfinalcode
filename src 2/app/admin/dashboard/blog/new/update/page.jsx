"use client";
import dynamic from 'next/dynamic';

const UpdateBlog = dynamic(() => import('@/app/admin/components/block/updateBlog'), {
  ssr: false 
});
export default function App(context) {
  

  const params = context.searchParams

  return (
    <div className="">
      <UpdateBlog BlogId={params.id} />
    </div>
  );
}
