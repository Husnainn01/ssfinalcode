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
} from "react-icons/fa6"
import { Card } from "@/components/block/card"

export default function PurchaseFlow() {
  return (
    <div className="space-y-8 p-4">
      <section className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How to Purchase</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Follow our simple 4-step process to purchase your dream vehicle with confidence
          </p>
        </div>

        <div className="relative">
          <div className="grid gap-8 md:grid-cols-4 max-w-5xl mx-auto">
            {/* Step 1: Search & Select */}
            <Card className="relative p-6 group hover:shadow-xl transition-all duration-300 border-t-4 border-orange-500">
              <div className="mb-6 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-50 to-orange-100 ring-8 ring-orange-50 transform transition-transform duration-300 ease-out group-hover:scale-110">
                  <div className="relative">
                    <FaMagnifyingGlassPlus className="h-12 w-12 text-orange-600 transition-all duration-300 ease-out group-hover:rotate-6" />
                    <FaComputerMouse className="absolute -right-1 -top-1 h-5 w-5 text-orange-600 animate-bounce" />
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-sm font-semibold text-orange-600 tracking-wider">STEP 1</div>
                <div className="mb-3 text-xl font-bold text-gray-900">Search & Select</div>
                <p className="text-gray-600">
                  Browse inventory and select your perfect vehicle
                </p>
              </div>
              <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-orange-300 md:block">
                <FaChevronRight className="h-8 w-8" />
              </div>
            </Card>

            {/* Step 2: Payment */}
            <Card className="relative p-6 group hover:shadow-xl transition-all duration-300 border-t-4 border-orange-500">
              <div className="mb-6 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-50 to-orange-100 ring-8 ring-orange-50 transform transition-transform duration-300 ease-out group-hover:scale-110">
                  <div className="relative">
                    <FaCoins className="h-12 w-12 text-orange-600 transition-all duration-300 ease-out group-hover:rotate-6" />
                    <FaBuildingColumns className="absolute -right-1 -top-1 h-5 w-5 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-sm font-semibold text-orange-600 tracking-wider">STEP 2</div>
                <div className="mb-3 text-xl font-bold text-gray-900">Secure Payment</div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <img src="/visa.svg" alt="Visa" className="h-6 w-auto object-contain opacity-75 hover:opacity-100 transition-opacity" />
                  <img src="/mastercard.svg" alt="Mastercard" className="h-6 w-auto object-contain opacity-75 hover:opacity-100 transition-opacity" />
                  <img src="/paypal.svg" alt="PayPal" className="h-6 w-auto object-contain opacity-75 hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-orange-300 md:block">
                <FaChevronRight className="h-8 w-8" />
              </div>
            </Card>

            {/* Step 3: Processing */}
            <Card className="relative p-6 group hover:shadow-xl transition-all duration-300 border-t-4 border-orange-500">
              <div className="mb-6 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-50 to-orange-100 ring-8 ring-orange-50 transform transition-transform duration-300 ease-out group-hover:scale-110">
                  <div className="relative">
                    <FaArrowsRotate className="h-12 w-12 text-orange-600 transition-all duration-300 ease-out group-hover:rotate-6" />
                    <FaListCheck className="absolute -right-1 -top-1 h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-sm font-semibold text-orange-600 tracking-wider">STEP 3</div>
                <div className="mb-3 text-xl font-bold text-gray-900">Processing</div>
                <p className="text-gray-600">
                  Vehicle inspection and shipping preparation
                </p>
              </div>
              <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-orange-300 md:block">
                <FaChevronRight className="h-8 w-8" />
              </div>
            </Card>

            {/* Step 4: Delivery */}
            <Card className="p-6 group hover:shadow-xl transition-all duration-300 border-t-4 border-orange-500">
              <div className="mb-6 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-50 to-orange-100 ring-8 ring-orange-50 transform transition-transform duration-300 ease-out group-hover:scale-110">
                  <div className="relative">
                    <FaTruck className="h-12 w-12 text-orange-600 transition-all duration-300 ease-out group-hover:translate-x-1" />
                    <FaLocationDot className="absolute -right-1 -top-1 h-5 w-5 text-red-600" />
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-sm font-semibold text-orange-600 tracking-wider">STEP 4</div>
                <div className="mb-3 text-xl font-bold text-gray-900">Delivery</div>
                <p className="text-gray-600">
                  Safe and timely delivery to your location
                </p>
              </div>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <a
              href="/how-to-buy"
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold hover:underline transition-all duration-200"
            >
              <span>View Detailed Purchase Guide</span>
              <FaChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}