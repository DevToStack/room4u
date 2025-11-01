import { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faXmark, faEdit, faTrash, faPlus, faFilter, faEye } from '@fortawesome/free-solid-svg-icons';

// Lazy-loaded components
const ApartmentForm = lazy(() => import('./ApartmentForm'));
const ApartmentRow = lazy(() => import('./ApartmentRow'));
const ConfirmModal = lazy(() => import('./ConfirmModal'));
const ApartmentDetailsModal = lazy(() => import('./detailsModal'));

// Initial form state with all new fields
const initialFormState = {
    title: '',
    description: '',
    location: '',
    price_per_night: '',
    max_guests: '',
    image_url: '',
    available: true,
    features: [],
    inclusions: [],
    rules: [],
    whyBook: [],
    policies: {
        cancellation: '',
        booking: ''
    }
};

const ApartmentsManager = () => {
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingAction, setLoadingAction] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingApartment, setEditingApartment] = useState(null);
    const [formData, setFormData] = useState(initialFormState);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, apartmentId: null, apartmentTitle: '' });
    const [detailsModal, setDetailsModal] = useState({ isOpen: false, apartment: null });

    const [filters, setFilters] = useState({
        search: '',
        location: '',
        availability: 'all',
        minPrice: '',
        maxPrice: '',
    });
    const [sortBy, setSortBy] = useState('id');
    const [sortOrder, setSortOrder] = useState('asc');
    const [showFilters, setShowFilters] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // 🔹 Fetch apartments from API
    const fetchApartments = async () => {
        try {
            const res = await fetch('/api/admin/apartments', { credentials: 'include' });
            const data = await res.json();
            if (res.ok) {
                setApartments(data.apartments || []);
            } else {
                console.error('Fetch error:', data.error);
            }
        } catch (err) {
            console.error('Error fetching apartments:', err);
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Fetch single apartment with all details for editing and viewing
    const fetchApartmentDetails = async (id) => {
        try {
            const res = await fetch(`/api/admin/apartments?id=${id}`, { credentials: 'include' });
            const data = await res.json();
            if (res.ok) return data.apartment;
            else console.error('Fetch details error:', data.error);
        } catch (err) {
            console.error('Error fetching apartment details:', err);
        }
        return null;
    };

    // Fetch on mount
    useEffect(() => {
        fetchApartments();
    }, []);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters, sortBy, sortOrder]);

    // 🔹 Filter + Sort apartments
    const filteredAndSortedApartments = useMemo(() => {
        if (!apartments || apartments.length === 0) return [];

        let filtered = apartments.filter((apartment) => {
            const matchesSearch =
                apartment.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
                apartment.description?.toLowerCase().includes(filters.search.toLowerCase());

            const matchesLocation =
                !filters.location || apartment.location?.toLowerCase().includes(filters.location.toLowerCase());

            const matchesAvailability =
                filters.availability === 'all' ||
                (filters.availability === 'available' && apartment.available) ||
                (filters.availability === 'unavailable' && !apartment.available);

            const matchesMinPrice = !filters.minPrice || apartment.price_per_night >= Number(filters.minPrice);
            const matchesMaxPrice = !filters.maxPrice || apartment.price_per_night <= Number(filters.maxPrice);

            return matchesSearch && matchesLocation && matchesAvailability && matchesMinPrice && matchesMaxPrice;
        });

        filtered.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            if (sortBy === 'price_per_night') {
                aValue = Number(aValue);
                bValue = Number(bValue);
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [apartments, filters, sortBy, sortOrder]);

    // 🔹 Pagination calculations
    const paginatedApartments = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedApartments.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAndSortedApartments, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredAndSortedApartments.length / itemsPerPage);

    // 🔹 Pagination functions
    const goToPage = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const nextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const prevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    // 🔹 View apartment details
    const handleViewDetails = async (apartment) => {
        setLoadingAction(true);
        try {
            const apartmentDetails = await fetchApartmentDetails(apartment.id);
            if (apartmentDetails) {
                setDetailsModal({ isOpen: true, apartment: apartmentDetails });
            } else {
                throw new Error('Failed to load apartment details');
            }
        } catch (error) {
            console.error('Error loading apartment details:', error);
            alert('Error loading apartment details. Please try again.');
        } finally {
            setLoadingAction(false);
        }
    };

    const closeDetailsModal = () => {
        setDetailsModal({ isOpen: false, apartment: null });
    };

    // 🔹 Save or update apartment
    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setLoadingAction(true);
        try {
            const method = editingApartment ? 'PUT' : 'POST';
            const response = await fetch('/api/admin/apartments', {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(editingApartment ? { ...formData, id: editingApartment.id } : formData),
            });
            if (response.ok) {
                resetForm();
                fetchApartments(); // ✅ Refresh list after save
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save apartment');
            }
        } catch (error) {
            console.error('Error saving apartment:', error);
            alert(error.message || 'Error saving apartment. Please try again.');
        } finally {
            setLoadingAction(false);
        }
    };

    // 🔹 Edit apartment - fetch complete details
    const handleEdit = async (apartment) => {
        setLoadingAction(true);
        try {
            const apartmentDetails = await fetchApartmentDetails(apartment.id);
            if (apartmentDetails) {
                setEditingApartment(apartmentDetails);
                setFormData({
                    title: apartmentDetails.title || '',
                    description: apartmentDetails.description || '',
                    location: apartmentDetails.location || '',
                    address1: apartmentDetails.location_data?.address1 || '',
                    city: apartmentDetails.location_data?.city || '',
                    district: apartmentDetails.location_data?.district || '',
                    state: apartmentDetails.location_data?.state || '',
                    pincode: apartmentDetails.location_data?.pincode || '',
                    country: apartmentDetails.location_data?.country || '',
                    price_per_night: apartmentDetails.price_per_night || '',
                    max_guests: apartmentDetails.max_guests || '',
                    image_url: apartmentDetails.image_url || '',
                    available: apartmentDetails.available || true,
                    features: apartmentDetails.features || [],
                    inclusions: apartmentDetails.inclusions || [],
                    rules: apartmentDetails.rules || [],
                    whyBook: apartmentDetails.whyBook || [],
                    policies: apartmentDetails.policies || { cancellation: '', booking: '' }
                });
                setShowForm(true);
            } else {
                throw new Error('Failed to load apartment details');
            }
        } catch (error) {
            console.error('Error loading apartment details:', error);
            alert('Error loading apartment details. Please try again.');
        } finally {
            setLoadingAction(false);
        }
    };

    // 🔹 Delete flow
    const handleDeleteClick = (apartment) => {
        setDeleteModal({
            isOpen: true,
            apartmentId: apartment.id,
            apartmentTitle: apartment.title
        });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.apartmentId) return;

        setLoadingAction(true);
        try {
            const response = await fetch(`/api/admin/apartments?id=${deleteModal.apartmentId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (response.ok) {
                fetchApartments(); // ✅ Refresh after delete
                setDeleteModal({ isOpen: false, apartmentId: null, apartmentTitle: '' });
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete apartment');
            }
        } catch (error) {
            console.error('Error deleting apartment:', error);
            alert(error.message || 'Error deleting apartment. Please try again.');
        } finally {
            setLoadingAction(false);
        }
    };

    const getImageUrl = (apartment) => apartment.image_url;

    const handleDeleteCancel = () => {
        setDeleteModal({ isOpen: false, apartmentId: null, apartmentTitle: '' });
    };

    // 🔹 Reset form
    const resetForm = () => {
        setShowForm(false);
        setEditingApartment(null);
        setFormData(initialFormState);
    };

    // 🔹 Add new apartment
    const handleAddNew = () => {
        setEditingApartment(null);
        setFormData(initialFormState);
        setShowForm(true);
    };

    const handleSort = (field) => {
        if (sortBy === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const clearFilters = () => {
        setFilters({ search: '', location: '', availability: 'all', minPrice: '', maxPrice: '' });
        // Hide filters on small screens after clearing
        if (window.innerWidth < 768) {
            setShowFilters(false);
        }
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    // 🔹 Generate pagination buttons
    const getPaginationButtons = () => {
        const buttons = [];
        const maxVisibleButtons = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

        // Adjust start page if we're near the end
        if (endPage - startPage + 1 < maxVisibleButtons) {
            startPage = Math.max(1, endPage - maxVisibleButtons + 1);
        }

        // First page
        if (startPage > 1) {
            buttons.push(1);
            if (startPage > 2) buttons.push('...');
        }

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            buttons.push(i);
        }

        // Last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) buttons.push('...');
            buttons.push(totalPages);
        }

        return buttons;
    };

    if (loading) {
        return (
            <div className="h-screen text-white p-6 flex items-center justify-center"
                style={{ maxHeight: 'calc(100vh - 96px)' }}
            >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <section className="max-sm:pb-16 h-full p-4 sm:p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <p className="text-neutral-400">
                        Showing {paginatedApartments.length} of {filteredAndSortedApartments.length} apartments
                        {filteredAndSortedApartments.length !== apartments.length &&
                            ` (filtered from ${apartments.length} total)`
                        }
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    {/* Filter Button for Small Screens */}
                    <button
                        onClick={toggleFilters}
                        className="md:hidden bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 px-4 py-2 rounded-lg flex items-center space-x-2 text-neutral-50 font-medium"
                    >
                        <FontAwesomeIcon icon={faFilter} />
                        <span className="text-xs sm:text-sm">Filters</span>
                    </button>

                    <button
                        onClick={handleAddNew}
                        className="bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 px-4 py-2 rounded-lg flex items-center space-x-2 text-neutral-50 font-medium"
                        disabled={loadingAction}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        <span className='text-xs sm:text-sm'>Add <span className='max-sm:hidden'>Apartment</span></span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className={`bg-neutral-800 rounded-xl p-4 mb-6 shadow-sm transition-all duration-300 ${showFilters ? 'block' : 'hidden md:block'
                }`}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="relative">
                        <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search apartments..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full pl-10 p-2 rounded-lg border border-neutral-600 bg-neutral-800 text-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                        />
                    </div>
                    <input
                        type="text"
                        placeholder="Filter by location..."
                        value={filters.location}
                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                        className="w-full p-2 rounded-lg border border-neutral-600 bg-neutral-800 text-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                    />
                    <select
                        value={filters.availability}
                        onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                        className="w-full p-2 rounded-lg border border-neutral-600 bg-neutral-800 text-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                    >
                        <option value="all">All Status</option>
                        <option value="available">Available</option>
                        <option value="unavailable">Unavailable</option>
                    </select>
                    <div className="flex space-x-2">
                        <input
                            type="number"
                            placeholder="Min price"
                            value={filters.minPrice}
                            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                            className="w-1/2 p-2 rounded-lg border border-neutral-600 bg-neutral-800 text-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                        />
                        <input
                            type="number"
                            placeholder="Max price"
                            value={filters.maxPrice}
                            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                            className="w-1/2 p-2 rounded-lg border border-neutral-600 bg-neutral-800 text-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <button
                        className="text-neutral-400 hover:text-neutral-50 text-sm flex items-center space-x-1 p-2 bg-neutral-700 rounded-md"
                        onClick={clearFilters}
                    >
                        <FontAwesomeIcon icon={faXmark} />
                        <span>Clear filters</span>
                    </button>

                    {/* Close filters button for mobile */}
                    <button
                        onClick={toggleFilters}
                        className="md:hidden text-neutral-400 hover:text-neutral-50 text-sm flex items-center space-x-1 p-2 bg-neutral-700 rounded-md"
                    >
                        <FontAwesomeIcon icon={faXmark} />
                        <span>Close</span>
                    </button>
                </div>
            </div>

            {/* Apartments Table */}
            <div className="bg-neutral-800 rounded-xl shadow-sm overflow-hidden mb-6">
                <div
                    className="overflow-y-auto overflow-x-auto"
                    style={{
                        maxHeight: 'calc(50vh)'
                    }}
                >
                    <table className="w-full text-left border-collapse text-neutral-50 min-w-[768px]">
                        {/* ---------- Table Header ---------- */}
                        <thead className="bg-neutral-700 sticky top-0 z-20">
                            <tr>
                                <th
                                    className="p-4 cursor-pointer text-sm font-semibold"
                                    onClick={() => handleSort('id')}
                                >
                                    ID
                                </th>
                                <th className="p-4 text-sm font-semibold">Apartment</th>
                                <th
                                    className="p-4 cursor-pointer text-sm font-semibold"
                                    onClick={() => handleSort('location')}
                                >
                                    Location
                                </th>
                                <th className="p-2 text-sm font-semibold">Max Guests</th>
                                <th
                                    className="p-4 cursor-pointer text-sm font-semibold"
                                    onClick={() => handleSort('price_per_night')}
                                >
                                    Price/Night
                                </th>
                                <th className="p-4 text-sm font-semibold">Available</th>
                                <th className="p-4 text-sm font-semibold">Actions</th>
                            </tr>
                        </thead>

                        {/* ---------- Table Body ---------- */}
                        <tbody className="divide-y divide-neutral-700">
                            {paginatedApartments.length > 0 ? (
                                paginatedApartments.map((apartment) => (
                                    <Suspense key={apartment.id} fallback={<TableRowSkeleton />}>
                                        <ApartmentRow
                                            apartment={apartment}
                                            onEdit={handleEdit}
                                            onDelete={handleDeleteClick}
                                            onViewDetails={handleViewDetails}
                                            loadingAction={loadingAction}
                                            getImageUrl={getImageUrl}
                                        />
                                    </Suspense>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="p-6 text-center text-neutral-400 text-sm"
                                    >
                                        {apartments.length === 0
                                            ? 'No apartments found. Create your first apartment!'
                                            : 'No apartments match your filters.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {filteredAndSortedApartments.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 bg-neutral-800 rounded-xl p-4">
                    {/* Items per page selector */}
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-neutral-400">Show</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-1 text-sm text-neutral-50 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <span className="text-sm text-neutral-400">apartments per page</span>
                    </div>

                    

                    {/* Pagination buttons */}
                    <div className="flex items-center gap-5">
                        {/* Previous button */}
                        <button
                            onClick={prevPage}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded-lg bg-neutral-700 text-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-600 transition-colors"
                        >
                            Previous
                        </button>

                        {/* Page info */}
                        <div className="text-sm text-neutral-400">
                            Page {currentPage} of {totalPages}
                        </div>

                        {/* Next button */}
                        <button
                            onClick={nextPage}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded-lg bg-neutral-700 text-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-600 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Apartment Form Modal */}
            {showForm && (
                <Suspense fallback={<FormSkeleton />}>
                    <ApartmentForm
                        editingApartment={editingApartment}
                        formData={formData}
                        setFormData={setFormData}
                        loading={loadingAction}
                        onSubmit={handleSubmit}
                        onCancel={resetForm}
                    />
                </Suspense>
            )}

            {/* Delete Confirmation */}
            {deleteModal.isOpen && (
                <Suspense fallback={<ConfirmModalSkeleton />}>
                    <ConfirmModal
                        isOpen={deleteModal.isOpen}
                        title="Delete Apartment"
                        message={`Are you sure you want to delete "${deleteModal.apartmentTitle}"?`}
                        onConfirm={handleDeleteConfirm}
                        onCancel={handleDeleteCancel}
                        confirmText="Delete"
                        cancelText="Cancel"
                        variant="danger"
                        loading={loadingAction}
                    />
                </Suspense>
            )}

            {/* Apartment Details Modal */}
            {detailsModal.isOpen && (
                <Suspense fallback={<DetailsModalSkeleton />}>
                    <ApartmentDetailsModal
                        apartment={detailsModal.apartment}
                        isOpen={detailsModal.isOpen}
                        onClose={closeDetailsModal}
                        getImageUrl={getImageUrl}
                    />
                </Suspense>
            )}
        </section>
    );
};

// Skeleton loaders
const TableRowSkeleton = () => (
    <tr className="border-b border-neutral-700 animate-pulse">
        <td className="p-4"><div className="h-4 bg-neutral-700 rounded w-8"></div></td>
        <td className="p-4"><div className="h-4 bg-neutral-700 rounded w-20"></div></td>
        <td className="p-4"><div className="h-4 bg-neutral-700 rounded w-20"></div></td>
        <td className="p-4"><div className="h-4 bg-neutral-700 rounded w-16"></div></td>
        <td className="p-4"><div className="h-6 bg-neutral-700 rounded w-12"></div></td>
    </tr>
);

const FormSkeleton = () => (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
        <div className="bg-neutral-900 p-6 rounded-xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="animate-pulse space-y-4">
                <div className="h-6 bg-neutral-700 rounded w-32 mb-4"></div>
                <div className="flex space-x-1 mb-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-8 bg-neutral-700 rounded w-20"></div>
                    ))}
                </div>
                <div className="h-64 bg-neutral-700 rounded"></div>
            </div>
        </div>
    </div>
);

const ConfirmModalSkeleton = () => (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
        <div className="bg-neutral-900 p-6 rounded-xl border border-white/10 w-full max-w-md animate-pulse">
            <div className="h-6 bg-neutral-700 rounded w-32 mb-4"></div>
            <div className="h-16 bg-neutral-700 rounded mb-4"></div>
            <div className="flex space-x-2">
                <div className="flex-1 h-10 bg-neutral-700 rounded"></div>
                <div className="flex-1 h-10 bg-neutral-700 rounded"></div>
            </div>
        </div>
    </div>
);

const DetailsModalSkeleton = () => (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
        <div className="bg-neutral-900 p-6 rounded-xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-pulse">
            <div className="h-6 bg-neutral-700 rounded w-48 mb-4"></div>
            <div className="h-64 bg-neutral-700 rounded mb-4"></div>
            <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-4 bg-neutral-700 rounded w-full"></div>
                ))}
            </div>
        </div>
    </div>
);

export default ApartmentsManager;