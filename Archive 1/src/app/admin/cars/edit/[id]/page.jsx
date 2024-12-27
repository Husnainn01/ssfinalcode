"use client";
import dynamic from 'next/dynamic';
import { useState, useEffect } from "react";
import { Input, Button, Select, SelectItem, CheckboxGroup, Checkbox, } from "@nextui-org/react";
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { editorConfig } from "@/lib/editorConfig";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React from "react";
import ImageUpload from '@/components/ImageUpload';
import { useRouter } from "next/navigation";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Image from "next/image";

// Keep only the dynamic import
const CKEditor = dynamic(
  () => import('@ckeditor/ckeditor5-react').then(mod => mod.CKEditor),
  { ssr: false }
);


export default function PostList({ params }) {
  const { id } = params;
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    image: "",
    price: "",
    priceCurrency: "USD",
    description: "",
    make: "",
    model: "",
    year: "",
    mileage: "",
    mileageUnit: "KMT",
    itemCondition: "",
    availability: "",
    vin: "",
    bodyType: "",
    color: "",
    driveWheelConfiguration: "",
    numberOfDoors: "",
    fuelType: "",
    vehicleEngine: "",
    vehicleSeatingCapacity: "",
    vehicleTransmission: "",
    carFeature: [],
    carSafetyFeature: [],
    cylinders: "",
    visibility: "Active",
    offerType: "New Year Offer",
    date: "",
    stockNumber: "",
    section: "recent",
    images: [],
    country: "",
    category: "",
  });

  const [makeData, setMakeData] = useState([]);
  const [modelData, setModelData] = useState([]);
  const [colorData, setColorData] = useState([]);
  const [typeData, setTypeData] = useState([]);
  const [featureData, setFeatureData] = useState([]);
  const [safetyFeatureData, setSafetyFeatureData] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [isModelDisabled, setIsModelDisabled] = useState(true);
  const [categoryData, setCategoryData] = useState([]);

  const [availabilityOptions] = useState(["InStock", "OutOfStock"]);
  const [mileageUnitOptions] = useState(["KM", "MILE"]);
  const [priceCurrencyOptions] = useState(["INR", "USD", "EUR", "GBP"]);
  const [itemConditionOptions] = useState(["New", "Used"]);
  const [fuelTypeOptions] = useState([
    "Petrol",
    "Diesel",
    "Electric",
    "Hybrid",
  ]);
  const [transmissionOptions] = useState([
    "Automatic",
    "Manual",
    "Semi-Automatic",
  ]);
  const [driveTypeOptions] = useState([
    "Front Wheel Drive",
    "Rear Wheel Drive",
    "All Wheel Drive",
    "Four Wheel Drive",
  ]);
  const [visibilityOptions] = useState(["Active", "Inactive"]);
  const [offerTypeOptions] = useState(["Sold", "In Stock"]);
  const [sectionOptions] = useState(["recent", "popular"]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [reorderedImages, setReorderedImages] = useState([]);
  const [resetImageUpload, setResetImageUpload] = useState(false);

  const otherCategoryOptions = [
    'Left Hand Drive',
    'Fuel Efficient Vehicles',
    'Hybrid',
    'Electric',
    'Diesel',
    'Manual',
    'For Handicapped'
  ];

  useEffect(() => {
    console.log("Current formData:", formData);
  }, [formData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data...");
        const [makeRes, typeRes, colorRes, featuresRes, safetyFeaturesRes, countryRes, categoryRes] = await Promise.all([
          fetch("/api/listing/make"),
          fetch("/api/listing/type"),
          fetch("/api/listing/color"),
          fetch("/api/listing/features"),
          fetch("/api/listing/safety-features"),
          fetch("/api/listing/country"),
          fetch("/api/listing/category")
        ]);

        const makeData = await makeRes.json();
        console.log("Raw make data:", makeData);

        const typeData = await typeRes.json();
        const colorData = await colorRes.json();
        const featuresData = await featuresRes.json();
        const safetyFeaturesData = await safetyFeaturesRes.json();
        const countryData = await countryRes.json();
        const categoryData = await categoryRes.json();

        console.log("Category data:", categoryData);

        setMakeData(Array.isArray(makeData) ? makeData : []);
        console.log("Processed make data:", Array.isArray(makeData) ? makeData : []);

        setTypeData(typeData);
        setColorData(colorData);
        setFeatureData(featuresData);
        setSafetyFeatureData(safetyFeaturesData);
        setCountryData(Array.isArray(countryData) ? countryData : []);
        setCategoryData(Array.isArray(categoryData) ? categoryData : []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch data");
        setMakeData([]);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchModelData = async () => {
      if (formData.make) {
        try {
          const response = await fetch(`/api/listing/model?make=${formData.make}`);
          if (!response.ok) throw new Error('Failed to fetch models');
          const data = await response.json();
          setModelData(data);
          setIsModelDisabled(false);
        } catch (error) {
          console.error('Error fetching models:', error);
          setModelData([]);
          setIsModelDisabled(true);
        }
      } else {
        setModelData([]);
        setIsModelDisabled(true);
      }
    };

    fetchModelData();
  }, [formData.make]);

  useEffect(() => {
    const fetchCarData = async () => {
      try {
        const response = await fetch(`/api/cars/${id}`);
        if (!response.ok) throw new Error('Failed to fetch car data');
        const data = await response.json();
        console.log("Received car data:", data);

        // Directly set the form data without spreading an empty initial state
        setFormData(data);

      } catch (error) {
        console.error('Error fetching car data:', error);
        toast.error('Failed to load car data');
      }
    };

    if (id) fetchCarData();
  }, [id]);

  // Add this to debug form data changes
  useEffect(() => {
    console.log('Form data updated:', formData);
  }, [formData]);

  useEffect(() => {
    if (formData.images && formData.images.length > 0) {
      setExistingImages(formData.images);
      setReorderedImages(formData.images);
    }
  }, [formData.images]);

  const fetchData = async (url, setState) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      setState(data);
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name}`, value);
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      console.log("Updated formData:", newData);
      return newData;
    });

    // Reset model when make changes
    if (name === 'make') {
      setFormData(prev => ({
        ...prev,
        model: '',
        [name]: value,
      }));
    }
  };

  const handleEditorChange = (event, editor) => {
    if (editor) {
      const data = editor.getData();
      setFormData((prev) => ({
        ...prev,
        description: data
      }));
    }
  };

  const handleCheckboxChange = (name, values) => {
    if (values) {
      setFormData((prev) => ({
        ...prev,
        [name]: values
      }));
    }
  };

  const handleImagesSelected = (newImages) => {
    setSelectedFiles(newImages);
  };

  const handleImageReorder = (reorderedImages) => {
    setReorderedImages(reorderedImages);
    setFormData(prev => ({
      ...prev,
      images: reorderedImages
    }));
  };

  const uploadImages = async () => {
    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
        formData.append('quality', 'auto');
        formData.append('fetch_format', 'auto');
        formData.append('folder', 'car-listings');

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Upload failed');
        }

        const data = await response.json();
        return data.secure_url;
      });

      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (error) {
      throw new Error(`Failed to upload images: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      image: "",
      price: "",
      priceCurrency: "USD",
      description: "",
      make: "",
      model: "",
      year: "",
      mileage: "",
      mileageUnit: "KMT",
      itemCondition: "",
      availability: "",
      vin: "",
      bodyType: "",
      color: "",
      driveWheelConfiguration: "",
      numberOfDoors: "",
      fuelType: "",
      vehicleEngine: "",
      vehicleSeatingCapacity: "",
      vehicleTransmission: "",
      carFeature: [],
      carSafetyFeature: [],
      cylinders: "",
      visibility: "Active",
      offerType: "New Year Offer",
      date: "",
      stockNumber: "",
      section: "recent",
      images: [],
      country: "",
      mileageUnit: "KMT",
    });
    setValidationErrors({});
    setSelectedFiles([]);
    setResetImageUpload(prev => !prev);
  };

  const validateForm = () => {
    const errors = {};

    // Title validation
    if (!formData.title || typeof formData.title !== 'string' || formData.title.trim() === '') {
      errors.title = 'Title is required';
    }

    // Price validation - ensure it's a valid number
    if (!formData.price || isNaN(Number(formData.price))) {
      errors.price = 'Valid price is required';
    }

    // Make validation
    if (!formData.make || typeof formData.make !== 'string' || formData.make.trim() === '') {
      errors.make = 'Make is required';
    }

    // Model validation
    if (!formData.model || typeof formData.model !== 'string' || formData.model.trim() === '') {
      errors.model = 'Model is required';
    }

    // Year validation
    if (!formData.year || isNaN(Number(formData.year))) {
      errors.year = 'Valid year is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // First, validate the form
      if (!validateForm()) {
        setIsSubmitting(false);
        return;
      }

      // Upload new images if any
      const newImageUrls = selectedFiles.length > 0 ? await uploadImages() : [];
      console.log('New image URLs:', newImageUrls);

      // Important: Use reorderedImages instead of formData.images
      // This ensures we keep the current order of existing images
      const allImages = [...reorderedImages, ...newImageUrls];
      console.log('All images to be saved:', allImages);

      // Prepare the submission data
      const submitData = {
        ...formData,
        images: allImages, // Use the combined array with preserved order
        country: formData.country.toLowerCase(),
      };

      // Remove _id from the submission data
      delete submitData._id;
      console.log('Data being submitted:', submitData);

      const response = await fetch(`/api/cars/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const responseData = await response.json();
      console.log('Response from server:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update listing');
      }

      // Update local state with the response data
      setFormData(responseData);
      setExistingImages(responseData.images || []);
      setReorderedImages(responseData.images || []); // Make sure to update reorderedImages

      toast.success('Listing updated successfully');
      
      // Force a cache revalidation before redirecting
      await Promise.all([
        fetch(`/api/revalidate?path=/cars/${id}`),
        fetch(`/api/revalidate?path=/admin/dashboard/listing`),
        fetch(`/api/revalidate?path=/cars`),
      ]);
      
      // Add a longer delay before redirecting
      setTimeout(() => {
        router.push('/admin/dashboard/listing');
        router.refresh(); // Force a router refresh
      }, 2000);

    } catch (error) {
      console.error('Error updating listing:', error);
      toast.error(error.message || 'Failed to update listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInputField = (id, name, placeholder, label, type = "text") => (
    <div className="w-full">
      <Input
        type={type}
        id={id}
        name={name}
        value={formData[name] || ""}
        onChange={(e) => handleInputChange({ target: { name, value: e.target.value } })}
        placeholder={placeholder}
        label={label}
        color={validationErrors[name] ? "danger" : "default"}
        labelPlacement="outside"
        isInvalid={!!validationErrors[name]}
        errorMessage={validationErrors[name]}
        classNames={{
          base: "w-full",
          mainWrapper: "w-full",
          input: "w-full",
        }}
      />
    </div>
  );

  const renderSelectField = (
    label,
    name,
    options = [],
    isDisabled = false
  ) => {
    console.log(`Rendering select field: ${name}`, {
      value: formData[name],
      options: options
    });
    
    return (
      <div className="w-full">
        <Select
          label={label}
          variant="bordered"
          placeholder={`Select ${label}`}
          selectedKeys={formData[name] ? [formData[name]] : []}
          name={name}
          color={validationErrors[name] ? "danger" : "secondary"}
          labelPlacement="outside"
          isDisabled={isDisabled}
          onChange={(e) => {
            handleInputChange({ target: { name, value: e.target.value } });
          }}
          classNames={{
            base: "w-full",
            trigger: "w-full",
          }}
        >
          {Array.isArray(options) && options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </Select>
      </div>
    );
  };

  const renderDescriptionField = () => (
    <div className="space-y-2">
      <label className="text-sm font-medium">Description</label>
      <div className="w-full">
        {typeof window !== 'undefined' && (
          <CKEditor
            editor={ClassicEditor}
            config={editorConfig}
            data={formData.description || ''}
            onChange={(event, editor) => {
              const data = editor.getData();
              handleInputChange({ target: { name: 'description', value: data } });
            }}
          />
        )}
      </div>
    </div>
  );

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const newImages = Array.from(reorderedImages);
    const [movedImage] = newImages.splice(source.index, 1);
    newImages.splice(destination.index, 0, movedImage);

    // Update local state
    setReorderedImages(newImages);
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));

    try {
      // Remove _id before sending
      const { _id, ...updateData } = formData;
      
      // Immediately update the database with the new image order
      const response = await fetch(`/api/cars/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updateData,
          images: newImages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update image order');
      }

      // Force revalidation with cache-busting timestamp
      const timestamp = Date.now();
      await Promise.all([
        fetch(`/api/revalidate?path=/cars/${id}&t=${timestamp}`),
        fetch(`/api/revalidate?path=/admin/dashboard/listing&t=${timestamp}`),
        fetch(`/api/revalidate?path=/&t=${timestamp}`),
        fetch(`/api/revalidate?path=/cars&t=${timestamp}`),
      ]);

      // Force router refresh
      router.refresh();

      toast.success('Image order updated successfully');
    } catch (error) {
      console.error('Error updating image order:', error);
      toast.error('Failed to update image order');
      
      // Revert to previous order if update fails
      setReorderedImages(formData.images);
      setFormData(prev => ({
        ...prev,
        images: formData.images
      }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h3 className="text-2xl font-bold mb-6">Edit Listing</h3>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderInputField("title", "title", "Enter title", "Title")}
          {renderInputField("stockNumber", "stockNumber", "Enter stock number", "Stock Number")}
          {renderInputField("image", "image", "Enter image URL", "Image URL")}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {renderInputField("price", "price", "Enter price", "Price")}
          {renderSelectField("Price Currency", "priceCurrency", priceCurrencyOptions || [])}
          {renderSelectField(
            "Make",
            "make",
            makeData?.map(make => make.make) || [],
            false
          )}
          {renderSelectField(
            "Model",
            "model",
            modelData?.map(model => model.model) || [],
            isModelDisabled
          )}
          {renderSelectField(
            "Country",
            "country",
            countryData?.map(country => country.name) || [],
            false
          )}
          {renderSelectField(
            "Other Categories",
            "category",
            otherCategoryOptions
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderInputField("year", "year", "Enter car year", "Year", "number")}
          {renderInputField("mileage", "mileage", "Enter car mileage", "Mileage", "number")}
          {renderSelectField(
            "Mileage Unit",
            "mileageUnit",
            mileageUnitOptions
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderSelectField("Item Condition", "itemCondition", itemConditionOptions)}
          {renderSelectField("Availability", "availability", availabilityOptions)}
          {renderInputField("vin", "vin", "Enter VIN", "VIN")}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderSelectField("Body Type", "bodyType", typeData.map((type) => type.type))}
          {renderSelectField("Color", "color", colorData.map((color) => color.color))}
          {renderSelectField("Drive Type", "driveWheelConfiguration", driveTypeOptions)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderInputField("numberOfDoors", "numberOfDoors", "Enter number of doors", "Number of Doors", "number")}
          {renderSelectField("Fuel Type", "fuelType", fuelTypeOptions)}
          {renderInputField("vehicleEngine", "vehicleEngine", "Enter engine size in L", "Engine Size")}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderInputField("cylinders", "cylinders", "Enter cylinders", "Cylinders", "number")}
          {renderInputField("vehicleSeatingCapacity", "vehicleSeatingCapacity", "Enter seating capacity", "Seating Capacity", "number")}
          {renderSelectField("Vehicle Transmission", "vehicleTransmission", transmissionOptions)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderSelectField("Visibility", "visibility", visibilityOptions)}
          {renderSelectField("Offer Type", "offerType", offerTypeOptions)}
          {renderSelectField("Section", "section", sectionOptions)}
          {renderInputField("date", "date", "Enter date", "Date", "date")}
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <CheckboxGroup
              label="Car Features"
              orientation="horizontal"
              value={formData.carFeature}
              onChange={(values) => handleCheckboxChange("carFeature", values)}
              classNames={{
                wrapper: "gap-4 flex-wrap",
              }}
            >
              {featureData && featureData.length > 0 ? (
                featureData.map((feature) => (
                  <Checkbox key={feature.feature} value={feature.feature}>
                    {feature.feature}
                  </Checkbox>
                ))
              ) : (
                <p>No features available</p>
              )}
            </CheckboxGroup>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <CheckboxGroup
              label="Car Safety Features"
              orientation="horizontal"
              value={formData.carSafetyFeature}
              onChange={(values) => handleCheckboxChange("carSafetyFeature", values)}
              classNames={{
                wrapper: "gap-4 flex-wrap",
              }}
            >
              {safetyFeatureData && safetyFeatureData.length > 0 ? (
                safetyFeatureData.map((safetyFeature) => (
                  <Checkbox key={safetyFeature.feature} value={safetyFeature.feature}>
                    {safetyFeature.feature}
                  </Checkbox>
                ))
              ) : (
                <p>No safety features available</p>
              )}
            </CheckboxGroup>
          </div>
        </div>

        <div className="space-y-2">
          {renderDescriptionField()}
        </div>

        <div className="space-y-6">
          {/* Existing Images Preview Section */}
          {existingImages.length > 0 && (
            <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-800">Current Images</h3>
                <p className="text-sm text-gray-500">
                  Drag and drop to reorder. First image will be the main image.
                  <span className="text-primary ml-1">
                    ({existingImages.length} images)
                  </span>
                </p>
              </div>

              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="existing-images" direction="horizontal">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`
                        flex flex-wrap gap-4 p-4 rounded-lg transition-colors duration-200
                        max-h-[400px] overflow-y-auto
                        ${snapshot.isDraggingOver ? 'bg-gray-50' : 'bg-transparent'}
                      `}
                      style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#CBD5E1 transparent'
                      }}
                    >
                      {reorderedImages.map((imageUrl, index) => (
                        <Draggable 
                          key={imageUrl} 
                          draggableId={imageUrl} 
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`
                                relative group w-[200px] h-[200px] flex-shrink-0
                                transition-all duration-200 ease-in-out
                                rounded-xl overflow-hidden
                                ${snapshot.isDragging 
                                  ? 'z-50 shadow-2xl scale-105' 
                                  : 'hover:shadow-lg'
                                }
                                ${index === 0 ? 'ring-4 ring-primary ring-offset-2' : ''}
                              `}
                              style={{
                                ...provided.draggableProps.style,
                                transform: snapshot.isDragging 
                                  ? provided.draggableProps.style?.transform 
                                  : 'none',
                              }}
                            >
                              <div className="relative w-full h-full">
                                <Image
                                  src={imageUrl}
                                  alt={`Image ${index + 1}`}
                                  fill
                                  className={`
                                    object-cover transition-transform duration-200
                                    ${snapshot.isDragging ? 'scale-105' : 'group-hover:scale-105'}
                                  `}
                                  draggable={false}
                                  priority
                                />
                                <div className={`
                                  absolute inset-0 bg-gradient-to-t from-black/50 to-transparent
                                  transition-opacity duration-200
                                  ${snapshot.isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                                `} />
                                {index === 0 && (
                                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1.5 text-xs font-medium rounded-full shadow-sm">
                                    Main Image
                                  </div>
                                )}
                                <button
                                  onClick={() => {
                                    const newImages = reorderedImages.filter(img => img !== imageUrl);
                                    setReorderedImages(newImages);
                                    setFormData(prev => ({
                                      ...prev,
                                      images: newImages
                                    }));
                                  }}
                                  className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-500 hover:text-white"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          )}

          {/* New Image Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Upload New Images</h3>
            <ImageUpload
              onImagesSelected={handleImagesSelected}
              resetTrigger={resetImageUpload}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-black text-white px-8 py-2"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Submit"}
          </Button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
}
