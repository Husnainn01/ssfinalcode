"use client";
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

const UpdateBlog = dynamic(() => import('@/app/admin/components/block/updateBlog'), {
  ssr: false
});

export default function UpdateBlogPage() {
  const params = useParams();
  const id = params.id;

  return (
    <div className="p-4">
      <UpdateBlog BlogId={id} />
    </div>
  );
} 