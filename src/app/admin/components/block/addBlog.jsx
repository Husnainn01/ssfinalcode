"use client";
import { useState, useEffect } from "react";
import { Input, Button, Select, SelectItem, Spinner } from "@nextui-org/react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { ClassicEditor, editorConfig } from "@/lib/editorConfig";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDropzone } from 'react-dropzone';
import { MdCloudUpload, MdDelete } from 'react-icons/md';

const Page = () => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    thumbnail: "",
    category: "",
    tag: "",
    date: "",
    visibility: "active",
    image: "",
  });
  const [categories, setCategories] = useState([]);
  const [visibilityOptions] = useState(["Active", "Inactive"]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/posts/cat");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Image upload functionality
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        handleImageUpload(acceptedFiles[0]);
      }
    }
  });

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    setImageUploading(true);
    
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dkbgkjqvs';
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'blog_images';

      if (!cloudName) {
        throw new Error('Cloudinary cloud name is not configured');
      }

      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('cloud_name', cloudName);
      
      console.log('Uploading to Cloudinary...', {
        cloudName,
        uploadPreset,
        fileName: file.name,
        fileSize: file.size
      });
      
      // Upload to Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dkbgkjqvs'}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Cloudinary Error: ${errorData.error?.message || 'Failed to upload'}`);
      }

      const data = await response.json();
      console.log('Cloudinary response:', data);
      
      if (data.secure_url) {
        setUploadedImage(data.secure_url);
        
        // Update the form data with the new image URL
        setFormData(prev => ({
          ...prev,
          thumbnail: data.secure_url,
          image: data.secure_url
        }));
        
        toast.success("Image uploaded successfully!");
      } else {
        throw new Error('No secure URL received from Cloudinary');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setImageUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    setFormData((prevData) => ({ ...prevData, content: data }));
  };

  const handleSubmit = async () => {
    try {
      // Validate all required fields
      const requiredFields = {
        title: "Title",
        content: "Content",
        thumbnail: "Featured Image",
        category: "Category",
        tag: "Tags",
        date: "Date",
        visibility: "Visibility Status"
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([key]) => !formData[key])
        .map(([_, label]) => label);

      if (missingFields.length > 0) {
        toast.error(`Please fill in all required fields: ${missingFields.join(", ")}`);
        return;
      }

      console.log("Submitting form data:", formData);

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          image: formData.thumbnail
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create post");
      }

      const result = await response.json();
      console.log("API response:", result);

      toast.success("Post added successfully!");
      
      // Reset form
      setFormData({
        title: "",
        content: "",
        thumbnail: "",
        image: "",
        category: "",
        tag: "",
        date: "",
        visibility: "active",
      });
      setUploadedImage(null);
    } catch (error) {
      console.error("Error submitting post:", error);
      toast.error(`Failed to add post: ${error.message}`);
    }
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
    setFormData(prev => ({
      ...prev,
      thumbnail: ""
    }));
  };

  return (
    <div>
      <h3 className="ml-2 font-bold mb-4">Add New Post</h3>

      <div className="ml-2 mb-4 flex gap-4 md:flex-row flex-col">
        <Input
          isRequired
          clearable
          underlined
          placeholder="Enter Title"
          label="Post Main Title"
          labelPlacement="outside"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          classNames={{
            label: "after:content-['*'] after:text-red-500 after:ml-0.5"
          }}
        />
        <Input
          isRequired
          clearable
          underlined
          placeholder="Enter tags, separated by commas (e.g., Vasu, Theme, Cars)"
          labelPlacement="outside"
          label="Tags"
          name="tag"
          value={formData.tag}
          onChange={handleInputChange}
          classNames={{
            label: "after:content-['*'] after:text-red-500 after:ml-0.5"
          }}
        />
      </div>

      {/* Enhanced Image Upload Section */}
      <div className="ml-2 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Featured Image <span className="text-red-500">*</span>
        </label>
        
        <div className="space-y-4">
          {/* Upload Area */}
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed ${isDragActive ? 'border-primary' : 'border-gray-300'} 
                       rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors
                       bg-gray-50 hover:bg-gray-100`}
          >
            <input {...getInputProps()} />
            {imageUploading ? (
              <div className="flex flex-col items-center">
                <Spinner size="md" />
                <p className="mt-2 text-sm text-gray-600">Uploading image...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <MdCloudUpload className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {isDragActive ? 
                    "Drop the image here..." : 
                    "Drag and drop an image here, or click to select"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Supported formats: JPEG, PNG, WebP
                </p>
              </div>
            )}
          </div>

          {/* Preview Section - Only show if image is uploaded */}
          {(formData.thumbnail || uploadedImage) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-700">Image Preview</h4>
                <Button
                  color="danger"
                  variant="light"
                  onClick={removeUploadedImage}
                  size="sm"
                  startContent={<MdDelete size={16} />}
                >
                  Remove Image
                </Button>
              </div>
              
              <div className="relative group">
                <img 
                  src={uploadedImage || formData.thumbnail} 
                  alt="Featured image preview" 
                  className="w-full h-[300px] object-cover"
                />
                
                {/* Success indicator */}
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-sm">
                  ✓ Image Uploaded
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      color="danger"
                      variant="flat"
                      onClick={removeUploadedImage}
                      startContent={<MdDelete size={20} />}
                    >
                      Replace Image
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="ml-2 mb-4 flex gap-4 md:flex-row flex-col">
        <Select
          isRequired
          clearable
          underlined
          placeholder="Select Category"
          labelPlacement="outside"
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleSelectChange}
          classNames={{
            label: "after:content-['*'] after:text-red-500 after:ml-0.5"
          }}
        >
          {categories.map((category) => (
            <SelectItem key={category.category} value={category.category}>
              {category.category}
            </SelectItem>
          ))}
        </Select>

        <Input
          isRequired
          type="date"
          labelPlacement="outside"
          label="Date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          classNames={{
            label: "after:content-['*'] after:text-red-500 after:ml-0.5"
          }}
        />
        <Select
          isRequired
          clearable
          underlined
          placeholder="Select Visibility"
          labelPlacement="outside"
          label="Visibility"
          name="visibility"
          value={formData.visibility}
          onChange={handleSelectChange}
          classNames={{
            label: "after:content-['*'] after:text-red-500 after:ml-0.5"
          }}
        >
          {visibilityOptions.map((visibilityOptions) => (
            <SelectItem key={visibilityOptions} value={visibilityOptions}>
              {visibilityOptions}
            </SelectItem>
          ))}
        </Select>
      </div>

      <div className="ml-2 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content <span className="text-red-500">*</span>
        </label>
        <CKEditor
          editor={ClassicEditor}
          config={{
            ...editorConfig,
            placeholder: 'Start writing your blog post... (Required)'
          }}
          data={formData.content}
          onChange={handleEditorChange}
        />
      </div>

      <Button 
        className="bg-black text-white ml-2" 
        onClick={handleSubmit}
        disabled={imageUploading}
        size="lg"
      >
        {imageUploading ? <Spinner size="sm" color="white" /> : "Submit Post"}
      </Button>
      <ToastContainer />
    </div>
  );
};

export default Page;
