"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Image, Skeleton, Pagination } from "@nextui-org/react";
import { MdOutlineDelete, MdModeEdit } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomModal from "@/components/block/modal";
import { Input } from "@nextui-org/react";

export default function CarListing() {
  const [listing, setListing] = useState([]);
  const [filteredListing, setFilteredListing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize toggle states properly
  const [toggleStates, setToggleStates] = useState({});

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Add pagination calculation
  const totalPages = Math.ceil(filteredListing.length / itemsPerPage);
  const currentItems = filteredListing.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Add page change handler
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredListing(
        listing.filter((item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setCurrentPage(1); // Reset to first page when searching
    } else {
      setFilteredListing(listing);
    }
  }, [searchQuery, listing]);

  // Initialize toggle states when listing changes
  useEffect(() => {
    const newToggleStates = {};
    listing.forEach(item => {
      // Preserve existing toggle state or initialize to false
      newToggleStates[item._id] = toggleStates[item._id] || false;
    });
    setToggleStates(newToggleStates);
  }, [listing]);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/listing");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      console.log("Fetched listings data:", result);
      
      const listings = Array.isArray(result) ? result : [result];
      
      if (!listings || listings.length === 0) {
        setNotFound(true);
      } else {
        const sortedData = listings.sort((b, a) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        );
        console.log("Sorted data:", sortedData);
        setListing(sortedData);
        setFilteredListing(sortedData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    try {
      const response = await fetch(`/api/listing`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        throw new Error("Failed to delete item");
      }
      setListing(listing.filter((item) => item._id !== id));
      toast.success("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteItemId(id);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    deleteItem(deleteItemId);
    setIsDeleteModalVisible(false);
  };

  const renderSkeleton = () => (
    <div className="listingCard p-4 mb-4 rounded-lg flex flex-col gap-1 shadow-md bg-white">
      <Skeleton className="h-[180px] w-full rounded-xl mb-2" />
      <Skeleton className="h-5 w-full mb-1" />
      <Skeleton className="h-5 w-3/4 mb-1" />
    </div>
  );

  const handleToggle = (id) => {
    if (!id) return; // Guard against undefined id
    setToggleStates(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleImageReorder = async (carId, newOrder) => {
    try {
      const response = await fetch(`/api/cars/${carId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images: newOrder }),
      });

      if (!response.ok) {
        throw new Error('Failed to update image order');
      }

      // Force revalidation
      await fetch(`/api/revalidate?path=/cars/${carId}`);
      
      toast.success('Image order updated successfully');
      fetchData(); // Refresh the list
    } catch (error) {
      console.error('Error updating image order:', error);
      toast.error('Failed to update image order');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      console.log('Updating status:', id, newStatus);
      
      // First, get the current listing data to preserve all fields
      const currentListing = listing.find(item => item._id === id);
      
      if (!currentListing) {
        throw new Error('Listing not found');
      }

      const response = await fetch(`/api/cars/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...currentListing,
          offerType: newStatus,
          availability: newStatus === 'Sold' ? 'OutOfStock' : 'InStock',
          images: currentListing.images || []
        }),
      });

      const data = await response.json();

      // Check if the response was successful
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      // Update local state
      setListing(prevListing =>
        prevListing.map(item =>
          item._id === id 
            ? { 
                ...item, 
                offerType: newStatus,
                availability: newStatus === 'Sold' ? 'OutOfStock' : 'InStock'
              } 
            : item
        )
      );
      setFilteredListing(prevFiltered =>
        prevFiltered.map(item =>
          item._id === id 
            ? { 
                ...item, 
                offerType: newStatus,
                availability: newStatus === 'Sold' ? 'OutOfStock' : 'InStock'
              } 
            : item
        )
      );

      // Trigger revalidation
      const baseUrl = window.location.origin;
      try {
        const paths = [
          `/cars/${id}`,
          '/admin/dashboard/listing',
          '/cars'
        ];

        for (const path of paths) {
          const revalidateResponse = await fetch(`${baseUrl}/api/revalidate?path=${path}`, {
            method: 'GET',
            cache: 'no-store'
          });
          
          if (!revalidateResponse.ok) {
            console.warn(`Revalidation warning for path ${path}:`, await revalidateResponse.text());
          }
        }
      } catch (revalidateError) {
        console.error('Revalidation error:', revalidateError);
        // Continue execution even if revalidation fails
      }

      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Failed to update status');
      
      // Revert the select value to its previous state
      const selectElement = document.querySelector(`select[data-id="${id}"]`);
      if (selectElement) {
        selectElement.value = currentListing.offerType;
      }
    }
  };

  return (
    <div className="px-0 py-0 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <p className="font-bold text-xl mb-4 md:mb-0">Car Listing Page</p>
        <Input
          type="text"
          placeholder="Search listings"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/4"
        />
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {renderSkeleton()}
          {renderSkeleton()}
          {renderSkeleton()}
          {renderSkeleton()}
          {renderSkeleton()}
          {renderSkeleton()}
          {renderSkeleton()}
          {renderSkeleton()}
        </div>
      )}

      {error && <p className="text-red-500 text-center mt-4">Error: {error}</p>}

      {notFound && !loading && <p className="text-center mt-4">Not Found</p>}

      {!loading && !error && !notFound && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {currentItems.map((item, index) => (
              <div
                key={item._id}
                className="listingCard shadow-md p-4 mb-4 rounded-lg flex flex-col gap-1 bg-white relative"
              >
                <div className="relative h-[200px] mb-4">
                  <p className={`absolute top-2 left-2 z-10 text-white text-sm px-2 py-1 rounded-md font-medium ${
                    item.visibility === "Active" ? "bg-green-600" : "bg-red-600"
                  }`}>
                    {item.visibility}
                  </p>
                  <div className="absolute top-2 right-2 z-10">
                    {item.stockNumber ? (
                      <p className="bg-blue-600 text-white text-sm px-2 py-1 rounded-md font-medium">
                        Stock #: {item.stockNumber}
                      </p>
                    ) : (
                      <p className="bg-gray-600 text-white text-sm px-2 py-1 rounded-md font-medium">
                        No Stock #
                      </p>
                    )}
                  </div>
                  <img
                    src={item.images?.[0] || item.image || '/placeholder.jpg'}
                    className="h-full w-full object-cover rounded-md"
                    alt={item.title}
                    onClick={() => handleToggle(item._id)}
                  />
                  <div className="absolute bottom-2 left-2 z-10">
                    <select
                      value={item.offerType}
                      onChange={(e) => handleStatusChange(item._id, e.target.value)}
                      data-id={item._id}
                      className={`text-sm px-2 py-1 rounded-md font-medium cursor-pointer transition-colors duration-200
                        ${item.offerType === "Sold" 
                          ? "bg-red-100 text-red-600 hover:bg-red-200" 
                          : "bg-green-100 text-green-600 hover:bg-green-200"}`}
                    >
                      <option value="In Stock">In Stock</option>
                      <option value="Sold">Sold</option>
                    </select>
                  </div>
                  <div className="flex gap-2 absolute bottom-2 right-2 z-10">
                    <Link
                      href={`/admin/cars/edit/${item._id}`}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary-50 text-black shadow-inner hover:bg-primary-100"
                    >
                      <MdModeEdit className="text-lg" />
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(item._id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-black shadow-inner hover:bg-red-100"
                    >
                      <MdOutlineDelete className="text-lg" />
                    </button>
                  </div>
                  {toggleStates[item._id] && (
                    <div className="absolute top-full left-0 z-20 bg-white shadow-lg p-2 mt-2 rounded-md">
                      {(item.images || []).map((img, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={img} 
                            alt={`${item.title} ${index + 1}`}
                            className="w-20 h-20 object-cover mb-2 rounded"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative pt-2">
                  <h2 className="text-base font-semibold mb-2">
                    {item.title.length > 25 ? `${item.title.substring(0, 25)}...` : item.title}
                  </h2>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <p className="text-gray-600">
                      Stock #: {item.stockNumber || 'N/A'}
                    </p>
                    <p className="text-gray-600">
                      Make: {item.make}
                    </p>
                    <p className="text-gray-600">
                      Model: {item.model}
                    </p>
                    <p className="text-gray-600">
                      Price: ${item.price}
                    </p>
                  </div>
                  <p className="absolute -top-4 right-0 text-6xl opacity-5 font-bold">
                    {index + 1}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Add pagination component */}
          {filteredListing.length > itemsPerPage && (
            <div className="flex justify-center mt-6">
              <Pagination
                total={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                classNames={{
                  wrapper: "gap-2",
                  item: "w-8 h-8",
                  cursor: "bg-primary text-white font-medium",
                }}
              />
            </div>
          )}
        </>
      )}
      <ToastContainer position="bottom-right" autoClose={2000} />

      <CustomModal
        isOpen={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
      >
        <p>
          Are you sure you want to delete this item? This action cannot be
          undone.
        </p>
      </CustomModal>
    </div>
  );
}
