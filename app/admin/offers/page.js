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

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header with Add Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Special Offers</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Create and manage promotional offers for your apartments</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="mt-4 md:mt-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                >
                    <i className="fas fa-plus-circle"></i>
                    Add New Offer
                </button>
            </div>

            {/* Offers List */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b dark:border-neutral-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <i className="fas fa-tags text-blue-500"></i>
                        Current Offers ({offers.length})
                    </h2>
                </div>

                {offers.length === 0 ? (
                    <div className="text-center py-12">
                        <i className="fas fa-tag text-gray-400 text-5xl mb-4"></i>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No offers yet</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first offer to attract more customers</p>
                        <button
                            onClick={openCreateModal}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2"
                        >
                            <i className="fas fa-plus"></i>
                            Create First Offer
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-neutral-700">
                                <tr>
                                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                        <i className="fas fa-heading mr-2"></i>
                                        Title
                                    </th>
                                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                        <i className="fas fa-percentage mr-2"></i>
                                        Discount
                                    </th>
                                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                        <i className="fas fa-calendar-alt mr-2"></i>
                                        Validity
                                    </th>
                                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                        <i className="fas fa-cogs mr-2"></i>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                                {offers.map((offer) => {
                                    const isExpired = new Date(offer.valid_until) < new Date();
                                    const isActive = new Date(offer.valid_from) <= new Date() && !isExpired;
                                    const canSendEmail = isActive;

                                    return (
                                        <tr key={offer.id} className="">
                                            <td className="py-4 px-6">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-gray-900 dark:text-white">{offer.title}</p>
                                                        {isExpired && (
                                                            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded">
                                                                Expired
                                                            </span>
                                                        )}
                                                        {isActive && (
                                                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                                                                Active
                                                            </span>
                                                        )}
                                                    </div>
                                                    {offer.description && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                            <i className="fas fa-align-left mr-2 text-xs"></i>
                                                            {offer.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        <span>
                                                            <i className="fas fa-clock mr-1"></i>
                                                            Created: {new Date(offer.created_at).toLocaleDateString()}
                                                        </span>
                                                        {offer.last_sent_at && (
                                                            <span className="text-green-600 dark:text-green-400">
                                                                <i className="fas fa-paper-plane mr-1"></i>
                                                                Sent: {new Date(offer.last_sent_at).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900 dark:to-emerald-900 dark:text-green-200">
                                                    <i className="fas fa-tag mr-2"></i>
                                                    {offer.discount_percentage}% OFF
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <i className="fas fa-play-circle text-blue-500"></i>
                                                        <span className="text-gray-700 dark:text-gray-300">
                                                            {new Date(offer.valid_from).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm mt-1">
                                                        <i className="fas fa-stop-circle text-red-500"></i>
                                                        <span className={`${isExpired ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                                            {new Date(offer.valid_until).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(offer)}
                                                        className="text-blue-300 flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-900/60"
                                                        title="Edit Offer"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                        <span className="hidden md:inline">Edit</span>
                                                    </button>

                                                    <button
                                                        onClick={() => handleSendEmail(offer.id)}
                                                        disabled={sendingEmail === offer.id || !canSendEmail}
                                                        className={`${canSendEmail
                                                            ? 'text-green-600 dark:text-green-400 dark:text-green-300 bg-green-900/60'
                                                            : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                                            } transition-colors flex items-center gap-2 px-3 py-2 rounded-lg`}
                                                        title={canSendEmail ? "Send Email to All Users" : "Cannot send email for expired offers"}
                                                    >
                                                        {sendingEmail === offer.id ? (
                                                            <>
                                                                <i className="fas fa-spinner fa-spin"></i>
                                                                <span className="hidden md:inline">Sending...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="fas fa-paper-plane"></i>
                                                                <span className="hidden md:inline">Send Email</span>
                                                            </>
                                                        )}
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(offer.id)}
                                                        className="text-red-600 dark:text-red-400 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-900/60"
                                                        title="Delete Offer"
                                                    >
                                                        <i className="fas fa-trash-alt"></i>
                                                        <span className="hidden md:inline">Delete</span>
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="p-6 border-b dark:border-neutral-700 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                    <i className={`fas ${isEditing ? 'fa-edit' : 'fa-gift'} text-blue-500`}></i>
                                    {isEditing ? 'Edit Offer' : 'Create New Offer'}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    {isEditing ? 'Update the offer details below' : 'Fill in the details below to create a promotional offer'}
                                </p>
                            </div>
                            <button
                                onClick={resetFormAndCloseModal}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                                            <i className="fas fa-heading mr-2 text-blue-500"></i>
                                            Title *
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:text-white transition"
                                            placeholder="Summer Special"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
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
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-neutral-700 dark:text-white transition"
                                                placeholder="20"
                                                required
                                            />
                                            <div className="absolute right-3 top-3 text-gray-500">
                                                <i className="fas fa-percent"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                                        <i className="fas fa-align-left mr-2 text-purple-500"></i>
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-neutral-700 dark:text-white transition"
                                        rows="3"
                                        placeholder="Describe the offer details..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                                            <i className="fas fa-calendar-start mr-2 text-blue-500"></i>
                                            Valid From *
                                        </label>
                                        <input
                                            type="date"
                                            name="valid_from"
                                            value={formData.valid_from}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:text-white transition"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                                            <i className="fas fa-calendar-times mr-2 text-red-500"></i>
                                            Valid Until *
                                        </label>
                                        <input
                                            type="date"
                                            name="valid_until"
                                            value={formData.valid_until}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-neutral-700 dark:text-white transition"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                                            <i className="fas fa-building mr-2 text-yellow-500"></i>
                                            Apartment IDs
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="apartment_ids"
                                                value={formData.apartment_ids}
                                                onChange={handleChange}
                                                placeholder="e.g., 101, 205, 307"
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-neutral-700 dark:text-white transition"
                                            />
                                            <div className="absolute right-3 top-3 text-gray-500">
                                                <i className="fas fa-info-circle" title="Leave empty to apply to all apartments"></i>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            Leave empty to apply offer to all apartments
                                        </p>
                                    </div>
                                </div>

                                {/* Email Notice */}
                                {!isEditing && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <i className="fas fa-envelope text-blue-500 text-lg mt-1"></i>
                                            <div>
                                                <h4 className="font-medium text-blue-800 dark:text-blue-300">Email Notification</h4>
                                                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                                                    After creating this offer, you&apos;ll be prompted to send email notifications to all registered users.
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
                                        className="px-6 py-3 border border-gray-300 dark:border-neutral-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors flex items-center gap-2"
                                    >
                                        <i className="fas fa-times"></i>
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
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