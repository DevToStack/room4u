'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function OffersPage() {
    const router = useRouter();
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [sendingEmail, setSendingEmail] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        discount_percentage: '',
        apartment_ids: '',
        valid_from: '',
        valid_until: ''
    });

    // Fetch all offers
    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            const response = await fetch('/api/offers');
            const data = await response.json();

            if (data.success) {
                setOffers(data.offers);
            }
        } catch (error) {
            console.error('Error fetching offers:', error);
            toast.error('Failed to load offers');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                ...formData,
                apartment_ids: formData.apartment_ids
                    ? formData.apartment_ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
                    : null,
                discount_percentage: parseFloat(formData.discount_percentage)
            };

            if (isEditing && editingId) {
                // Update existing offer
                payload.id = editingId;

                const response = await fetch('/api/offers', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                const data = await response.json();

                if (data.success) {
                    toast.success('Offer updated successfully!');
                    resetFormAndCloseModal();
                    fetchOffers();
                } else {
                    toast.error(data.error || 'Failed to update offer');
                }
            } else {
                // Create new offer
                const response = await fetch('/api/offers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                const data = await response.json();

                if (data.success) {
                    toast.success('Offer created successfully!');
                    resetFormAndCloseModal();
                    fetchOffers();

                    // Ask if admin wants to send emails now
                    if (confirm('Offer created successfully! Do you want to send email notifications to all users now?')) {
                        handleSendEmail(data.offerId);
                    }
                } else {
                    toast.error(data.error || 'Failed to create offer');
                }
            }
        } catch (error) {
            console.error('Error saving offer:', error);
            toast.error(`Failed to ${isEditing ? 'update' : 'create'} offer`);
        }
    };

    const handleSendEmail = async (offerId) => {
        setSendingEmail(offerId);

        try {
            const response = await fetch('/api/offers', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ offerId }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(data.message);

                // Update the offer's last_sent_at in the local state
                setOffers(prevOffers =>
                    prevOffers.map(offer =>
                        offer.id === offerId
                            ? { ...offer, last_sent_at: new Date().toISOString() }
                            : offer
                    )
                );
            } else {
                toast.error(data.error || 'Failed to send emails');
            }
        } catch (error) {
            console.error('Error sending emails:', error);
            toast.error('Failed to send emails');
        } finally {
            setSendingEmail(null);
        }
    };

    const parseApartmentIds = (value) => {
        if (!value) return '';

        // If already an array
        if (Array.isArray(value)) {
            return value.join(', ');
        }

        // If it's a string, try JSON.parse
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);

                if (Array.isArray(parsed)) {
                    return parsed.join(', ');
                }

                // If it's an object like { ids: [...] }
                if (parsed?.ids && Array.isArray(parsed.ids)) {
                    return parsed.ids.join(', ');
                }

                // Fallback: return as-is
                return value;
            } catch {
                // Not JSON, probably "1,2,3"
                return value;
            }
        }

        return '';
    };

    const handleEdit = (offer) => {
        setIsEditing(true);
        setEditingId(offer.id);

        setFormData({
            title: offer.title,
            description: offer.description || '',
            discount_percentage: offer.discount_percentage.toString(),
            apartment_ids: parseApartmentIds(offer.apartment_ids),
            valid_from: new Date(offer.valid_from).toISOString().split('T')[0],
            valid_until: new Date(offer.valid_until).toISOString().split('T')[0],
        });

        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this offer?')) return;

        try {
            const response = await fetch(`/api/offers/${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Offer deleted successfully');
                fetchOffers(); // Refresh list
            } else {
                toast.error(data.error || 'Failed to delete offer');
            }
        } catch (error) {
            console.error('Error deleting offer:', error);
            toast.error('Failed to delete offer');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const resetFormAndCloseModal = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData({
            title: '',
            description: '',
            discount_percentage: '',
            apartment_ids: '',
            valid_from: '',
            valid_until: ''
        });
        setShowModal(false);
    };

    const openCreateModal = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData({
            title: '',
            description: '',
            discount_percentage: '',
            apartment_ids: '',
            valid_from: '',
            valid_until: ''
        });
        setShowModal(true);
    };

    // Skeleton Loading Components
    const SkeletonCard = () => (
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden animate-pulse">
            <div className="p-6 border-b dark:border-neutral-700">
                <div className="h-6 bg-gray-200 dark:bg-neutral-700 rounded w-1/4"></div>
            </div>
            <div className="p-6">
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between py-4 border-b dark:border-neutral-700 last:border-0">
                            <div className="space-y-2 flex-1">
                                <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 dark:bg-neutral-700 rounded w-1/2"></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-8 bg-gray-200 dark:bg-neutral-700 rounded w-20"></div>
                                <div className="h-8 bg-gray-200 dark:bg-neutral-700 rounded w-20"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const SkeletonTable = () => (
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden animate-pulse">
            <div className="p-6 border-b dark:border-neutral-700">
                <div className="h-6 bg-gray-200 dark:bg-neutral-700 rounded w-1/4"></div>
            </div>
            <div className="overflow-x-auto p-6">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-neutral-700">
                        <tr>
                            {['Title', 'Discount', 'Validity', 'Actions'].map((header) => (
                                <th key={header} className="py-4 px-6 text-left">
                                    <div className="h-4 bg-gray-300 dark:bg-neutral-600 rounded w-24"></div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                        {[1, 2, 3, 4].map((row) => (
                            <tr key={row} className="hover:bg-gray-50 dark:hover:bg-neutral-750 transition-colors">
                                {[1, 2, 3, 4].map((col) => (
                                    <td key={col} className="py-4 px-6">
                                        <div className="space-y-2">
                                            <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-3/4"></div>
                                            {col === 1 && (
                                                <div className="h-3 bg-gray-200 dark:bg-neutral-700 rounded w-1/2"></div>
                                            )}
                                            {col === 3 && (
                                                <div className="h-3 bg-gray-200 dark:bg-neutral-700 rounded w-2/3"></div>
                                            )}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const SkeletonButton = () => (
        <div className="bg-gradient-to-r from-gray-300 to-gray-400 dark:from-neutral-700 dark:to-neutral-600 rounded-lg h-12 w-40 animate-pulse"></div>
    );

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                {/* Header Skeleton */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 animate-pulse">
                    <div className="space-y-3">
                        <div className="h-8 bg-gray-300 dark:bg-neutral-700 rounded w-48"></div>
                        <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-64"></div>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <SkeletonButton />
                    </div>
                </div>

                {/* Offers List Skeleton */}
                <SkeletonTable />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header with Add Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Special Offers
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Create and manage promotional offers for your apartments</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="mt-4 md:mt-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 transform hover:-translate-y-0.5"
                >
                    <i className="fas fa-plus-circle"></i>
                    Add New Offer
                </button>
            </div>

            {/* Offers List */}
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-neutral-700">
                <div className="p-6 border-b dark:border-neutral-700 bg-gradient-to-r from-gray-50 to-white dark:from-neutral-800 dark:to-neutral-900">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                                <i className="fas fa-tags text-white"></i>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Current Offers
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {offers.length} offer{offers.length !== 1 ? 's' : ''} • {offers.filter(o => new Date(o.valid_until) >= new Date()).length} active
                                </p>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            <i className="fas fa-sync-alt mr-2"></i>
                            Updated just now
                        </div>
                    </div>
                </div>

                {offers.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center">
                            <i className="fas fa-tag text-gray-400 text-3xl"></i>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No offers yet</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                            Create your first special offer to attract more customers and boost your bookings
                        </p>
                        <button
                            onClick={openCreateModal}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center gap-3 transform hover:-translate-y-0.5"
                        >
                            <i className="fas fa-magic"></i>
                            Create Your First Offer
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-white dark:from-neutral-800 dark:to-neutral-900">
                                <tr>
                                    <th className="py-5 px-6 text-left text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                        <i className="fas fa-gift mr-3 text-blue-500"></i>
                                        Offer Details
                                    </th>
                                    <th className="py-5 px-6 text-left text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                        <i className="fas fa-percentage mr-3 text-green-500"></i>
                                        Discount
                                    </th>
                                    <th className="py-5 px-6 text-left text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                        <i className="fas fa-calendar-alt mr-3 text-purple-500"></i>
                                        Validity Period
                                    </th>
                                    <th className="py-5 px-6 text-left text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                        <i className="fas fa-cogs mr-3 text-yellow-500"></i>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
                                {offers.map((offer) => {
                                    const isExpired = new Date(offer.valid_until) < new Date();
                                    const isActive = new Date(offer.valid_from) <= new Date() && !isExpired;
                                    const canSendEmail = isActive;
                                    const daysLeft = Math.ceil((new Date(offer.valid_until) - new Date()) / (1000 * 60 * 60 * 24));

                                    return (
                                        <tr key={offer.id} className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-neutral-800 dark:hover:to-neutral-800 transition-all duration-200">
                                            <td className="py-5 px-6">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex-shrink-0">
                                                        <div className={`p-3 rounded-xl ${isExpired ? 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-neutral-800 dark:to-neutral-700' : 'bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30'}`}>
                                                            <i className={`fas fa-tag ${isExpired ? 'text-gray-400' : 'text-blue-500'}`}></i>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <p className="font-bold text-lg text-gray-900 dark:text-white truncate">
                                                                {offer.title}
                                                            </p>
                                                            {isExpired && (
                                                                <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900/30 dark:to-red-800/30 dark:text-red-300 rounded-full">
                                                                    <i className="fas fa-clock mr-1"></i>
                                                                    Expired
                                                                </span>
                                                            )}
                                                            {isActive && (
                                                                <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300 rounded-full">
                                                                    <i className="fas fa-bolt mr-1"></i>
                                                                    Active • {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                                                                </span>
                                                            )}
                                                        </div>
                                                        {offer.description && (
                                                            <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                                                <i className="fas fa-align-left mr-2 text-gray-400"></i>
                                                                {offer.description}
                                                            </p>
                                                        )}
                                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                            <span className="flex items-center gap-2">
                                                                <i className="fas fa-clock text-blue-400"></i>
                                                                Created: {new Date(offer.created_at).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })}
                                                            </span>
                                                            {offer.last_sent_at && (
                                                                <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                                                    <i className="fas fa-paper-plane"></i>
                                                                    Sent: {new Date(offer.last_sent_at).toLocaleDateString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric'
                                                                    })}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                                                    <span className="text-2xl font-bold text-green-700 dark:text-green-300">
                                                        {offer.discount_percentage}%
                                                    </span>
                                                    <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                                                        OFF
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                                                        <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                                                            <i className="fas fa-play text-blue-500 dark:text-blue-400"></i>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">Starts</div>
                                                            <div className="font-medium text-gray-900 dark:text-white">
                                                                {new Date(offer.valid_from).toLocaleDateString('en-US', {
                                                                    weekday: 'short',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 p-2 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg">
                                                        <div className="p-2 bg-red-100 dark:bg-red-800/30 rounded-lg">
                                                            <i className="fas fa-stop text-red-500 dark:text-red-400"></i>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">Ends</div>
                                                            <div className={`font-medium ${isExpired ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                                                                {new Date(offer.valid_until).toLocaleDateString('en-US', {
                                                                    weekday: 'short',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(offer)}
                                                        className="p-3 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-600 dark:text-blue-300 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 flex items-center gap-2"
                                                        title="Edit Offer"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                        <span className="hidden lg:inline text-sm font-medium">Edit</span>
                                                    </button>

                                                    <button
                                                        onClick={() => handleSendEmail(offer.id)}
                                                        disabled={sendingEmail === offer.id || !canSendEmail}
                                                        className={`p-3 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 flex items-center gap-2 ${canSendEmail
                                                            ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-600 dark:text-green-300 hover:from-green-200 hover:to-emerald-200'
                                                            : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-neutral-700 dark:to-neutral-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                                            }`}
                                                        title={canSendEmail ? "Send Email to All Users" : isExpired ? "Cannot send email for expired offers" : "Offer not yet active"}
                                                    >
                                                        {sendingEmail === offer.id ? (
                                                            <>
                                                                <i className="fas fa-spinner fa-spin"></i>
                                                                <span className="hidden lg:inline text-sm font-medium">Sending...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="fas fa-paper-plane"></i>
                                                                <span className="hidden lg:inline text-sm font-medium">Send</span>
                                                            </>
                                                        )}
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(offer.id)}
                                                        className="p-3 bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 text-red-600 dark:text-red-300 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 flex items-center gap-2"
                                                        title="Delete Offer"
                                                    >
                                                        <i className="fas fa-trash-alt"></i>
                                                        <span className="hidden lg:inline text-sm font-medium">Delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal for Create/Edit Offer Form */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-neutral-700 animate-slideUp">
                        {/* Modal Header */}
                        <div className="p-6 border-b dark:border-neutral-700 bg-gradient-to-r from-gray-50 to-white dark:from-neutral-800 dark:to-neutral-900">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${isEditing ? 'from-yellow-400 to-orange-400' : 'from-blue-400 to-indigo-400'}`}>
                                        <i className={`fas ${isEditing ? 'fa-edit' : 'fa-gift'} text-white`}></i>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {isEditing ? 'Edit Offer' : 'Create New Offer'}
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {isEditing ? 'Update your offer details' : 'Create an amazing offer for your customers'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={resetFormAndCloseModal}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                                >
                                    <i className="fas fa-times text-xl text-gray-500 dark:text-gray-400"></i>
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-900 dark:text-white">
                                            <i className="fas fa-heading mr-2 text-blue-500"></i>
                                            Title *
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-800 dark:text-white transition-all duration-200"
                                            placeholder="e.g., Summer Special 2024"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-900 dark:text-white">
                                            <i className="fas fa-percentage mr-2 text-green-500"></i>
                                            Discount Percentage *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="discount_percentage"
                                                value={formData.discount_percentage}
                                                onChange={handleChange}
                                                min="1"
                                                max="100"
                                                step="0.01"
                                                className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-neutral-800 dark:text-white transition-all duration-200"
                                                placeholder="20"
                                                required
                                            />
                                            <div className="absolute left-4 top-3 text-gray-500">
                                                <i className="fas fa-percent"></i>
                                            </div>
                                            <div className="absolute right-4 top-3 text-gray-500 text-sm">
                                                % OFF
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white">
                                        <i className="fas fa-align-left mr-2 text-purple-500"></i>
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-neutral-800 dark:text-white transition-all duration-200 resize-none"
                                        rows="3"
                                        placeholder="Describe what makes this offer special and any terms & conditions..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-900 dark:text-white">
                                            <i className="fas fa-calendar-start mr-2 text-blue-500"></i>
                                            Start Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="valid_from"
                                            value={formData.valid_from}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-800 dark:text-white transition-all duration-200"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-900 dark:text-white">
                                            <i className="fas fa-calendar-times mr-2 text-red-500"></i>
                                            End Date *
                                        </label>
                                        <input
                                            type="date"
                                            name="valid_until"
                                            value={formData.valid_until}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-neutral-800 dark:text-white transition-all duration-200"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-900 dark:text-white">
                                            <i className="fas fa-building mr-2 text-yellow-500"></i>
                                            Apartment IDs
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="apartment_ids"
                                                value={formData.apartment_ids}
                                                onChange={handleChange}
                                                placeholder="101, 205, 307"
                                                className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-neutral-800 dark:text-white transition-all duration-200"
                                            />
                                            <div className="absolute left-4 top-3 text-gray-500">
                                                <i className="fas fa-hashtag"></i>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            <i className="fas fa-info-circle mr-1"></i>
                                            Leave empty to apply to all apartments
                                        </p>
                                    </div>
                                </div>

                                {/* Email Notice */}
                                {!isEditing && (
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                                                <i className="fas fa-bell text-blue-500"></i>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-blue-800 dark:text-blue-300">Email Notification</h4>
                                                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                                                    After creating this offer, we'll ask if you want to notify all registered users via email immediately.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Modal Footer */}
                                <div className="flex justify-end gap-4 pt-6 border-t dark:border-neutral-700">
                                    <button
                                        type="button"
                                        onClick={resetFormAndCloseModal}
                                        className="px-6 py-3 border border-gray-300 dark:border-neutral-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-all duration-200 flex items-center gap-2"
                                    >
                                        <i className="fas fa-times"></i>
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 transform hover:-translate-y-0.5"
                                    >
                                        <i className={`fas ${isEditing ? 'fa-save' : 'fa-plus-circle'}`}></i>
                                        {isEditing ? 'Update Offer' : 'Create Offer'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}