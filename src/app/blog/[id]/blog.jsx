"use client"
import React, { useEffect, useState, useRef } from 'react'
import { Spinner } from '@nextui-org/spinner'
import { Button } from '@nextui-org/button'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronUp } from 'lucide-react'
// import Listing from "@/components/block/listing"

const Blog = ({ id }) => {
    const [blogPost, setBlogPost] = useState([])
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editedPost, setEditedPost] = useState(null)
    const [uploadedImage, setUploadedImage] = useState(null)
    const [imageUploading, setImageUploading] = useState(false)
    const [showBackToTop, setShowBackToTop] = useState(false)
    const [tableOfContents, setTableOfContents] = useState([])
    const contentRef = useRef(null)

    useEffect(() => {
        fetchPost()
        checkAdminStatus()

        // Add scroll event listener to show/hide back-to-top button
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowBackToTop(true)
            } else {
                setShowBackToTop(false)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [id])

    // Function to scroll back to top
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }

    // Function to extract headings for table of contents
    const extractTableOfContents = (content) => {
        if (!content) return []
        
        const parser = new DOMParser()
        const doc = parser.parseFromString(content, 'text/html')
        const headings = Array.from(doc.querySelectorAll('h2, h3, h4'))
        
        return headings.map((heading, index) => {
            const text = heading.textContent
            const tag = heading.tagName.toLowerCase()
            const id = `section-${index}`
            
            // Add IDs to the actual headings in the content
            heading.id = id
            
            return { id, text, level: parseInt(tag.replace('h', '')) }
        })
    }

    const scrollToSection = (id) => {
        const element = document.getElementById(id)
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 100,
                behavior: 'smooth'
            })
        }
    }

    const checkAdminStatus = () => {
        // Check if user is admin based on localStorage or session
        const userRole = localStorage.getItem('userRole')
        setIsAdmin(userRole === 'admin')
    }

    const fetchPost = async () => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaldrivemotors.com'
            const response = await fetch(`${baseUrl}/api/posts/${id}`)
            if (!response.ok) {
                throw new Error('Failed to fetch post')
            }
            const data = await response.json()
            setBlogPost(Array.isArray(data) ? data : [data])
            
            // Initialize edited post with the current post data
            if (data.length > 0) {
                setEditedPost({...data[0]})
                
                // Extract and set table of contents
                if (data[0].content) {
                    const toc = extractTableOfContents(data[0].content)
                    setTableOfContents(toc)
                    
                    // Update the content with IDs for the headings
                    const parser = new DOMParser()
                    const doc = parser.parseFromString(data[0].content, 'text/html')
                    
                    toc.forEach(item => {
                        const heading = doc.getElementById(item.id)
                        if (heading) {
                            heading.id = item.id
                        }
                    })
                    
                    // If we made changes to the content, update it
                    if (toc.length > 0) {
                        const updatedData = [...(Array.isArray(data) ? data : [data])]
                        updatedData[0].content = doc.body.innerHTML
                        setBlogPost(updatedData)
                    }
                }
            }
        } catch (e) {
            console.error('Error fetching post:', e)
        } finally {
            setLoading(false)
        }
    }

    // Image upload functionality
    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp']
        },
        maxFiles: 1,
        onDrop: acceptedFiles => {
            handleImageUpload(acceptedFiles[0])
        }
    })

    const handleImageUpload = async (file) => {
        if (!file) return
        
        setImageUploading(true)
        
        try {
            // Create a FormData object to send the file
            const formData = new FormData()
            formData.append('file', file)
            formData.append('upload_preset', 'blog_images') // Set your Cloudinary upload preset
            
            // Upload to Cloudinary
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dkbgkjqvs'}/image/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            )
            
            const data = await response.json()
            
            if (data.secure_url) {
                setUploadedImage(data.secure_url)
                
                // Update the edited post with the new image URL
                setEditedPost(prev => ({
                    ...prev,
                    image: data.secure_url,
                    thumbnail: data.secure_url // Update both fields
                }))
            }
        } catch (error) {
            console.error('Error uploading image:', error)
        } finally {
            setImageUploading(false)
        }
    }

    // Handle content changes in edit mode
    const handleContentChange = (e) => {
        setEditedPost(prev => ({
            ...prev,
            content: e.target.value
        }))
    }

    // Handle title changes in edit mode
    const handleTitleChange = (e) => {
        setEditedPost(prev => ({
            ...prev,
            title: e.target.value
        }))
    }

    const handleSaveChanges = async () => {
        if (!editedPost) return
        
        setLoading(true)
        
        try {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaldrivemotors.com'
            
            // Use your existing API structure
            const response = await fetch(`${baseUrl}/api/posts`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: editedPost._id,
                    updateData: {
                        title: editedPost.title,
                        content: editedPost.content,
                        image: editedPost.image,
                        thumbnail: editedPost.thumbnail
                    }
                })
            })
            
            if (response.ok) {
                // Refresh the post data
                fetchPost()
                setIsEditing(false)
                alert('Post updated successfully!')
            } else {
                console.error('Failed to update post')
                alert('Failed to update post. Please try again.')
            }
        } catch (error) {
            console.error('Error updating post:', error)
            alert('Error updating post: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    // Render table of contents
    const renderTableOfContents = () => {
        if (tableOfContents.length === 0) return null

        return (
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <h2 className="text-xl font-semibold mb-3 text-gray-800">Contents</h2>
                <ul className="space-y-2">
                    {tableOfContents.map((item) => (
                        <li 
                            key={item.id}
                            className={`cursor-pointer text-[#243642] hover:text-[#629584] transition-colors ${
                                item.level === 3 ? 'ml-4' : item.level === 4 ? 'ml-8' : ''
                            }`}
                            onClick={() => scrollToSection(item.id)}
                        >
                            {item.text}
                        </li>
                    ))}
                </ul>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner size="lg" />
            </div>
        )
    }

    return (
        <div className="px-4 md:px-8">
            {blogPost.map((item) => (
                <div className='w-full m-auto' key={item._id}>
                    <div className='my-6 md:my-10'>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">{item.title}</h1>
                        <p className="text-sm text-gray-600">Date: {item.date} | Category: {item.category}</p>
                        
                        {/* Only show edit button if user is admin */}
                        {isAdmin && (
                            <Link href={`/admin/dashboard/blog/new/${item._id}`}>
                                <Button 
                                    className="mt-4"
                                    color="primary"
                                >
                                    Edit Post
                                </Button>
                            </Link>
                        )}
                    </div>
                    
                    {/* Table of Contents */}
                    {tableOfContents.length > 0 && renderTableOfContents()}
                    
                    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                        {(item.image || item.thumbnail) && (
                            <div className="relative mb-6 overflow-hidden rounded-lg">
                                <div className="aspect-w-16 aspect-h-9 relative">
                                    <img 
                                        className="object-contain w-full h-auto max-h-[500px]" 
                                        src={item.image || item.thumbnail} 
                                        alt={item.title} 
                                    />
                                </div>
                            </div>
                        )}
                        
                        <div
                            ref={contentRef}
                            className="ck-content prose prose-lg max-w-none prose-headings:font-semibold prose-headings:text-gray-800 prose-p:text-gray-700 prose-a:text-[#629584] prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-img:mx-auto prose-li:text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: item.content }}
                        ></div>
                    </div>
                </div>
            ))}

            {/* Back to top button */}
            {showBackToTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 bg-[#243642] hover:bg-[#324c5d] text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50"
                    aria-label="Back to top"
                >
                    <ChevronUp size={24} />
                </button>
            )}

            {/* <div className='px-1 md:px-20'>
                <Listing />
            </div> */}
        </div>
    )
}

export default Blog
