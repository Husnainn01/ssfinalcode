"use client";
import { useEffect, useState } from "react";
import { MdDelete, MdModeEdit, MdSearch } from "react-icons/md";
import { Input, Button, Spinner, Pagination } from "@nextui-org/react";
import CustomModal from '@/components/block/modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Countries() {
    const [countriesData, setCountriesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCountry, setNewCountry] = useState("");
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [error, setError] = useState("");
    const [deleteCountryId, setDeleteCountryId] = useState(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const countriesApiEndpoint = "/api/listing/country";
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Number of countries per page
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch(countriesApiEndpoint);
            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.json();
            const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
            setCountriesData(sortedData);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to fetch countries");
        } finally {
            setLoading(false);
        }
    };

    const handleAddCountry = async (e) => {
        e.preventDefault();
        if (!newCountry.trim()) {
            setError("Country name is required");
            return;
        }

        try {
            const response = await fetch(countriesApiEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newCountry })
            });
            if (!response.ok) throw new Error("Network response was not ok");
            setNewCountry("");
            setError("");
            fetchData();
            toast.success("Country added successfully!");
        } catch (error) {
            console.error("Error adding new country:", error);
            setError("Failed to add new country");
            toast.error("Failed to add new country");
        }
    };

    const handleUpdateCountry = async () => {
        if (!selectedCountry || !newCountry.trim()) {
            setError("Select a country and provide a name");
            return;
        }

        try {
            const response = await fetch(countriesApiEndpoint, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: selectedCountry._id,
                    updateData: { name: newCountry }
                })
            });
            if (!response.ok) throw new Error("Network response was not ok");
            setNewCountry("");
            setSelectedCountry(null);
            setError("");
            fetchData();
            toast.success("Country updated successfully!");
        } catch (error) {
            console.error("Error updating country:", error);
            setError("Failed to update country");
            toast.error("Failed to update country");
        }
    };

    const handleDeleteCountry = async (id) => {
        try {
            const response = await fetch(countriesApiEndpoint, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });
            if (!response.ok) throw new Error("Network response was not ok");
            fetchData();
            toast.success("Country deleted successfully!");
        } catch (error) {
            console.error("Error deleting country:", error);
            setError("Failed to delete country");
            toast.error("Failed to delete country");
        }
    };

    const openDeleteModal = (id) => {
        setDeleteCountryId(id);
        setIsDeleteModalVisible(true);
    };

    const closeDeleteModal = () => {
        setDeleteCountryId(null);
        setIsDeleteModalVisible(false);
    };

    const confirmDeleteCountry = () => {
        handleDeleteCountry(deleteCountryId);
        closeDeleteModal();
    };

    // Calculate pagination
    const getPageItems = (items, page) => {
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return items.slice(start, end);
    };

    // Filter countries based on search query
    const filteredCountries = countriesData.filter(country =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group filtered countries by first letter
    const groupedCountries = filteredCountries.reduce((groups, country) => {
        const firstLetter = country.name.charAt(0).toUpperCase();
        if (!groups[firstLetter]) {
            groups[firstLetter] = [];
        }
        groups[firstLetter].push(country);
        return groups;
    }, {});

    // Get sorted array of letters
    const letters = Object.keys(groupedCountries).sort();

    // Get paginated letters
    const paginatedLetters = getPageItems(letters, currentPage);

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
        // Smooth scroll to top of list
        document.querySelector('.countries-list')?.scrollIntoView({ behavior: 'smooth' });
    };

    if (loading) return <div className="flex w-full h-full items-center justify-center mt-60"><Spinner color="primary" size="lg" /></div>;

    return (
        <div className="p-4 md:p-6">
            <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="w-full lg:w-1/2 p-4 rounded-lg shadow-md bg-white">
                    <h2 className="text-xl font-bold mb-10">
                        {selectedCountry ? "Update Country" : "Add New Country"}
                    </h2>
                    <form onSubmit={selectedCountry ? (e) => { e.preventDefault(); handleUpdateCountry(); } : handleAddCountry}>
                        <Input
                            label="Country Name"
                            labelPlacement="outside"
                            type="text"
                            value={newCountry}
                            onChange={(e) => setNewCountry(e.target.value)}
                            placeholder="Enter country name"
                            className="w-full mb-6"
                        />
                        <Button className="w-full bg-black text-white" type="submit">
                            {selectedCountry ? "Update" : "Add"}
                        </Button>
                        {error && <p className="text-red-500 mt-2">{error}</p>}
                    </form>
                </div>

                <div className="w-full lg:w-1/2 p-4 rounded-lg shadow-md bg-white">
                    <div className="flex flex-col space-y-4">
                        <h2 className="text-xl font-bold">Countries List</h2>
                        
                        {/* Search Bar */}
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="Search countries..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                startContent={<MdSearch className="text-gray-400" />}
                                className="w-full"
                                classNames={{
                                    input: "bg-transparent",
                                    inputWrapper: "bg-default-100"
                                }}
                            />
                        </div>

                        <div className="countries-list space-y-6 max-h-[600px] overflow-y-auto mt-4">
                            {paginatedLetters.map(letter => (
                                <div key={letter} className="mb-4">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b border-gray-200 pb-1 sticky top-0 bg-white">
                                        {letter}
                                    </h3>
                                    <ul className="space-y-2">
                                        {groupedCountries[letter].map((country) => (
                                            <li 
                                                key={country._id} 
                                                className="flex justify-between items-center p-3 rounded-md bg-slate-50 hover:bg-slate-100 transition-colors"
                                            >
                                                <p className="font-medium">{country.name}</p>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedCountry(country);
                                                            setNewCountry(country.name);
                                                        }}
                                                        className="h-8 w-8 shadow-inner rounded-full flex justify-center items-center bg-teal-50 hover:bg-teal-100 transition-colors"
                                                    >
                                                        <MdModeEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(country._id)}
                                                        className="h-8 w-8 shadow-inner rounded-full flex justify-center items-center bg-red-50 hover:bg-red-100 transition-colors"
                                                    >
                                                        <MdDelete />
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                            
                            {/* No results message */}
                            {Object.keys(groupedCountries).length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No countries found matching your search.
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {Object.keys(groupedCountries).length > 0 && (
                            <div className="mt-6 flex justify-center">
                                <Pagination
                                    total={Math.ceil(Object.keys(groupedCountries).length / itemsPerPage)}
                                    page={currentPage}
                                    onChange={handlePageChange}
                                    color="primary"
                                    size="sm"
                                    showControls
                                    className="overflow-visible"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <CustomModal
                isOpen={isDeleteModalVisible}
                onClose={closeDeleteModal}
                onConfirm={confirmDeleteCountry}
                title="Confirm Deletion">
                <p>Are you sure you want to delete this country? This action cannot be undone.</p>
            </CustomModal>

            <ToastContainer />
        </div>
    );
}
