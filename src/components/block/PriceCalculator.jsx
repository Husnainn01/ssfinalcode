import React, { useState } from 'react';
import { Select, SelectItem, Radio, RadioGroup } from "@nextui-org/react";
import { FaCalculator, FaInfoCircle } from 'react-icons/fa';

const PriceCalculator = () => {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedPort, setSelectedPort] = useState('');
  const [shippingMethod, setShippingMethod] = useState('RORO');
  const [options, setOptions] = useState({
    insurance: true,
    inspection: false,
    certificate: false,
    bfWarranty: true
  });

  const portsData = {
    'Albania': ['DURRES'],
    'Japan': ['TOKYO', 'OSAKA', 'YOKOHAMA'],
    'Singapore': ['SINGAPORE PORT'],
    // Add more countries and their ports
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden w-[520px]">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <FaCalculator className="text-orange-500" />
          <h2 className="text-sm font-semibold text-gray-800">TOTAL PRICE CALCULATOR</h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-[200px,300px] gap-4">
          {/* Left Column - Selects */}
          <div className="space-y-2">
            <Select
              label="Country"
              placeholder="Select country"
              size="sm"
              classNames={{
                base: "max-w-xs",              
                trigger: "h-8 min-h-unit-8",   
                value: "text-xs",
                label: "text-xs",
                innerWrapper: "py-0",          
                mainWrapper: "w-[200px]",      
                selectorIcon: "text-xs",       
                listboxWrapper: "max-h-[200px]",
                radioWrapper: "group-data-[selected=true]:bg-orange-500"
              }}
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setSelectedPort('');
              }}
            >
              {Object.keys(portsData).map((country) => (
                <SelectItem key={country} value={country}>{country}</SelectItem>
              ))}
            </Select>

            <Select
              label="Port"
              placeholder="Select port"
              size="sm"
              classNames={{
                base: "max-w-xs",              
                trigger: "h-8 min-h-unit-8",   
                value: "text-xs",
                label: "text-xs",
                innerWrapper: "py-0",          
                mainWrapper: "w-[200px]",      
                selectorIcon: "text-xs",       
                listboxWrapper: "max-h-[200px]"
              }}
              value={selectedPort}
              onChange={(e) => setSelectedPort(e.target.value)}
              isDisabled={!selectedCountry}
            >
              {selectedCountry && portsData[selectedCountry]?.map((port) => (
                <SelectItem key={port} value={port}>{port}</SelectItem>
              ))}
            </Select>
          </div>

          {/* Right Column - Fixed Width */}
          <div className="space-y-3">
            {/* Shipping Method */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700 block">Shipping Method</label>
              <RadioGroup
                orientation="horizontal"
                value={shippingMethod}
                onValueChange={setShippingMethod}
                size="sm"
                classNames={{
                  wrapper: "group-data-[selected=true]:bg-orange-500",
                  radio: "group-data-[selected=true]:border-orange-500 group-data-[selected=true]:text-orange-500"
                }}
                className="gap-0"
              >
                <Radio value="RORO">RORO</Radio>
                <Radio value="Container">Container</Radio>
              </RadioGroup>
            </div>

            {/* Options Stack */}
            <div className="space-y-2">
              {/* Insurance */}
              <div className="flex items-center">
                <div className="flex items-center gap-1 w-[88px]">
                  <span className="text-xs">Insurance</span>
                  <FaInfoCircle className="text-gray-400 text-xs" />
                </div>
                <RadioGroup
                  orientation="horizontal"
                  value={options.insurance ? "yes" : "no"}
                  onValueChange={(value) => setOptions({...options, insurance: value === "yes"})}
                  size="sm"
                  classNames={{
                    wrapper: "group-data-[selected=true]:bg-orange-500"
                  }}
                  className="gap-0"
                >
                  <Radio value="yes">Yes</Radio>
                  <Radio value="no">No</Radio>
                </RadioGroup>
              </div>

              {/* Inspection */}
              <div className="flex items-center">
                <div className="flex items-center gap-1 w-[88px]">
                  <span className="text-xs">Inspection</span>
                  <FaInfoCircle className="text-gray-400 text-xs" />
                </div>
                <RadioGroup
                  orientation="horizontal"
                  value={options.inspection ? "yes" : "no"}
                  onValueChange={(value) => setOptions({...options, inspection: value === "yes"})}
                  size="sm"
                  classNames={{
                    wrapper: "group-data-[selected=true]:bg-orange-500"
                  }}
                  className="gap-0"
                >
                  <Radio value="yes">Yes</Radio>
                  <Radio value="no">No</Radio>
                </RadioGroup>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center pt-1">
                <div className="w-[88px]"></div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedCountry('');
                      setSelectedPort('');
                      setShippingMethod('RORO');
                      setOptions({
                        insurance: true,
                        inspection: false,
                        certificate: false,
                        bfWarranty: true
                      });
                    }}
                    className="px-4 py-1 text-xs text-gray-600 hover:bg-gray-50 rounded-md border border-gray-200"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => console.log('Calculating...')}
                    className="px-4 py-1 text-xs text-white bg-[#629584] hover:bg-[#387478] rounded-md"
                  >
                    Calculate Total
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceCalculator;