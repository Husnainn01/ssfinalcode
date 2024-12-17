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

export default function InquiryPopup({ carDetails }) {
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [shippingMethod, setShippingMethod] = useState("RORO");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    country: "",
    city: "",
    address: "",
    telephone: "",
    discountCoupon: "",
    receiveNews: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const vehicleDetails = {
    model: carDetails?.title || "",
    year: carDetails?.year || "",
    engine: carDetails?.vehicleEngine || "",
    mileage: carDetails?.mileage || 0,
    transmission: carDetails?.vehicleTransmission || "",
    steering: carDetails?.steering || "",
    location: carDetails?.location || "",
    insurance: "NO",
    warranty: "NO",
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
    if (!formData.country) newErrors.country = "Country is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.telephone.trim()) newErrors.telephone = "Telephone is required";

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
          ...formData,
          shippingMethod,
          carDetails: {
            id: carDetails._id,
            model: carDetails.title,
            year: carDetails.year,
            price: carDetails.price
          }
        }),
      });

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Your inquiry has been submitted successfully.",
          action: <ToastAction altText="Close">Close</ToastAction>,
        });
        onClose();
      } else {
        throw new Error('Failed to submit inquiry');
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast({
        title: "Error",
        description: "Failed to submit inquiry. Please try again.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    } finally {
      setIsSubmitting(false);
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
                  <img
                    src={vehicleDetails.imageUrl}
                    alt={vehicleDetails.model}
                    className="w-full h-24 object-cover rounded-md shadow-sm"
                  />
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
                        <span className="font-medium text-gray-600">Insurance:</span>
                        <span>{vehicleDetails.insurance}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="font-medium text-gray-600">Warranty:</span>
                        <span>{vehicleDetails.warranty}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="font-medium text-gray-600">Shipping:</span>
                        <span>{shippingMethod}</span>
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
                  <Select 
                    size="sm"
                    label="Your Country"
                    placeholder="Select country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    isInvalid={!!errors.country}
                    errorMessage={errors.country}
                    isRequired
                    classNames={{
                      label: "text-sm font-medium text-gray-700",
                      value: "text-sm",
                      trigger: "shadow-sm"
                    }}
                  >
                    <SelectItem key="japan" value="japan">Japan</SelectItem>
                    <SelectItem key="other" value="other">Other Countries</SelectItem>
                  </Select>
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
                    isRequired
                    classNames={{
                      label: "text-sm font-medium text-gray-700",
                      input: "text-sm",
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
    </>
  );
}