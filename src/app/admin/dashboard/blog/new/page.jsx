// "use client"
// import dynamic from 'next/dynamic';
// import { Card, CardBody } from "@nextui-org/react";

// const AddBlog = dynamic(() => import('@/app/admin/components/block/addBlog'), {
//   ssr: false 
// });

// export default function App() {
//   return (
//     <div className="p-4">
//       <Card>
//         <CardBody>
//           <AddBlog />
//         </CardBody>
//       </Card>
//     </div>
//   );
// }

"use client"
import dynamic from 'next/dynamic';
import { Card, CardBody } from "@nextui-org/react";

const AddBlog = dynamic(() => import('@/app/admin/components/block/addBlog'), {
  ssr: false 
});

export default function App() {
  return (
    <div className="p-4">
      <Card>
        <CardBody>
          <AddBlog />
        </CardBody>
      </Card>
    </div>
  );
}