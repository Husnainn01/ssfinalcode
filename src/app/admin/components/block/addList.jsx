"use client";
import dynamic from 'next/dynamic';
import { useState, useEffect } from "react";
import { Input, Button, Select, SelectItem, CheckboxGroup, Checkbox, } from "@nextui-org/react";
import { editorConfig } from "@/lib/editorConfig";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React from "react";
import ImageUpload from '@/components/ImageUpload';

// Add dynamic import for CKEditor
const CKEditor = dynamic(
  () => import('@ckeditor/ckeditor5-react').then(mod => mod.CKEditor),
  { ssr: false }
);

// Add dynamic import for ClassicEditor
const ClassicEditor = dynamic(
  () => import('@ckeditor/ckeditor5-build-classic'),
  { ssr: false }
);

const PostList = () => {
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

  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

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
    if (formData.make) {
      fetchModelData(formData.make);
      setIsModelDisabled(false);
    } else {
      setModelData([]);
      setIsModelDisabled(true);
    }
  }, [formData.make]);

  const fetchData = async (url, setState) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      setState(data);
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
    }
  };

  const fetchModelData = async (make) => {
    try {
      const response = await fetch(`/api/listing/model?make=${make}`);
      const data = await response.json();
      setModelData(data);
    } catch (error) {
      console.error("Error fetching model data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    setFormData((prevData) => ({ ...prevData, description: data }));
  };

  const handleCheckboxChange = (name, values) => {
    setFormData((prevData) => ({ ...prevData, [name]: values }));
  };

  const handleImagesSelected = ({ files, mainImageIndex }) => {
    setSelectedFiles(files);
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        image: URL.createObjectURL(files[mainImageIndex])
      }));
    }
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
    console.log("Validating form data:", formData);
    console.log("Selected files:", selectedFiles);

    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.price.trim()) errors.price = "Price is required";
    if (!formData.make) errors.make = "Make is required";
    if (!formData.model) errors.model = "Model is required";
    if (!formData.year) errors.year = "Year is required";
    if (!formData.mileage) errors.mileage = "Mileage is required";
    if (!formData.itemCondition) errors.itemCondition = "Item Condition is required";
    if (!formData.availability) errors.availability = "Availability is required";
    if (!formData.vin) errors.vin = "VIN is required";
    if (!formData.bodyType) errors.bodyType = "Body Type is required";
    if (!formData.color) errors.color = "Color is required";
    if (!formData.driveWheelConfiguration) errors.driveWheelConfiguration = "Drive Wheel Configuration is required";
    if (!formData.numberOfDoors) errors.numberOfDoors = "Number of Doors is required";
    if (!formData.fuelType) errors.fuelType = "Fuel Type is required";
    if (!formData.vehicleEngine) errors.vehicleEngine = "Engine Size is required";
    if (!formData.cylinders) errors.cylinders = "Cylinders is required";
    if (!formData.vehicleSeatingCapacity) errors.vehicleSeatingCapacity = "Seating Capacity is required";
    if (!formData.vehicleTransmission) errors.vehicleTransmission = "Transmission is required";
    if (!formData.description) errors.description = "Description is required";
    if (!formData.date) errors.date = "Date is required";
    if (!formData.visibility) errors.visibility = "Visibility is required";
    if (!formData.offerType) errors.offerType = "Offer Type is required";
    if (!formData.priceCurrency) errors.priceCurrency = "Price Currency is required";
    if (!formData.stockNumber.trim()) errors.stockNumber = "Stock Number is required";
    if (!formData.section) {
      errors.section = "Display section is required";
    } else if (!sectionOptions.includes(formData.section)) {
      errors.section = "Invalid section selected";
    }
    if (!formData.country) errors.country = "Country is required";
    if (!formData.mileageUnit) errors.mileageUnit = "Mileage Unit is required";

    if (!selectedFiles || selectedFiles.length === 0) {
      errors.images = "At least one image is required";
    }

    if (!selectedFiles[0]) {
      errors.mainImage = "Main image is required";
    }

    console.log("Validation errors:", errors);
    console.log("Form is valid:", Object.keys(errors).length === 0);

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!validateForm()) {
        toast.error("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      // Upload images first
      const imageUrls = await uploadImages();
      
      // Prepare the data for submission
      const submissionData = {
        ...formData,
        images: imageUrls,
        image: imageUrls[0], // Main image
        section: formData.section, // This will now be either "recent" or "popular", not both
        date: new Date().toISOString(),
      };

      const response = await fetch("/api/listing/car", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit listing");
      }

      toast.success("Listing added successfully!");
      resetForm();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error.message || "Failed to add listing");
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
        value={formData[name]}
        onChange={handleInputChange}
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
    value,
    options,
    isDisabled = false,
    placeholder = "Select"
  ) => (
    <div className="w-full">
      <Select
        label={label}
        variant="bordered"
        placeholder={placeholder}
        name={name}
        color={validationErrors[name] ? "danger" : "secondary"}
        value={value}
        labelPlacement="outside"
        isDisabled={isDisabled}
        onChange={(e) =>
          handleInputChange({ target: { name, value: e.target.value } })
        }
        classNames={{
          base: "w-full",
          trigger: "w-full",
        }}
      >
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </Select>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h3 className="text-2xl font-bold mb-6">Add New Listing</h3>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderInputField("title", "title", "Enter title", "Title")}
          {renderInputField("stockNumber", "stockNumber", "Enter stock number", "Stock Number")}
          {renderInputField("image", "image", "Enter image URL", "Image URL")}
        </div>

        {/* Vehicle Details - Updated to include Country */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {renderInputField("price", "price", "Enter price", "Price")}
          {renderSelectField(
            "Price Currency",
            "priceCurrency",
            formData.priceCurrency,
            priceCurrencyOptions
          )}
          {renderSelectField(
            "Make",
            "make",
            formData.make,
            Array.isArray(makeData) ? makeData.map((make) => make.make) : []
          )}
          {renderSelectField(
            "Model",
            "model",
            formData.model,
            modelData.map((model) => model.model),
            isModelDisabled
          )}
          <div className="relative">
            <label className="block text-sm mb-1 text-purple-600">Country</label>
            <div 
              className="w-full px-3 py-2 bg-white rounded-md border border-gray-200 cursor-pointer"
              onClick={() => setIsCountryOpen(!isCountryOpen)}
            >
              <div className="flex justify-between items-center">
                <span className={`text-sm ${!formData.country ? 'text-gray-500' : 'text-gray-900'}`}>
                  {formData.country || "Select"}
                </span>
                <span className="text-gray-400">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
            </div>
            
            {isCountryOpen && (
              <div className="absolute w-full mt-1 border border-gray-200 rounded-md bg-white shadow-sm z-50">
                <div className="p-2 border-b border-gray-200">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type a country"
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md pr-8"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </div>
                </div>
                
                <div className="p-1">
                  <p className="text-xs text-gray-500 px-2 py-1">Please select:</p>
                  <div className="max-h-48 overflow-y-auto">
                    {countryData
                      .filter(country => 
                        country.name.toLowerCase().includes(countrySearch.toLowerCase())
                      )
                      .map((country) => (
                        <div
                          key={country.name}
                          className="px-3 py-1.5 text-sm hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, country: country.name }));
                            setIsCountryOpen(false);
                            setCountrySearch("");
                          }}
                        >
                          {country.name}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          {renderSelectField(
            "Other Categories",
            "category",
            formData.category,
            otherCategoryOptions
          )}
        </div>

        {/* Vehicle Specifications */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderInputField("year", "year", "Enter car year", "Year", "number")}
          {renderInputField("mileage", "mileage", "Enter car mileage", "Mileage", "number")}
          {renderSelectField(
            "Mileage Unit",
            "mileageUnit",
            formData.mileageUnit,
            mileageUnitOptions
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderSelectField("Item Condition", "itemCondition", formData.itemCondition, itemConditionOptions)}
          {renderSelectField("Availability", "availability", formData.availability, availabilityOptions)}
          {renderInputField("vin", "vin", "Enter VIN", "VIN")}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderSelectField("Body Type", "bodyType", formData.bodyType, typeData.map((type) => type.type))}
          {renderSelectField("Color", "color", formData.color, colorData.map((color) => color.color))}
          {renderSelectField("Drive Type", "driveWheelConfiguration", formData.driveWheelConfiguration, driveTypeOptions)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderInputField("numberOfDoors", "numberOfDoors", "Enter number of doors", "Number of Doors", "number")}
          {renderSelectField("Fuel Type", "fuelType", formData.fuelType, fuelTypeOptions)}
          {renderInputField("vehicleEngine", "vehicleEngine", "Enter engine size in L", "Engine Size")}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderInputField("cylinders", "cylinders", "Enter cylinders", "Cylinders", "number")}
          {renderInputField("vehicleSeatingCapacity", "vehicleSeatingCapacity", "Enter seating capacity", "Seating Capacity", "number")}
          {renderSelectField("Vehicle Transmission", "vehicleTransmission", formData.vehicleTransmission, transmissionOptions)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderSelectField("Visibility", "visibility", formData.visibility, visibilityOptions)}
          {renderSelectField("Offer Type", "offerType", formData.offerType, offerTypeOptions)}
          {renderSelectField(
            "Display Section",
            "section",
            formData.section,
            sectionOptions,
            false,
            "Select where to display this listing"
          )}
          {renderInputField("date", "date", "Enter date", "Date", "date")}
        </div>

        {/* Features Section */}
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

        {/* Description Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <div className="w-full">
            {typeof window !== 'undefined' && (
              <CKEditor
                editor={ClassicEditor}
                config={editorConfig}
                data={formData.description || ''}
                onChange={(event, editor) => {
                  if (editor) {
                    const data = editor.getData();
                    setFormData(prev => ({
                      ...prev,
                      description: data
                    }));
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* Car Images Section - Only keeping this one */}
        <div className="space-y-2">
          <ImageUpload onImagesSelected={handleImagesSelected} resetTrigger={resetImageUpload} />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-black text-white px-8 py-2"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Submit"}
          </Button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default PostList;
