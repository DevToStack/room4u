// admin/components/ApartmentGallery.jsx
'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import FileUpload from './FileUpload';
import ImagePreviewer from './ImagePreviewer';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUpload, faSort, faTimes, faSave, faEdit, faTrash, faStar,
    faImages, faWeightHanging, faCalendar, faSync, faExclamation,
    faSearch, faFilter, faTh, faThList, faExpand
} from "@fortawesome/free-solid-svg-icons";

const ApartmentGallery = () => {
    const [apartments, setApartments] = useState([]);
    const [selectedApartmentId, setSelectedApartmentId] = useState('');
    const [images, setImages] = useState([]);
    const [filteredImages, setFilteredImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [reorderMode, setReorderMode] = useState(false);
    const [showMobileUpload, setShowMobileUpload] = useState(false);
    const [loadingImage, setLoadingImage] = useState(true);

    // Enhanced features state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilters, setSelectedFilters] = useState({
        primary: 'all',
        status: 'all',
        size: 'all'
    });
    const [viewMode, setViewMode] = useState('grid');
    const [sortConfig, setSortConfig] = useState({ key: 'display_order', direction: 'asc' });
    const [selectedImages, setSelectedImages] = useState(new Set());
    const [bulkActionsOpen, setBulkActionsOpen] = useState(false);
    const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        primary: 0,
        totalSize: 0
    });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [error, setError] = useState(null);

    // Memoized stats calculation
    const calculateStats = useCallback((imagesArray) => {
        const total = imagesArray.length;
        const primary = imagesArray.filter(img => img?.is_primary).length;
        const totalSize = imagesArray.reduce((sum, img) => sum + (img?.file_size || 0), 0);
        return { total, primary, totalSize };
    }, []);

    // Load apartments
    useEffect(() => {
        let isMounted = true;

        const loadApartments = async () => {
            try {
                setError(null);
                const res = await fetch('/api/admin/apartments');
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Failed to load apartments');
                }
                const data = await res.json();

                if (isMounted) {
                    setApartments(data.apartments || []);
                    if (data.apartments?.length) {
                        setSelectedApartmentId(data.apartments[0].id);
                    }
                }
            } catch (err) {
                console.error('Error loading apartments:', err);
                if (isMounted) {
                    setError(err.message || 'Failed to load apartments');
                }
            }
        };

        loadApartments();

        return () => {
            isMounted = false;
        };
    }, []);

    // Load images when apartment changes
    useEffect(() => {
        let isMounted = true;

        const loadImages = async () => {
            if (!selectedApartmentId) {
                if (isMounted) {
                    setImages([]);
                    setFilteredImages([]);
                    setStats({ total: 0, primary: 0, totalSize: 0 });
                    setLoading(false);
                }
                return;
            }

            try {
                if (isMounted) {
                    setLoading(true);
                    setError(null);
                }

                const res = await fetch(`/api/admin/gallery?apartmentId=${selectedApartmentId}`);
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Failed to load images');
                }
                const data = await res.json();

                if (isMounted) {
                    const imagesData = data.images || [];
                    setImages(imagesData);
                    setFilteredImages(imagesData);
                    setStats(calculateStats(imagesData));
                    setSelectedImages(new Set());
                }
            } catch (err) {
                console.error('Error loading images:', err);
                if (isMounted) {
                    setError(err.message || 'Failed to load images');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadImages();

        return () => {
            isMounted = false;
        };
    }, [selectedApartmentId, calculateStats]);

    // Filter and search images
    useEffect(() => {
        let result = images;

        // Search filter
        if (searchTerm) {
            result = result.filter(img =>
                img?.image_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filters
        if (selectedFilters.primary !== 'all') {
            result = result.filter(img =>
                selectedFilters.primary === 'primary' ? img?.is_primary : !img?.is_primary
            );
        }

        // Size filters
        if (selectedFilters.size !== 'all') {
            result = result.filter(img => {
                const sizeMB = (img?.file_size || 0) / 1024 / 1024;
                switch (selectedFilters.size) {
                    case 'small': return sizeMB < 1;
                    case 'medium': return sizeMB >= 1 && sizeMB < 5;
                    case 'large': return sizeMB >= 5;
                    default: return true;
                }
            });
        }

        setFilteredImages(result);
        setStats(calculateStats(result));
    }, [images, searchTerm, selectedFilters, calculateStats]);

    // Sort images
    const sortedImages = useMemo(() => {
        const sortableItems = [...filteredImages];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                let aValue = a?.[sortConfig.key];
                let bValue = b?.[sortConfig.key];

                // Handle null/undefined values
                if (aValue == null && bValue == null) return 0;
                if (aValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
                if (bValue == null) return sortConfig.direction === 'asc' ? 1 : -1;

                // Handle string comparison
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredImages, sortConfig]);

    // Event handlers
    const handleSort = useCallback((key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    }, []);

    const toggleImageSelection = useCallback((imageId) => {
        if (!imageId) return;

        setSelectedImages(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(imageId)) {
                newSelection.delete(imageId);
            } else {
                newSelection.add(imageId);
            }
            return newSelection;
        });
    }, []);

    const selectAllImages = useCallback(() => {
        const validImages = sortedImages.filter(img => img?.id);
        if (selectedImages.size === validImages.length) {
            setSelectedImages(new Set());
        } else {
            setSelectedImages(new Set(validImages.map(img => img.id)));
        }
    }, [sortedImages, selectedImages.size]);

    // Fixed deletion logic
    const openDeleteModal = useCallback((target) => {
        if (target instanceof Set || Array.isArray(target)) {
            // Handle bulk deletion
            const ids = Array.from(target instanceof Set ? target : target);
            setSelectedImage({
                type: 'bulk',
                ids: ids.filter(id => id) // Filter out any null/undefined IDs
            });
        } else if (target && typeof target === 'object') {
            // Handle single image deletion
            setSelectedImage({
                type: 'single',
                data: target
            });
        } else {
            console.error('Invalid target for deletion:', target);
            return;
        }
        setDeleteModalOpen(true);
    }, []);

    // Fixed deletion handler
    const handleDeleteImage = async (deleteTarget) => {
        if (!deleteTarget) return;

        try {
            setError(null);
            let idsToDelete = [];

            if (typeof deleteTarget === 'string') {
                // Single deletion by ID
                idsToDelete = [deleteTarget];
            } else if (deleteTarget.type === 'single' && deleteTarget.data?.id) {
                // Single deletion from modal
                idsToDelete = [deleteTarget.data.id];
            } else if (deleteTarget.type === 'bulk' && Array.isArray(deleteTarget.ids)) {
                // Bulk deletion from modal
                idsToDelete = deleteTarget.ids.filter(id => id); // Filter valid IDs
            } else if (Array.isArray(deleteTarget)) {
                // Bulk deletion from array
                idsToDelete = deleteTarget.filter(id => id);
            } else {
                throw new Error('Invalid delete target');
            }
            if (idsToDelete.length === 0) {
                throw new Error('No valid images to delete');
            }

            // Delete all images in parallel
            const deletePromises = idsToDelete.map(id =>
                fetch(`/api/admin/gallery/${id}`, {
                    method: 'DELETE'
                }).then(async (res) => {
                    if (!res.ok) {
                        const errorData = await res.json().catch(() => ({}));
                        throw new Error(errorData.message || `Failed to delete image ${id}`);
                    }
                    return id;
                })
            );

            const results = await Promise.allSettled(deletePromises);

            // Check for failures
            const failedDeletes = results.filter(result => result.status === 'rejected');
            if (failedDeletes.length > 0) {
                const errorMessages = failedDeletes.map(f => f.reason?.message || 'Unknown error').join(', ');
                throw new Error(`Failed to delete ${failedDeletes.length} images: ${errorMessages}`);
            }

            // Update state only for successfully deleted images
            const successfullyDeleted = results
                .filter(result => result.status === 'fulfilled')
                .map(result => result.value);

            setImages(prev => prev.filter(img => !successfullyDeleted.includes(img.id)));

            // Clear selections
            setSelectedImages(prev => {
                const newSelection = new Set(prev);
                successfullyDeleted.forEach(id => newSelection.delete(id));
                return newSelection;
            });

            // Close modals if needed
            if (selectedImage?.type === 'single' && successfullyDeleted.includes(selectedImage.data?.id)) {
                setEditModalOpen(false);
            }

            closeDeleteModal();

        } catch (err) {
            console.error('Error deleting image(s):', err);
            setError(err.message || 'Failed to delete image(s)');
        }
    };

    const handleBulkPrimary = async () => {
        if (!selectedImages.size) return;

        try {
            const firstId = Array.from(selectedImages)[0];
            await handleSetPrimary(firstId);
            setSelectedImages(new Set());
            setBulkActionsOpen(false);
        } catch (err) {
            console.error('Bulk primary set failed:', err);
            setError(err.message || 'Failed to set primary image');
        }
    };

    const handleUploadComplete = useCallback((newImages) => {
        if (!newImages || !Array.isArray(newImages)) return;

        setImages(prev => [...prev, ...newImages]);
        setSelectedImages(new Set());
    }, []);

    const closeDeleteModal = useCallback(() => {
        setDeleteModalOpen(false);
        setSelectedImage(null);
    }, []);

    const handleSetPrimary = async (id) => {
        if (!id) return;

        try {
            setError(null);
            const res = await fetch(`/api/admin/gallery/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_primary: true }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to set primary image');
            }

            setImages(prev => prev.map(img => ({
                ...img,
                is_primary: img.id === id
            })));

            if (selectedImage?.id === id) {
                setSelectedImage(prev => ({ ...prev, is_primary: true }));
            }
        } catch (err) {
            console.error('Error setting primary image:', err);
            setError(err.message || 'Failed to set primary image');
        }
    };

    const handleUpdateFileName = async (id, newName) => {
        if (!id || !newName) return;

        try {
            setError(null);
            const res = await fetch(`/api/admin/gallery/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_name: newName }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update image name');
            }

            setImages(prev => prev.map(img =>
                img.id === id ? { ...img, image_name: newName } : img
            ));

            if (selectedImage?.id === id) {
                setSelectedImage(prev => ({ ...prev, image_name: newName }));
            }
        } catch (err) {
            console.error('Error updating file name:', err);
            setError(err.message || 'Failed to update image name');
        }
    };

    const handleReplaceImage = async (id, file) => {
        if (!id || !file) return;

        try {
            setError(null);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('apartmentId', selectedApartmentId);

            const res = await fetch(`/api/admin/gallery/${id}/replace`, {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to replace image');
            }

            const updated = await res.json();
            const updatedImage = updated.image || updated;

            // Better cache busting logic
            const separator = updatedImage.image_url.includes('?') ? '&' : '?';
            const updatedImageWithCacheBust = {
                ...updatedImage,
                image_url: `${updatedImage.image_url}${separator}t=${new Date().getTime()}`
            };

            setImages(prev => prev.map(img =>
                img.id === id ? { ...img, ...updatedImageWithCacheBust } : img
            ));

            if (selectedImage?.id === id) {
                setSelectedImage(updatedImageWithCacheBust);
            }
            setLoadingImage(true);
        } catch (err) {
            console.error('Error replacing image:', err);
            setError(err.message || 'Failed to replace image');
        }
    };

    // Drag & drop handlers
    const handleDragStart = useCallback((e, index) => {
        if (!reorderMode) return;

        e.dataTransfer.setData('index', index.toString());
    }, [reorderMode]);

    const handleDragOver = useCallback((e) => {
        if (!reorderMode) return;

        e.preventDefault();
    }, [reorderMode]);

    const handleDrop = useCallback((e, targetIndex) => {
        if (!reorderMode) return;

        e.preventDefault();
        const sourceIndex = parseInt(e.dataTransfer.getData('index'));

        if (sourceIndex === targetIndex || isNaN(sourceIndex)) return;

        const updated = [...images];
        const [moved] = updated.splice(sourceIndex, 1);
        updated.splice(targetIndex, 0, moved);

        const reorderedImages = updated.map((img, i) => ({
            ...img,
            display_order: i + 1
        }));
        setImages(reorderedImages);
    }, [images, reorderMode]);

    const handleReorderSave = async () => {
        try {
            setError(null);
            const results = await Promise.allSettled(
                images.map((img, i) =>
                    fetch(`/api/admin/gallery/${img.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ display_order: i + 1 }),
                    })
                )
            );

            const failedUpdates = results.filter(result => result.status === 'rejected');
            if (failedUpdates.length > 0) {
                throw new Error(`Failed to save order for ${failedUpdates.length} images`);
            }

            setReorderMode(false);
        } catch (err) {
            console.error('Error saving order:', err);
            setError(err.message || 'Failed to save image order');
        }
    };

    const openEditModal = useCallback((img) => {
        if (!img?.id) return;

        setSelectedImage(img);
        setEditModalOpen(true);
        setLoadingImage(true);
    }, []);

    const closeEditModal = useCallback(() => {
        setEditModalOpen(false);
        setSelectedImage(null);
    }, []);

    const openPreview = useCallback((index) => {
        if (index < 0 || index >= sortedImages.length) return;

        setSelectedIndex(index);
        setImagePreviewOpen(true);
    }, [sortedImages.length]);

    const closePreview = useCallback(() => {
        setImagePreviewOpen(false);
        setSelectedIndex(0);
    }, []);

    // Close bulk actions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (bulkActionsOpen && !event.target.closest('.bulk-actions-container')) {
                setBulkActionsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [bulkActionsOpen]);

    // Loading state
    if (loading && !selectedApartmentId) {
        return (
            <div className="h-screen text-white p-6 flex items-center justify-center"
                style={{ maxHeight: 'calc(100vh - 96px)' }}
            >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <section className="min-h-screen bg-neutral-900">
            {/* Error Display */}
            {error && (
                <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faExclamation} />
                        <span>{error}</span>
                        <button
                            onClick={() => setError(null)}
                            className="ml-2 hover:text-neutral-200"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                </div>
            )}

            {/* Fixed Header - Enhanced Design */}
            <div className="sticky top-0 z-40 bg-neutral-900 border-b border-neutral-700 shadow-xl">
                <div className="max-w-7xl mx-auto p-4">
                    {/* Main Header Row */}
                    <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                        {/* Left Section - Title and Apartment Select */}
                        <div className='w-100'>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600 rounded-lg">
                                    <FontAwesomeIcon icon={faImages} className="text-white text-lg" />
                                </div>
                                <h1 className="text-xl font-bold text-white">Apartment Gallery</h1>
                            </div>
                        </div>
                        

                        {/* Right Section - Actions */}
                        <div className="flex w-full flex-row max-sm:flex-col gap-3">
                            <div className="flex-1 w-full">
                                <select
                                    value={selectedApartmentId}
                                    onChange={(e) => setSelectedApartmentId(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                >
                                    <option value="">Select Apartment...</option>
                                    {apartments.map(ap => (
                                        <option key={ap.id} value={ap.id}>
                                            {ap.title || `Apartment ${ap.id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='flex justify-between gap-4'>
                                {/* Upload Button */}
                                <button
                                    onClick={() => setShowMobileUpload(true)}
                                    disabled={!selectedApartmentId}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 disabled:from-neutral-600 disabled:to-neutral-700 text-white rounded-xl text-sm font-medium transition-all duration-200 hover:from-blue-700 hover:to-blue-800 disabled:hover:from-neutral-600 disabled:hover:to-neutral-700 shadow-lg hover:shadow-blue-500/25"
                                >
                                    <FontAwesomeIcon icon={faUpload} className="text-sm" />
                                    <span>Upload Images</span>
                                </button>

                                {/* Filters Toggle */}
                                <button
                                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded-xl text-sm font-medium transition-all duration-200 border border-neutral-600"
                                >
                                    <FontAwesomeIcon icon={faFilter} />
                                    <span>Filters</span>
                                </button>
                            </div>
                            
                        </div>
                    </div>

                    {/* Enhanced Mobile Filters Panel */}
                    {showMobileFilters && (
                        <div className="mt-6 p-4 bg-neutral-800/80 backdrop-blur-sm rounded-2xl border border-neutral-700 shadow-lg">
                            {/* Search Bar */}
                            <div className="relative mb-4">
                                <FontAwesomeIcon
                                    icon={faSearch}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 text-sm"
                                />
                                <input
                                    type="text"
                                    placeholder="Search images by name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-neutral-900 border border-neutral-600 rounded-xl text-white text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                />
                            </div>

                            {/* Filter Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                {/* Primary Filter */}
                                <div>
                                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                                        Image Type
                                    </label>
                                    <select
                                        value={selectedFilters.primary}
                                        onChange={(e) => setSelectedFilters(prev => ({ ...prev, primary: e.target.value }))}
                                        className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    >
                                        <option value="all">All Images</option>
                                        <option value="primary">Primary Only</option>
                                        <option value="secondary">Secondary Only</option>
                                    </select>
                                </div>

                                {/* Size Filter */}
                                <div>
                                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                                        File Size
                                    </label>
                                    <select
                                        value={selectedFilters.size}
                                        onChange={(e) => setSelectedFilters(prev => ({ ...prev, size: e.target.value }))}
                                        className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    >
                                        <option value="all">All Sizes</option>
                                        <option value="small">Small (&lt;1MB)</option>
                                        <option value="medium">Medium (1-5MB)</option>
                                        <option value="large">Large (&gt;5MB)</option>
                                    </select>
                                </div>

                                {/* Sort Options */}
                                <div>
                                    <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                                        Sort By
                                    </label>
                                    <select
                                        value={`${sortConfig.key}-${sortConfig.direction}`}
                                        onChange={(e) => {
                                            const [key, direction] = e.target.value.split('-');
                                            setSortConfig({ key, direction });
                                        }}
                                        className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    >
                                        <option value="display_order-asc">Order: Ascending</option>
                                        <option value="display_order-desc">Order: Descending</option>
                                        <option value="image_name-asc">Name: A-Z</option>
                                        <option value="image_name-desc">Name: Z-A</option>
                                        <option value="created_at-asc">Date: Oldest</option>
                                        <option value="created_at-desc">Date: Newest</option>
                                        <option value="file_size-asc">Size: Smallest</option>
                                        <option value="file_size-desc">Size: Largest</option>
                                    </select>
                                </div>
                            </div>

                            {/* View Mode and Actions */}
                            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4 border-t border-neutral-700">

                                {/* Quick Actions */}
                                <div className="flex items-center gap-2">
                                    {reorderMode ? (
                                        <button
                                            onClick={handleReorderSave}
                                            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all duration-200"
                                        >
                                            <FontAwesomeIcon icon={faSave} className="text-xs" />
                                            <span>Save Order</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setReorderMode(true)}
                                            className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all duration-200"
                                        >
                                            <FontAwesomeIcon icon={faSort} className="text-xs" />
                                            <span>Reorder</span>
                                        </button>
                                    )}

                                    <button
                                        onClick={selectAllImages}
                                        className="flex items-center gap-2 px-3 py-2 bg-neutral-600 hover:bg-neutral-500 text-white rounded-lg text-sm font-medium transition-all duration-200"
                                    >
                                        <span>{selectedImages.size === sortedImages.length ? 'Deselect All' : 'Select All'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>


            {/* Enhanced Stats Bar */}
            {images.length > 0 && (
                <div className="bg-neutral-900 border-b border-neutral-600 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 py-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            {/* Main Stats */}
                            <div className="flex flex-wrap items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-white">
                                        Total: <span className="text-blue-300">{stats.total}</span> images
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-white">
                                        Showing: <span className="text-purple-300">{filteredImages.length}</span>
                                    </span>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="flex items-center gap-4 text-xs text-neutral-300">
                                {searchTerm && (
                                    <span className="flex items-center gap-1 bg-neutral-700 px-2 py-1 rounded-lg">
                                        <FontAwesomeIcon icon={faSearch} className="text-xs" />
                                        Search: "{searchTerm}"
                                    </span>
                                )}
                                {(selectedFilters.primary !== 'all' || selectedFilters.size !== 'all') && (
                                    <span className="flex items-center gap-1 bg-neutral-700 px-2 py-1 rounded-lg">
                                        <FontAwesomeIcon icon={faFilter} className="text-xs" />
                                        Filters Active
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}


            <div className="max-w-7xl max-h-[80vh] overflow-y-auto mx-auto p-4">
                {/* Enhanced Mobile Upload Modal Header */}
                {showMobileUpload && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-neutral-900 rounded-2xl w-full max-w-4xl h-full max-h-[90vh] overflow-hidden border border-neutral-800 shadow-2xl">
                            {/* Enhanced Modal Header */}
                            <div className="relative p-6 bg-neutral-900 border-b border-neutral-800">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-600 rounded-lg">
                                            <FontAwesomeIcon icon={faUpload} className="text-white text-lg" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">Upload Images</h3>
                                            <p className="text-neutral-400 text-sm">
                                                Add new images to the gallery
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowMobileUpload(false)}
                                        className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-all duration-200"
                                    >
                                        <FontAwesomeIcon icon={faTimes} className="text-lg" />
                                    </button>
                                </div>
                            </div>

                            {/* FileUpload component remains the same */}
                            {selectedApartmentId && (
                                <FileUpload
                                    apartmentId={selectedApartmentId}
                                    existingImages={images}
                                    onUploadComplete={handleUploadComplete}
                                    maxFiles={20}
                                    onClose={() => setShowMobileUpload(false)}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Enhanced Save Reorder Section */}
                {reorderMode && images.length > 0 && (
                    <div className="sticky top-0 z-30 bg-gradient-to-r from-green-600 to-green-700 shadow-lg">
                        <div className="max-w-7xl mx-auto px-4 py-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-white/20 rounded-lg">
                                        <FontAwesomeIcon icon={faSort} className="text-white text-sm" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold">Reorder Mode Active</h4>
                                        <p className="text-green-100 text-sm">
                                            Drag and drop images to rearrange. Changes are saved automatically.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setReorderMode(false)}
                                        className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-all duration-200 border border-white/30"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleReorderSave}
                                        className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-white/90 text-green-700 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg"
                                    >
                                        <FontAwesomeIcon icon={faSave} className="text-sm" />
                                        <span>Save New Order</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Gallery Content */}
                {sortedImages.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-neutral-600 rounded-xl bg-neutral-900">
                        <FontAwesomeIcon icon={faImages} className="text-6xl text-neutral-500 mb-4" />
                        <p className="text-neutral-400 text-lg">No images found.</p>
                        <p className="text-neutral-500 text-sm mt-2">
                            {searchTerm || selectedFilters.primary !== 'all' || selectedFilters.size !== 'all'
                                ? 'Try changing your search or filters'
                                : 'Upload some images to get started.'}
                        </p>
                    </div>
                ) : (
                    <div
                        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-2 pb-20`}
                    >
                        {sortedImages.map((img, index) => {
                            if (!img || !img.id) return null;

                            return (
                                <div
                                    key={img.id}
                                    className={`relative bg-neutral-900 rounded-xl overflow-hidden border transition-all duration-300 shadow-lg hover:shadow-xl ${img?.is_primary
                                        ? 'border-yellow-600 ring-2 ring-yellow-500 ring-opacity-30'
                                        : 'border-neutral-700'
                                        } ${reorderMode ? 'cursor-grab active:cursor-grabbing' : ''} ${selectedImages.has(img.id)
                                            ? 'ring-2 ring-green-500 border-green-500'
                                            : ''
                                        }`}
                                    draggable={reorderMode}
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, index)}
                                >
                                    {/* Image Area */}
                                    <div
                                        className="relative aspect-square overflow-hidden bg-neutral-800 cursor-pointer group"
                                        onClick={() => openPreview(index)}
                                    >
                                        <img
                                            src={img?.image_url || '/placeholder.jpg'}
                                            alt={img?.image_name || 'Image'}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.src = '/placeholder.jpg';
                                            }}
                                        />

                                        {/* Overlay Controls */}
                                        <div className="absolute inset-0 z-20 flex flex-col justify-between p-2 pointer-events-none">
                                            {/* Top Row: Select + Primary + Edit/Delete */}
                                            <div className="flex justify-between items-start">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedImages.has(img.id)}
                                                    onChange={() => toggleImageSelection(img.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-4 h-4 accent-blue-500 bg-neutral-700 border-neutral-600 rounded pointer-events-auto"
                                                />

                                                <div className="flex gap-2 pointer-events-auto">

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openEditModal(img);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-700 rounded-full shadow-md transition pointer-events-auto"
                                                        title="Edit"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} className="text-lg" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openDeleteModal(img);
                                                        }}
                                                        className="text-red-600 hover:text-red-700 rounded-full shadow-md transition pointer-events-auto"
                                                        title="Delete"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} className="text-lg" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Bottom Center: Expand Icon on Hover */}
                                            <div className="absolute inset-0 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                                                <FontAwesomeIcon
                                                    icon={faExpand}
                                                    className="text-white text-2xl drop-shadow-lg"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info Strip Below Image */}
                                    <div className="p-3 bg-neutral-900/80 border-t border-neutral-800">
                                        <div className="flex justify-between items-center">
                                            <h4
                                                className="text-white text-sm font-medium truncate"
                                                title={img?.image_name}
                                            >
                                                {img?.image_name || 'Untitled'}
                                            </h4>

                                            {!img?.is_primary && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSetPrimary(img.id);
                                                    }}
                                                    className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition"
                                                >
                                                    Set Primary
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex justify-between items-center mt-2 text-xs text-neutral-400">
                                            <span className="flex items-center gap-1">
                                                <FontAwesomeIcon icon={faWeightHanging} className="text-xs" />
                                                <span>{((img?.file_size || 0) / 1024 / 1024).toFixed(1)} MB</span>
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FontAwesomeIcon icon={faCalendar} className="text-xs" />
                                                <span>
                                                    {img?.created_at
                                                        ? new Date(img.created_at).toLocaleDateString()
                                                        : '-'}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Bulk Actions Menu */}
            {selectedImages.size > 0 && (
                <div className="fixed bottom-4 right-4 bulk-actions-container z-30">
                    <div className="relative">
                        <button
                            onClick={() => setBulkActionsOpen(!bulkActionsOpen)}
                            className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-colors"
                        >
                            <FontAwesomeIcon icon={faSort} />
                            Bulk Actions ({selectedImages.size})
                        </button>

                        {bulkActionsOpen && (
                            <div className="absolute bottom-full right-0 mb-2 w-56 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg z-40">
                                <div className="py-2">
                                    <button
                                        onClick={handleBulkPrimary}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white hover:bg-neutral-700 transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faStar} />
                                        <span>Set First as Primary</span>
                                    </button>
                                    <button
                                        onClick={() => openDeleteModal(selectedImages)}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                        <span>Delete Selected</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Image Preview */}
            {imagePreviewOpen && (
                <ImagePreviewer
                    images={sortedImages}
                    initialIndex={selectedIndex}
                    imagePreviewOpen={imagePreviewOpen}
                    closeImagePreview={closePreview}
                />
            )}

            {/* Edit Modal */}
            {editModalOpen && selectedImage && selectedImage.type !== 'bulk' && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-neutral-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-neutral-700">
                        <div className="flex justify-between items-center p-6 border-b border-neutral-700">
                            <h3 className="text-lg font-semibold text-white">Edit Image</h3>
                            <button
                                onClick={closeEditModal}
                                className="text-neutral-400 hover:text-white transition-colors"
                            >
                                <FontAwesomeIcon icon={faTimes} className="text-sm" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Image Section */}
                                <div className="space-y-4">
                                    <div className="aspect-square bg-neutral-900 rounded-lg overflow-hidden relative">
                                        {loadingImage && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                                            </div>
                                        )}
                                        <img
                                            src={`${selectedImage.image_url}${selectedImage.image_url.includes('?') ? '&' : '?'}t=${new Date(selectedImage.updated_at || selectedImage.created_at).getTime()}`}
                                            alt={selectedImage.image_name}
                                            className={`w-full h-full object-cover transition-opacity duration-300 ${loadingImage ? 'opacity-0' : 'opacity-100'}`}
                                            onLoad={() => setLoadingImage(false)}
                                            onError={() => setLoadingImage(false)}
                                        />
                                    </div>

                                    {/* Image Actions */}
                                    <div className="flex flex-wrap gap-2">
                                        {!selectedImage.is_primary && (
                                            <button
                                                onClick={() => handleSetPrimary(selectedImage.id)}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex-1 min-w-[120px] justify-center"
                                            >
                                                <FontAwesomeIcon icon={faStar} className="text-xs" />
                                                <span>Set Primary</span>
                                            </button>
                                        )}

                                        <label className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex-1 min-w-[120px] justify-center cursor-pointer">
                                            <FontAwesomeIcon icon={faSync} className="text-sm" />
                                            <span>Replace</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => e.target.files[0] && handleReplaceImage(selectedImage.id, e.target.files[0])}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Info Section */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                                            Image Name
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={selectedImage.image_name || ''}
                                                onChange={(e) => setSelectedImage(prev => ({ ...prev, image_name: e.target.value }))}
                                                className="flex-1 px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <button
                                                onClick={() => handleUpdateFileName(selectedImage.id, selectedImage.image_name)}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                            >
                                                <FontAwesomeIcon icon={faSave} className="text-sm" />
                                                <span>Save</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Image Details */}
                                    <div className="space-y-3 p-4 bg-neutral-700 rounded-lg">
                                        <h4 className="font-medium text-white">Image Details</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-neutral-400">File Size:</span>
                                                <p className="text-white font-medium">
                                                    {((selectedImage.file_size || 0) / 1024 / 1024).toFixed(1)} MB
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-neutral-400">Uploaded:</span>
                                                <p className="text-white font-medium">
                                                    {selectedImage.created_at ? new Date(selectedImage.created_at).toLocaleDateString() : '-'}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-neutral-400">Status:</span>
                                                <p className="text-white font-medium">
                                                    {selectedImage.is_primary ? (
                                                        <span className="flex items-center gap-1 text-blue-400">
                                                            <FontAwesomeIcon icon={faStar} className="text-xs" />
                                                            Primary Image
                                                        </span>
                                                    ) : 'Secondary'}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-neutral-400">Display Order:</span>
                                                <p className="text-white font-medium">
                                                    {selectedImage.display_order || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Danger Zone */}
                                    <div className="p-4 border border-red-500 rounded-lg bg-red-900 bg-opacity-20">
                                        <h4 className="font-medium text-red-400 mb-2">Danger Zone</h4>
                                        <p className="text-red-300 text-sm mb-3">
                                            Once you delete this image, it cannot be recovered.
                                        </p>
                                        <button
                                            onClick={() => openDeleteModal(selectedImage)}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                        >
                                            <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                            <span>Delete Image</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && selectedImage && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-neutral-800 rounded-xl w-full max-w-md p-6 border border-neutral-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                                <FontAwesomeIcon icon={faExclamation} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">
                                    {selectedImage.type === 'bulk' ? 'Delete Selected Images' : 'Delete Image'}
                                </h3>
                                <p className="text-neutral-400 text-sm">This action cannot be undone.</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            {selectedImage.type === 'bulk' ? (
                                <p className="text-neutral-300">
                                    Are you sure you want to delete{" "}
                                    <strong className="text-white">{selectedImage.ids.length}</strong> selected images?
                                </p>
                            ) : (
                                <p className="text-neutral-300">
                                    Are you sure you want to delete{" "}
                                    <strong className="text-white">"{selectedImage.data.image_name}"</strong>?
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeDeleteModal}
                                className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={async () => await handleDeleteImage(selectedImage)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                                <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default ApartmentGallery;