import {
  FaMagnifyingGlassPlus,
  FaComputerMouse,
  FaChevronRight,
  FaCoins,
  FaBuildingColumns,
  FaArrowsRotate,
  FaListCheck,
  FaTruck,
  FaLocationDot,
  FaCcVisa,
  FaCcMastercard,
  FaCcPaypal,
} from "react-icons/fa6"
import { Card } from "@/components/block/card"

export default function PurchaseFlow() {
  return (
    <div className="space-y-8 py-16">
      <section className="container mx-auto px-4 max-w-6xl relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent rounded-3xl -mx-8 h-full" />
        
        <div className="relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-950 mb-6">How to Purchase</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Follow our simple 4-step process to purchase your dream vehicle with confidence
            </p>
          </div>

          <div className="relative">
            <div className="grid gap-8 md:grid-cols-4 max-w-5xl mx-auto">
              {/* Step 1: Search & Select */}
              <Card className="relative p-8 group hover:shadow-2xl transition-all duration-500 
                border-t-4 border-orange-500 bg-white rounded-xl transform hover:-translate-y-1">
                <div className="mb-8 flex justify-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl 
                    bg-gradient-to-br from-orange-50 to-orange-100 ring-8 ring-orange-50 
                    transform transition-transform duration-500 ease-out group-hover:scale-110">
                    <div className="relative">
                      <FaMagnifyingGlassPlus className="h-14 w-14 text-orange-600 
                        transition-all duration-500 ease-out group-hover:rotate-12" />
                      <FaComputerMouse className="absolute -right-1 -top-1 h-6 w-6 
                        text-orange-600 animate-bounce" />
                    </div>
                  </div>
                </div>
                <div className="text-center space-y-4">
                  <div className="text-sm font-semibold text-orange-600 tracking-wider">STEP 1</div>
                  <div className="text-2xl font-bold text-blue-950">Search & Select</div>
                  <p className="text-gray-600">
                    Browse our extensive inventory and select your perfect vehicle
                  </p>
                </div>
                <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-orange-300 md:block">
                  <FaChevronRight className="h-8 w-8 animate-pulse" />
                </div>
              </Card>

              {/* Step 2: Payment */}
              <Card className="relative p-8 group hover:shadow-2xl transition-all duration-500 
                border-t-4 border-orange-500 bg-white rounded-xl transform hover:-translate-y-1">
                <div className="mb-8 flex justify-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl 
                    bg-gradient-to-br from-orange-50 to-orange-100 ring-8 ring-orange-50 
                    transform transition-transform duration-500 ease-out group-hover:scale-110">
                    <div className="relative">
                      <FaCoins className="h-14 w-14 text-orange-600 
                        transition-all duration-500 ease-out group-hover:rotate-12" />
                      <FaBuildingColumns className="absolute -right-1 -top-1 h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>
                <div className="text-center space-y-4">
                  <div className="text-sm font-semibold text-orange-600 tracking-wider">STEP 2</div>
                  <div className="text-2xl font-bold text-blue-950">Secure Payment</div>
                  <div className="flex items-center justify-center gap-6">
                    <FaCcVisa className="h-10 w-10 text-[#1A1F71] hover:scale-110 
                      transition-transform duration-300" />
                    <FaCcMastercard className="h-10 w-10 text-[#EB001B] hover:scale-110 
                      transition-transform duration-300" />
                    <FaCcPaypal className="h-10 w-10 text-[#003087] hover:scale-110 
                      transition-transform duration-300" />
                  </div>
                </div>
                <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-orange-300 md:block">
                  <FaChevronRight className="h-8 w-8 animate-pulse" />
                </div>
              </Card>

              {/* Step 3: Processing */}
              <Card className="relative p-8 group hover:shadow-2xl transition-all duration-500 
                border-t-4 border-orange-500 bg-white rounded-xl transform hover:-translate-y-1">
                <div className="mb-8 flex justify-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl 
                    bg-gradient-to-br from-orange-50 to-orange-100 ring-8 ring-orange-50 
                    transform transition-transform duration-500 ease-out group-hover:scale-110">
                    <div className="relative">
                      <FaArrowsRotate className="h-14 w-14 text-orange-600 
                        transition-all duration-500 ease-out group-hover:rotate-180" />
                      <FaListCheck className="absolute -right-1 -top-1 h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>
                <div className="text-center space-y-4">
                  <div className="text-sm font-semibold text-orange-600 tracking-wider">STEP 3</div>
                  <div className="text-2xl font-bold text-blue-950">Processing</div>
                  <p className="text-gray-600">
                    Thorough vehicle inspection and shipping preparation
                  </p>
                </div>
                <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-orange-300 md:block">
                  <FaChevronRight className="h-8 w-8 animate-pulse" />
                </div>
              </Card>

              {/* Step 4: Delivery */}
              <Card className="p-8 group hover:shadow-2xl transition-all duration-500 
                border-t-4 border-orange-500 bg-white rounded-xl transform hover:-translate-y-1">
                <div className="mb-8 flex justify-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl 
                    bg-gradient-to-br from-orange-50 to-orange-100 ring-8 ring-orange-50 
                    transform transition-transform duration-500 ease-out group-hover:scale-110">
                    <div className="relative">
                      <FaTruck className="h-14 w-14 text-orange-600 
                        transition-all duration-500 ease-out group-hover:translate-x-2" />
                      <FaLocationDot className="absolute -right-1 -top-1 h-6 w-6 text-red-600 animate-bounce" />
                    </div>
                  </div>
                </div>
                <div className="text-center space-y-4">
                  <div className="text-sm font-semibold text-orange-600 tracking-wider">STEP 4</div>
                  <div className="text-2xl font-bold text-blue-950">Delivery</div>
                  <p className="text-gray-600">
                    Safe and timely delivery to your location
                  </p>
                </div>
              </Card>
            </div>

            <div className="mt-16 text-center">
              <a
                href="/how-to-buy"
                className="inline-flex items-center gap-3 px-8 py-4 bg-blue-950 text-white 
                  font-semibold rounded-xl hover:bg-blue-900 transition-all duration-300 
                  shadow-lg hover:shadow-xl group"
              >
                <span>View Detailed Purchase Guide</span>
                <FaChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}