import React from 'react'
import BlogPost from "./blog"
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaldrivemotors.com'

const page = ({params}) => {
  return (
    <div>
        <BlogPost baseUrl={baseUrl} id={params.post}></BlogPost>

    </div>
  )
}

export default page