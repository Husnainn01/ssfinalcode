"use client";
import { useEffect, useState } from "react";
import { MdDelete, MdModeEdit, MdSearch } from "react-icons/md";
import { Input, Button, Spinner, Pagination } from "@nextui-org/react";
import CustomModal from '@/components/block/modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Make() {
    const [makeData, setMakeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMake, setNewMake] = useState("");
    const [selectedMake, setSelectedMake] = useState(null);
    const [error, setError] = useState("");
    const [deleteMakeId, setDeleteMakeId] = useState(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const apiEndpoint = "/api/listing/make";

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch(apiEndpoint);
            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.json();
            // Sort makes alphabetically
            const sortedData = data.sort((a, b) => a.make.localeCompare(b.make));
            setMakeData(sortedData);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to fetch makes");
        } finally {
            setLoading(false);
        }
    };

    // Filter makes based on search query
    const filteredMakes = makeData.filter(make =>
        make.make.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group filtered makes by first letter
    const groupedMakes = filteredMakes.reduce((groups, make) => {
        const firstLetter = make.make.charAt(0).toUpperCase();
        if (!groups[firstLetter]) {
            groups[firstLetter] = [];
        }
        groups[firstLetter].push(make);
        return groups;
    }, {});

    // Get sorted array of letters
    const letters = Object.keys(groupedMakes).sort();

    // Get paginated letters
    const getPageItems = (items, page) => {
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return items.slice(start, end);
    };

    const paginatedLetters = getPageItems(letters, currentPage);

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
        // Smooth scroll to top of list
        document.querySelector('.makes-list')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleAddMake = async (e) => {
        e.preventDefault();
        if (!newMake.trim()) {
            setError("Make name is required");
            return;
        }

        try {
            const response = await fetch(apiEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ make: newMake })
            });
            if (!response.ok) throw new Error("Network response was not ok");
            setNewMake("");
            setError("");
            fetchData();
        } catch (error) {
            console.error("Error adding new make:", error);
            setError("Failed to add new make");
        }
    };

    const handleUpdateMake = async () => {
        if (!selectedMake || !newMake.trim()) {
            setError("Select a make and provide make name");
            return;
        }

        try {
            const response = await fetch(apiEndpoint, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: selectedMake._id,
                    updateData: { make: newMake }
                })
            });
            if (!response.ok) throw new Error("Network response was not ok");
            setNewMake("");
            setSelectedMake(null);
            setError("");
            fetchData();
        } catch (error) {
            console.error("Error updating make:", error);
            setError("Failed to update make");
        }
    };

    const handleDeleteMake = async (id) => {
        try {
            const response = await fetch(apiEndpoint, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });
            if (!response.ok) throw new Error("Network response was not ok");
            fetchData();
        } catch (error) {
            console.error("Error deleting make:", error);
            setError("Failed to delete category");
        }
    };

    const openDeleteModal = (id) => {
        setDeleteMakeId(id);
        setIsDeleteModalVisible(true);
    };

    const closeDeleteModal = () => {
        setDeleteMakeId(null);
        setIsDeleteModalVisible(false);
    };

    const confirmDeleteMake = () => {
        handleDeleteMake(deleteMakeId);
        closeDeleteModal();
    };

    if (loading) return <div className="flex w-full h-full items-center justify-center mt-60"><Spinner color="primary" size="lg" /></div>;

    return (
        <div className="p-4 md:p-6">
            <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="w-full lg:w-1/2 p-4 rounded-lg shadow-md bg-white">
                    <h2 className="text-xl font-bold mb-10">
                        {selectedMake ? "Update Make" : "Add New Make"}
                    </h2>
                    <form onSubmit={selectedMake ? (e) => { e.preventDefault(); handleUpdateMake(); } : handleAddMake}>
                        <Input
                            label="Make Brand Name"
                            labelPlacement="outside"
                            type="text"
                            value={newMake}
                            onChange={(e) => setNewMake(e.target.value)}
                            placeholder="Enter make name"
                            className="w-full mb-6"
                        />
                        <Button className="w-full bg-black text-white" type="submit">
                            {selectedMake ? "Update" : "Add"}
                        </Button>
                        {error && <p className="text-red-500 mt-2">{error}</p>}
                    </form>
                </div>

                <div className="w-full lg:w-1/2 p-4 rounded-lg shadow-md bg-white">
                    <div className="flex flex-col space-y-4">
                        <h2 className="text-xl font-bold">Make List</h2>
                        
                        {/* Search Bar */}
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="Search makes..."
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

                        <div className="makes-list space-y-6 max-h-[600px] overflow-y-auto mt-4">
                            {paginatedLetters.map(letter => (
                                <div key={letter} className="mb-4">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b border-gray-200 pb-1 sticky top-0 bg-white">
                                        {letter}
                                    </h3>
                                    <ul className="space-y-2">
                                        {groupedMakes[letter].map((makeItem) => (
                                            <li 
                                                key={makeItem._id} 
                                                className="flex justify-between items-center p-3 rounded-md bg-slate-50 hover:bg-slate-100 transition-colors"
                                            >
                                                <p className="font-medium">{makeItem.make}</p>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedMake(makeItem);
                                                            setNewMake(makeItem.make);
                                                        }}
                                                        className="h-8 w-8 shadow-inner rounded-full flex justify-center items-center bg-teal-50 hover:bg-teal-100 transition-colors"
                                                    >
                                                        <MdModeEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(makeItem._id)}
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
                            {Object.keys(groupedMakes).length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No makes found matching your search.
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {Object.keys(groupedMakes).length > 0 && (
                            <div className="mt-6 flex justify-center">
                                <Pagination
                                    total={Math.ceil(Object.keys(groupedMakes).length / itemsPerPage)}
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
                onConfirm={confirmDeleteMake}
                title="Confirm Deletion">
                <p>Are you sure you want to delete this make? This action cannot be undone.</p>
            </CustomModal>

            <ToastContainer />
        </div>
    );
}
