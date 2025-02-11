"use client";
import { useEffect, useState } from "react";
import { MdDelete, MdModeEdit, MdSearch } from "react-icons/md";
import { Input, Button, Spinner, Pagination } from "@nextui-org/react";
import CustomModal from '@/components/block/modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Types() {
    const [typesData, setTypesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newType, setNewType] = useState("");
    const [selectedType, setSelectedType] = useState(null);
    const [error, setError] = useState("");
    const [deleteTypeId, setDeleteTypeId] = useState(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const typesApiEndpoint = "/api/listing/type";
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch(typesApiEndpoint);
            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.json();
            // Sort types alphabetically
            const sortedData = data.sort((a, b) => a.type.localeCompare(b.type));
            setTypesData(sortedData);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to fetch types");
        } finally {
            setLoading(false);
        }
    };

    // Filter types based on search query
    const filteredTypes = typesData.filter(type =>
        type.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group filtered types by first letter
    const groupedTypes = filteredTypes.reduce((groups, type) => {
        const firstLetter = type.type.charAt(0).toUpperCase();
        if (!groups[firstLetter]) {
            groups[firstLetter] = [];
        }
        groups[firstLetter].push(type);
        return groups;
    }, {});

    // Get sorted array of letters
    const letters = Object.keys(groupedTypes).sort();

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
        document.querySelector('.types-list')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleAddType = async (e) => {
        e.preventDefault();
        if (!newType.trim()) {
            setError("Type name is required");
            return;
        }

        try {
            const response = await fetch(typesApiEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: newType })
            });
            if (!response.ok) throw new Error("Network response was not ok");
            setNewType("");
            setError("");
            fetchData();
            toast.success("Type added successfully!");
        } catch (error) {
            console.error("Error adding new type:", error);
            setError("Failed to add new type");
            toast.error("Failed to add new type");
        }
    };

    const handleUpdateType = async () => {
        if (!selectedType || !newType.trim()) {
            setError("Select a type and provide a new name");
            return;
        }

        try {
            const response = await fetch(typesApiEndpoint, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: selectedType._id,
                    updateData: { type: newType, name: newType }
                })
            });
            if (!response.ok) throw new Error("Network response was not ok");
            setNewType("");
            setSelectedType(null);
            setError("");
            fetchData();
            toast.success("Type updated successfully!");
        } catch (error) {
            console.error("Error updating type:", error);
            setError("Failed to update type");
            toast.error("Failed to update type");
        }
    };

    const handleDeleteType = async (id) => {
        try {
            const response = await fetch(typesApiEndpoint, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });
            if (!response.ok) throw new Error("Network response was not ok");
            fetchData();
            toast.success("Type deleted successfully!");
        } catch (error) {
            console.error("Error deleting type:", error);
            setError("Failed to delete type");
            toast.error("Failed to delete type");
        }
    };

    const openDeleteModal = (id) => {
        setDeleteTypeId(id);
        setIsDeleteModalVisible(true);
    };

    const closeDeleteModal = () => {
        setDeleteTypeId(null);
        setIsDeleteModalVisible(false);
    };

    const confirmDeleteType = () => {
        handleDeleteType(deleteTypeId);
        closeDeleteModal();
    };

    if (loading) return <div className="flex w-full h-full items-center justify-center mt-60"><Spinner color="primary" size="lg" /></div>;

    return (
        <div className="p-4 md:p-6">
            <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="w-full lg:w-1/2 p-4 rounded-lg shadow-md bg-white">
                    <h2 className="text-xl font-bold mb-10">
                        {selectedType ? "Update Type" : "Add New Type"}
                    </h2>
                    <form onSubmit={selectedType ? (e) => { e.preventDefault(); handleUpdateType(); } : handleAddType}>
                        <Input
                            label="Type Name"
                            labelPlacement="outside"
                            type="text"
                            value={newType}
                            onChange={(e) => setNewType(e.target.value)}
                            placeholder="Type Name"
                            className="w-full mb-6"
                        />
                        <Button className="w-full bg-black text-white" type="submit">
                            {selectedType ? "Update" : "Add"}
                        </Button>
                        {error && <p className="text-red-500 mt-2">{error}</p>}
                    </form>
                </div>

                <div className="w-full lg:w-1/2 p-4 rounded-lg shadow-md bg-white">
                    <div className="flex flex-col space-y-4">
                        <h2 className="text-xl font-bold">Type List</h2>
                        
                        {/* Search Bar */}
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="Search types..."
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

                        <div className="types-list space-y-6 max-h-[600px] overflow-y-auto mt-4">
                            {paginatedLetters.map(letter => (
                                <div key={letter} className="mb-4">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b border-gray-200 pb-1 sticky top-0 bg-white">
                                        {letter}
                                    </h3>
                                    <ul className="space-y-2">
                                        {groupedTypes[letter].map((typeItem) => (
                                            <li 
                                                key={typeItem._id} 
                                                className="flex justify-between items-center p-3 rounded-md bg-slate-50 hover:bg-slate-100 transition-colors"
                                            >
                                                <p className="font-medium">{typeItem.type}</p>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedType(typeItem);
                                                            setNewType(typeItem.type);
                                                        }}
                                                        className="h-8 w-8 shadow-inner rounded-full flex justify-center items-center bg-teal-50 hover:bg-teal-100 transition-colors"
                                                    >
                                                        <MdModeEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(typeItem._id)}
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
                            {Object.keys(groupedTypes).length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No types found matching your search.
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {Object.keys(groupedTypes).length > 0 && (
                            <div className="mt-6 flex justify-center">
                                <Pagination
                                    total={Math.ceil(Object.keys(groupedTypes).length / itemsPerPage)}
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
                onConfirm={confirmDeleteType}
                title="Confirm Deletion">
                <p>Are you sure you want to delete this type? This action cannot be undone.</p>
            </CustomModal>

            <ToastContainer />
        </div>
    );
}
