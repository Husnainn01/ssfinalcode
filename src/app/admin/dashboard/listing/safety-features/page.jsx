"use client";
import { useEffect, useState } from "react";
import { MdDelete, MdModeEdit } from "react-icons/md";
import { Input, Button, Spinner, Pagination } from "@nextui-org/react";
import CustomModal from '@/components/block/modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SafetyFeatures() {
    const [safetyFeaturesData, setSafetyFeaturesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newFeature, setNewFeature] = useState("");
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [error, setError] = useState("");
    const [deleteFeatureId, setDeleteFeatureId] = useState(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const safetyFeaturesApiEndpoint = "/api/listing/safety-features";

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch(safetyFeaturesApiEndpoint);
            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.json();
            // Sort features alphabetically
            const sortedData = data.sort((a, b) => a.feature.localeCompare(b.feature));
            setSafetyFeaturesData(sortedData);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to fetch safety features");
        } finally {
            setLoading(false);
        }
    };

    // Group features by first letter
    const groupedFeatures = safetyFeaturesData.reduce((groups, feature) => {
        const firstLetter = feature.feature.charAt(0).toUpperCase();
        if (!groups[firstLetter]) {
            groups[firstLetter] = [];
        }
        groups[firstLetter].push(feature);
        return groups;
    }, {});

    // Get sorted array of letters
    const letters = Object.keys(groupedFeatures).sort();

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
        document.querySelector('.features-list')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleAddFeature = async (e) => {
        e.preventDefault();
        if (!newFeature.trim()) {
            setError("Feature is required");
            return;
        }

        try {
            const response = await fetch(safetyFeaturesApiEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ feature: newFeature })
            });
            if (!response.ok) throw new Error("Network response was not ok");
            setNewFeature("");
            setError("");
            fetchData();
            toast.success("Safety feature added successfully!");
        } catch (error) {
            console.error("Error adding new safety feature:", error);
            setError("Failed to add new safety feature");
            toast.error("Failed to add new safety feature");
        }
    };

    const handleUpdateFeature = async () => {
        if (!selectedFeature || !newFeature.trim()) {
            setError("Select a feature and provide a new feature name");
            return;
        }

        try {
            const response = await fetch(safetyFeaturesApiEndpoint, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: selectedFeature._id,
                    updateData: { feature: newFeature }
                })
            });
            if (!response.ok) throw new Error("Network response was not ok");
            setNewFeature("");
            setSelectedFeature(null);
            setError("");
            fetchData();
            toast.success("Safety feature updated successfully!");
        } catch (error) {
            console.error("Error updating safety feature:", error);
            setError("Failed to update safety feature");
            toast.error("Failed to update safety feature");
        }
    };

    const handleDeleteFeature = async (id) => {
        try {
            const response = await fetch(safetyFeaturesApiEndpoint, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });
            if (!response.ok) throw new Error("Network response was not ok");
            fetchData();
            toast.success("Safety feature deleted successfully!");
        } catch (error) {
            console.error("Error deleting safety feature:", error);
            setError("Failed to delete safety feature");
            toast.error("Failed to delete safety feature");
        }
    };

    const openDeleteModal = (id) => {
        setDeleteFeatureId(id);
        setIsDeleteModalVisible(true);
    };

    const closeDeleteModal = () => {
        setDeleteFeatureId(null);
        setIsDeleteModalVisible(false);
    };

    const confirmDeleteFeature = () => {
        handleDeleteFeature(deleteFeatureId);
        closeDeleteModal();
    };

    if (loading) return <div className="flex w-full h-full items-center justify-center mt-60"><Spinner color="primary" size="lg" /></div>;

    return (
        <div className="p-4 md:p-6">
            <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="w-full lg:w-1/2 p-4 rounded-lg shadow-md bg-white">
                    <h2 className="text-xl font-bold mb-10">
                        {selectedFeature ? "Update Safety Feature" : "Add New Safety Feature"}
                    </h2>
                    <form onSubmit={selectedFeature ? (e) => { e.preventDefault(); handleUpdateFeature(); } : handleAddFeature}>
                        <Input
                            label="Feature"
                            labelPlacement="outside"
                            type="text"
                            value={newFeature}
                            onChange={(e) => setNewFeature(e.target.value)}
                            placeholder="Feature"
                            className="w-full mb-6"
                        />
                        <Button className="w-full bg-black text-white" type="submit">
                            {selectedFeature ? "Update" : "Add"}
                        </Button>
                        {error && <p className="text-red-500 mt-2">{error}</p>}
                    </form>
                </div>

                <div className="w-full lg:w-1/2 p-4 rounded-lg shadow-md bg-white">
                    <h2 className="text-xl font-bold mb-4">Safety Feature List</h2>
                    <div className="features-list space-y-6 max-h-[600px] overflow-y-auto">
                        {paginatedLetters.map(letter => (
                            <div key={letter} className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b border-gray-200 pb-1 sticky top-0 bg-white">
                                    {letter}
                                </h3>
                                <ul className="space-y-2">
                                    {groupedFeatures[letter].map((featureItem) => (
                                        <li 
                                            key={featureItem._id} 
                                            className="flex justify-between items-center p-3 rounded-md bg-slate-50 hover:bg-slate-100 transition-colors"
                                        >
                                            <p className="font-medium">{featureItem.feature}</p>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedFeature(featureItem);
                                                        setNewFeature(featureItem.feature);
                                                    }}
                                                    className="h-8 w-8 shadow-inner rounded-full flex justify-center items-center bg-teal-50 hover:bg-teal-100 transition-colors"
                                                >
                                                    <MdModeEdit />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(featureItem._id)}
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
                    </div>

                    {/* Pagination */}
                    <div className="mt-6 flex justify-center">
                        <Pagination
                            total={Math.ceil(letters.length / itemsPerPage)}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                            size="sm"
                            showControls
                            className="overflow-visible"
                        />
                    </div>
                </div>
            </div>

            <CustomModal
                isOpen={isDeleteModalVisible}
                onClose={closeDeleteModal}
                onConfirm={confirmDeleteFeature}
                title="Confirm Deletion">
                <p>Are you sure you want to delete this safety feature? This action cannot be undone.</p>
            </CustomModal>

            <ToastContainer />
        </div>
    );
}
