"use client"
import React, { useEffect, useState } from 'react'
import { Spinner } from '@nextui-org/spinner'
import { Button } from '@nextui-org/button'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import Link from 'next/link'
// import Listing from "@/components/block/listing"

const Blog = ({ slug }) => {
    const [blogPost, setBlogPost] = useState([])
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editedPost, setEditedPost] = useState(null)
    const [uploadedImage, setUploadedImage] = useState(null)
    const [imageUploading, setImageUploading] = useState(false)

    useEffect(() => {
        fetchPost()
        checkAdminStatus()
    }, [])

    const checkAdminStatus = () => {
        // Check if user is admin based on localStorage or session
        const userRole = localStorage.getItem('userRole')
        setIsAdmin(userRole === 'admin')
    }

    const fetchPost = async () => {
        try {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaldrivemotors.com'
            const response = await fetch(`${baseUrl}/api/posts`)
            let data = await response.json()
            data = data.filter(listing => listing.slug === slug)
            setBlogPost(data)
            
            // Initialize edited post with the current post data
            if (data.length > 0) {
                setEditedPost({...data[0]})
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner size="lg" />
            </div>
        )
    }

    return (
        <div>
            {blogPost.map((item) => (
                <div className='w-full m-auto md:w-3/4 px-4 md:mpx-0' key={item.slug}>
                    <div className='my-10 text-center'>
                        <h1>{item.title}</h1>
                        <p>Date: {item.date} | Category: {item.category}</p>
                        
                        {/* Only show edit button if user is admin */}
                        {isAdmin && (
                            <Link href={`/admin/dashboard/blog/edit/${item.slug}`}>
                                <Button 
                                    className="mt-4"
                                    color="primary"
                                >
                                    Edit Post
                                </Button>
                            </Link>
                        )}
                    </div>
                    
                    <div>
                        {(item.image || item.thumbnail) && (
                            <img className='w-full image-post rounded-md' src={item.image || item.thumbnail} alt={item.title} />
                        )}
                        
                        <div
                            className="ck-content mt-6 px-4"
                            dangerouslySetInnerHTML={{ __html: item.content }}
                        ></div>
                    </div>
                </div>
            ))}

            {/* <div className='px-1 md:px-20'>
                <Listing />
            </div> */}
        </div>
    )
}

export default Blog
