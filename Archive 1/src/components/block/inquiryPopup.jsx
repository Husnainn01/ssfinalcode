'use client'

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Radio,
  RadioGroup,
  Checkbox,
  useDisclosure
} from "@nextui-org/react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import countries from '@/data/countries.json';

export default function InquiryPopup({ carDetails }) {
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [shippingMethod, setShippingMethod] = useState("RORO");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userCountry: "",
    city: "",
    address: "",
    telephone: "",
    discountCoupon: "",
    destinationPort: "",
    receiveNews: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [referenceId, setReferenceId] = useState('');

  const vehicleDetails = {
    model: carDetails?.title || "N/A",
    year: carDetails?.year || "",
    engine: carDetails?.vehicleEngine || "",
    mileage: carDetails?.mileage || 0,
    transmission: carDetails?.vehicleTransmission || "",
    steering: carDetails?.steering || "",
    sourceCountry: carDetails?.country || "",
    destinationCountry: countries.find(c => c.code === formData.userCountry)?.name || 'N/A',
    destinationPort: formData.destinationPort || "N/A",
    price: carDetails?.price || 0,
    imageUrl: carDetails?.image || ""
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.userCountry) newErrors.userCountry = "Destination country is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.telephone.trim()) newErrors.telephone = "Telephone is required";
    if (!formData.destinationPort.trim()) newErrors.destinationPort = "Destination port is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          country: formData.userCountry,
          city: formData.city,
          telephone: formData.telephone,
          carDetails: {
            id: carDetails._id,
            model: carDetails.title,
            year: carDetails.year,
            price: carDetails.price,
            make: carDetails.make || carDetails.brand,
            mileage: carDetails.mileage,
            fuelType: carDetails.fuelType || carDetails.vehicleEngine,
            transmission: carDetails.transmission || carDetails.vehicleTransmission,
            color: carDetails.color || carDetails.vehicleColor,
            stockNo: carDetails.stockNumber || carDetails.stockNo,
            images: carDetails.images || [carDetails.image], // Handle both single and multiple images
            // Additional details from popup form
            insurance: vehicleDetails.insurance,
            warranty: vehicleDetails.warranty,
            shippingMethod: shippingMethod,
            location: vehicleDetails.location,
            steering: vehicleDetails.steering,
            address: formData.address,
            receiveNews: formData.receiveNews,
            discountCoupon: formData.discountCoupon
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit inquiry');
      }

      // Set the reference ID from the response
      setReferenceId(data.referenceId);
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        userCountry: "",
        city: "",
        address: "",
        telephone: "",
        discountCoupon: "",
        destinationPort: "",
        receiveNews: false
      });
      setShippingMethod("RORO");
      
      // Close inquiry modal and show success modal
      onClose();
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast({
        title: "Error",
        description: "Failed to submit inquiry. Please try again.",
        variant: "destructive",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to copy reference ID
  const copyReferenceId = async () => {
    try {
      await navigator.clipboard.writeText(referenceId);
      toast({
        title: "Copied!",
        description: "Reference ID copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy reference ID",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Button 
        onPress={onOpen}
        className="bg-[#14225D] hover:bg-blue-900 text-white text-xs px-4 py-1.5 rounded flex items-center gap-2"
        size="sm"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-3 w-3" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
        </svg>
        Send Inquiry
      </Button>

      <Modal 
        size="lg"
        isOpen={isOpen} 
        onClose={onClose}
        classNames={{
          base: "max-w-[800px]",
          body: "p-5 bg-[#E2F1E7]",
          header: "border-b border-gray-200 p-4 bg-[#E2F1E7]",
          footer: "border-t border-gray-200 p-4 bg-[#E2F1E7]",
          closeButton: "hover:bg-gray-100 active:bg-gray-200 rounded-full"
        }}
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-blue-600" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span className="text-lg font-semibold text-gray-800">INQUIRY (FREE QUOTE)</span>
          </ModalHeader>
          <ModalBody>
            <div className="grid gap-5">
              {/* Vehicle Details - Enhanced */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="grid grid-cols-[120px,1fr] gap-4">
                  <div className="relative">
                    {/* SOLD badge on image */}
                    {carDetails.offerType === "Sold" && (
                      <div className="absolute -left-2 top-2 z-10">
                        <div className="bg-red-600/90 text-white px-3 py-1 text-xs font-bold shadow-lg">
                          SOLD
                        </div>
                        <div className="absolute -bottom-1 left-0 w-0 h-0 
                          border-t-[4px] border-t-red-800
                          border-r-[4px] border-r-transparent">
                        </div>
                      </div>
                    )}
                    <img
                      src={vehicleDetails.imageUrl}
                      alt={vehicleDetails.model}
                      className="w-full h-24 object-cover rounded-md shadow-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="space-y-2">
                      <p className="flex items-center gap-2">
                        <span className="font-medium text-gray-600">Year:</span>
                        <span>{vehicleDetails.year}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="font-medium text-gray-600">Engine:</span>
                        <span>{vehicleDetails.engine}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="font-medium text-gray-600">Mileage:</span>
                        <span>{vehicleDetails.mileage.toLocaleString()}</span>
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="flex items-center gap-2">
                        <span className="font-medium text-gray-600">From:</span>
                        <span className="flex items-center gap-1">
                          {vehicleDetails.sourceCountry}
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="font-medium text-gray-600">To:</span>
                        <span className="flex items-center gap-1">
                          {countries.find(c => c.code === formData.userCountry)?.flag}
                          {vehicleDetails.destinationCountry}
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="font-medium text-gray-600">Port:</span>
                        <span>{vehicleDetails.destinationPort}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Method - Enhanced */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <RadioGroup 
                  label="Shipping Method"
                  value={shippingMethod}
                  onValueChange={setShippingMethod}
                  orientation="horizontal"
                  classNames={{
                    label: "text-sm font-medium text-gray-700 mb-2",
                    wrapper: "gap-6"
                  }}
                >
                  <Radio value="RORO" size="sm">
                    <span className="text-sm">RORO</span>
                  </Radio>
                  <Radio value="CONTAINER" size="sm">
                    <span className="text-sm">CONTAINER</span>
                  </Radio>
                </RadioGroup>
              </div>

              {/* Shipping Information Section - New */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Shipping Information</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Select 
                    size="sm"
                    label="Destination Country"
                    placeholder="Select destination country"
                    value={formData.userCountry}
                    onChange={(e) => handleInputChange('userCountry', e.target.value)}
                    isInvalid={!!errors.userCountry}
                    errorMessage={errors.userCountry}
                    isRequired
                    classNames={{
                      label: "text-sm font-medium text-gray-700",
                      value: "text-sm",
                      trigger: "shadow-sm"
                    }}
                    items={countries}
                  >
                    {(country) => (
                      <SelectItem 
                        key={country.code} 
                        value={country.code}
                        textValue={country.name}
                        startContent={<span className="text-xl">{country.flag}</span>}
                      >
                        <div className="flex items-center gap-2">
                          <span>{country.name}</span>
                        </div>
                      </SelectItem>
                    )}
                  </Select>

                  <Input
                    size="sm"
                    label="Destination Port"
                    placeholder="Enter destination port"
                    value={formData.destinationPort}
                    onChange={(e) => handleInputChange('destinationPort', e.target.value)}
                    isInvalid={!!errors.destinationPort}
                    errorMessage={errors.destinationPort}
                    isRequired
                    classNames={{
                      label: "text-sm font-medium text-gray-700",
                      input: "text-sm",
                      inputWrapper: "shadow-sm"
                    }}
                  />
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Contact Information</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    size="sm"
                    label="Your Name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    isInvalid={!!errors.name}
                    errorMessage={errors.name}
                    isRequired
                    classNames={{
                      label: "text-sm font-medium text-gray-700",
                      input: "text-sm",
                      inputWrapper: "shadow-sm"
                    }}
                  />
                  <Input
                    size="sm"
                    type="email"
                    label="Email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    isInvalid={!!errors.email}
                    errorMessage={errors.email}
                    isRequired
                    classNames={{
                      label: "text-sm font-medium text-gray-700",
                      input: "text-sm",
                      inputWrapper: "shadow-sm"
                    }}
                  />
                  <Input
                    size="sm"
                    label="City"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    isInvalid={!!errors.city}
                    errorMessage={errors.city}
                    isRequired
                    classNames={{
                      label: "text-sm font-medium text-gray-700",
                      input: "text-sm",
                      inputWrapper: "shadow-sm"
                    }}
                  />
                  <Input
                    size="sm"
                    label="Address"
                    placeholder="Street, Town, Province"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    isInvalid={!!errors.address}
                    errorMessage={errors.address}
                    isRequired
                    classNames={{
                      label: "text-sm font-medium text-gray-700",
                      input: "text-sm",
                      inputWrapper: "shadow-sm"
                    }}
                  />
                  <Input
                    size="sm"
                    label="Telephone"
                    placeholder="Cell Phone or Telephone No."
                    value={formData.telephone}
                    onChange={(e) => handleInputChange('telephone', e.target.value)}
                    isInvalid={!!errors.telephone}
                    errorMessage={errors.telephone}
                    startContent={
                      <span className="text-gray-500 text-sm">
                        {countries.find(c => c.code === formData.userCountry)?.phone || '+'}
                      </span>
                    }
                    isRequired
                    classNames={{
                      label: "text-sm font-medium text-gray-700",
                      input: "pl-1",
                      inputWrapper: "shadow-sm"
                    }}
                  />
                </div>
              </div>
              
              <Checkbox
                size="sm"
                checked={formData.receiveNews}
                onChange={(e) => handleInputChange('receiveNews', e.target.checked)}
                classNames={{
                  label: "text-sm text-gray-600"
                }}
              >
                Receive news, coupons and special deals
              </Checkbox>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button 
              size="sm"
              color="danger" 
              variant="light" 
              onPress={onClose}
              className="font-medium"
            >
              Close
            </Button>
            <Button 
              size="sm"
              className="bg-[#629584] hover:bg-[#4A7164] text-white font-medium shadow-sm transition-colors duration-200"
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              GET A PRICE QUOTE NOW
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Success Modal */}
      <Modal 
        size="md" 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)}
      >
        <ModalContent>
          <div className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg 
                className="w-8 h-8 text-green-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Inquiry Submitted Successfully!
            </h3>
            
            <p className="text-gray-600 mb-4">
              Thank you for your inquiry. Our team will get back to you soon.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">Your Reference ID:</p>
              <div className="flex items-center justify-center gap-2">
                <code className="bg-white px-4 py-2 rounded border text-lg font-mono">
                  {referenceId}
                </code>
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  onClick={copyReferenceId}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" 
                    />
                  </svg>
                </Button>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Please save this reference ID for future communication.
            </p>

            <Button
              className="w-full bg-[#629584] hover:bg-[#4A7164] text-white"
              onClick={() => setShowSuccessModal(false)}
            >
              Close
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
}