"use client";
import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
  Modal,
  ModalContent,
} from "@nextui-org/react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { FaTag, FaMapMarkerAlt, FaPaperPlane } from "react-icons/fa";
import countries from '@/data/countries.json';

export default function CarInquiryForm({ carDetails }) {
  const { toast } = useToast();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userCountry: "",
    city: "",
    telephone: "",
    destinationPort: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPriceType, setSelectedPriceType] = useState('FOB');

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
          destinationPort: formData.destinationPort,
          carDetails: {
            id: carDetails._id,
            model: carDetails.title,
            year: carDetails.year,
            price: carDetails.price,
            make: carDetails.make,
            mileage: carDetails.mileage,
            fuelType: carDetails.fuelType,
            transmission: carDetails.transmission,
            color: carDetails.color,
            stockNo: carDetails.stockNumber || carDetails.stockNo || 'N/A',
            images: carDetails.images || [],
            sourceCountry: carDetails.country,
            destinationCountry: countries.find(c => c.code === formData.userCountry)?.name,
            destinationPort: formData.destinationPort
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit inquiry');
      }

      setReferenceId(data.referenceId);
      setShowSuccessModal(true);

      setFormData({
        name: "",
        email: "",
        userCountry: "",
        city: "",
        telephone: "",
        destinationPort: ""
      });

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

  const inputClassNames = {
    base: "max-w-full",
    label: "text-sm font-medium text-gray-700 mb-1.5",
    input: [
      "bg-gray-50",
      "text-sm",
      "h-12",
      "px-4",
      "w-full",
      "rounded-md"
    ].join(" "),
    inputWrapper: [
      "bg-gray-50",
      "h-12",
      "rounded-md",
      "hover:bg-gray-50/80",
      "group-data-[focused=true]:bg-gray-50/80"
    ].join(" "),
    innerWrapper: "h-12",
    mainWrapper: "h-12"
  };

  const selectClassNames = {
    label: "text-sm font-medium text-gray-700 mb-1.5",
    trigger: [
      "h-12",
      "bg-gray-50",
      "hover:bg-gray-50/80",
      "group-data-[focused=true]:bg-gray-50/80"
    ].join(" "),
    value: "text-sm",
    innerWrapper: "h-12",
    mainWrapper: "h-12"
  };

  return (
    <>
      <Card className="bg-white rounded-xl shadow-lg border border-gray-100">
        <CardHeader className="p-6 pb-4 border-b border-gray-100">
          <div className="flex justify-between items-start w-full">
            <div className="flex items-center gap-2">
              <FaTag className="text-blue-600 w-4 h-4" />
              <h4 className="text-lg font-semibold text-gray-900">Quick Quote Request</h4>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-2">
                <span className="text-lg font-semibold text-gray-700">FOB:</span>
                <p className="text-3xl font-bold text-blue-950">
                  ${carDetails.price.toLocaleString()}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1.5 mt-2">
                <div className="flex items-center justify-between w-[100px]">
                  <button
                    onClick={() => setSelectedPriceType('C&F')}
                    className={`px-3 py-1 text-xs rounded-full min-w-[60px] ${
                      selectedPriceType === 'C&F' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    C&F
                  </button>
                  <span className="text-xs text-gray-500">ASK</span>
                </div>
                <div className="flex items-center justify-between w-[100px]">
                  <button
                    onClick={() => setSelectedPriceType('CIF')}
                    className={`px-3 py-1 text-xs rounded-full min-w-[60px] ${
                      selectedPriceType === 'CIF' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    CIF
                  </button>
                  <span className="text-xs text-gray-500">ASK</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-gray-600 mt-2 justify-end">
                <FaMapMarkerAlt className="w-3.5 h-3.5" />
                <span className="text-sm font-medium flex items-center gap-1">
                  {carDetails.country || "N/A"}
                  {" → "}
                  {countries.find(c => c.code === formData.userCountry)?.flag}
                  {vehicleDetails.destinationCountry}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardBody className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                type="text"
                label="Full Name"
                placeholder=""
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                isInvalid={!!errors.name}
                errorMessage={errors.name}
                classNames={inputClassNames}
              />
            </div>
            <div>
              <Input
                type="email"
                label="Email Address"
                placeholder=""
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                isInvalid={!!errors.email}
                errorMessage={errors.email}
                classNames={inputClassNames}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Select 
                label="Destination Country"
                placeholder="Select destination country"
                value={formData.userCountry}
                onChange={(e) => handleInputChange('userCountry', e.target.value)}
                isInvalid={!!errors.userCountry}
                errorMessage={errors.userCountry}
                classNames={selectClassNames}
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
                      <span className="text-gray-400 text-sm">({country.phone})</span>
                    </div>
                  </SelectItem>
                )}
              </Select>
            </div>
            <div>
              <Input
                type="text"
                label="Destination Port"
                placeholder=""
                value={formData.destinationPort}
                onChange={(e) => handleInputChange('destinationPort', e.target.value)}
                isInvalid={!!errors.destinationPort}
                errorMessage={errors.destinationPort}
                classNames={inputClassNames}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                type="text"
                label="City"
                placeholder=""
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                isInvalid={!!errors.city}
                errorMessage={errors.city}
                classNames={inputClassNames}
              />
            </div>
            <div>
              <Input
                label="Telephone"
                placeholder="Phone number"
                value={formData.telephone}
                onChange={(e) => handleInputChange('telephone', e.target.value)}
                isInvalid={!!errors.telephone}
                errorMessage={errors.telephone}
                startContent={
                  <span className="text-gray-500 text-sm">
                    {countries.find(c => c.code === formData.userCountry)?.phone || '+'}
                  </span>
                }
                classNames={inputClassNames}
              />
            </div>
          </div>

          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold
              shadow-sm hover:shadow transition-all duration-200 h-11 text-sm
              rounded-lg"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            startContent={!isSubmitting && <FaPaperPlane className="w-3.5 h-3.5" />}
          >
            {isSubmitting ? "Sending Request..." : "Request Quote"}
          </Button>

          <div className="mt-5 bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-700 mb-2.5">
              Quick Process Guide:
            </p>
            <ol className="text-xs text-gray-600 space-y-2">
              {[
                "Complete and submit the form",
                "Receive detailed quotation via email",
                "Review and confirm the quotation",
                "Get your Proforma Invoice"
              ].map((step, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 
                    flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </CardBody>
      </Card>

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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
