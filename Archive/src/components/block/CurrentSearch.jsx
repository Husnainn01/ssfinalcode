import React from 'react';
import { FaSearch, FaBell, FaBookmark } from 'react-icons/fa';

const CurrentSearch = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden w-[520px]">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <FaSearch className="text-orange-500" />
          <h2 className="text-sm font-semibold text-gray-800">Current search</h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="space-y-4">
          {/* Search Parameters */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Search type:</span>
              <span className="text-xs font-semibold text-gray-800">ALL</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600">
                Make: Any
              </span>
              <span className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600">
                Model: Any
              </span>
              <span className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600">
                Year: Any
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            {/* Email Alert Button */}
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-md transition-colors">
              <FaBell className="w-3 h-3" />
              <span>Get email alerts</span>
            </button>

            {/* Save Search Button */}
            <button className="flex items-center gap-2 px-4 py-1.5 text-xs text-white bg-[#629584] hover:bg-[#387478] rounded-md transition-colors">
              <FaBookmark className="w-3 h-3" />
              <span>Save search</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <span className="font-medium">Found:</span>
              <span className="text-orange-600 font-semibold">245</span> vehicles
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">Last updated:</span>
              <span>2 mins ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentSearch; 