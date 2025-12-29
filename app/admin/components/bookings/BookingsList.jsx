import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faChevronDown, faCheckCircle, faBan, faTrash, faTimes, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

const BookingsList = ({
    bookings,
    loading,
    pagination,
    onPageChange,
    onViewBooking,
    onStatusUpdate,
    onDeleteBooking,
}) => {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [cancelReason, setCancelReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    // First, create a state for the document handling
    const [documentType, setDocumentType] = useState('');
    const [documentData, setDocumentData] = useState({});
    const [documentErrors, setDocumentErrors] = useState({});
    // Add to your existing useState declarations
    const [documentUrls, setDocumentUrls] = useState({});
    const [loadingDocuments, setLoadingDocuments] = useState(false);
    const [activeDocumentTab, setActiveDocumentTab] = useState('front');
    const [initialDocumentData, setInitialDocumentData] = useState({});
    const [showDuplicateDocModal, setShowDuplicateDocModal] = useState(false);
    const [existingDocData, setExistingDocData] = useState(null);

    // Add documentSchemas to your component or import it
    const documentSchemas = {
        aadhaar: {
            required: ['aadhaar_number', 'name', 'dob', 'gender', 'address', 'state', 'pincode', 'front_image_url', 'back_image_url'],
            labels: {
                aadhaar_number: 'Aadhaar Number',
                name: 'Full Name',
                dob: 'Date of Birth',
                gender: 'Gender',
                address: 'Address',
                state: 'State',
                pincode: 'Pincode',
                front_image_url: 'Front Image URL',
                back_image_url: 'Back Image URL'
            }
        },
        pan: {
            required: ['pan_number', 'name', 'father_name', 'dob', 'front_image_url'],
            labels: {
                pan_number: 'PAN Number',
                name: 'Full Name',
                father_name: "Father's Name",
                dob: 'Date of Birth',
                front_image_url: 'Photo URL'
            }
        },
        driving_license: {
            required: ['dl_number', 'name', 'dob', 'validity_from', 'validity_to', 'address', 'rto', 'front_image_url', 'back_image_url'],
            labels: {
                dl_number: 'Driving License Number',
                name: 'Full Name',
                dob: 'Date of Birth',
                validity_from: 'Validity From',
                validity_to: 'Validity To',
                address: 'Address',
                rto: 'RTO',
                front_image_url: 'Front Image URL',
                back_image_url: 'Back Image URL'
            }
        },
        passport: {
            required: ['passport_number', 'name', 'dob', 'nationality', 'place_of_issue', 'expiry_date', 'front_image_url'],
            labels: {
                passport_number: 'Passport Number',
                name: 'Full Name',
                dob: 'Date of Birth',
                nationality: 'Nationality',
                place_of_issue: 'Place of Issue',
                expiry_date: 'Expiry Date',
                front_image_url: 'Front Image URL'
            }
        },
        voter_id: {
            required: ['epic_number', 'name', 'father_or_mother_name', 'dob', 'address', 'front_image_url'],
            labels: {
                epic_number: 'EPIC Number',
                name: 'Full Name',
                father_or_mother_name: "Father's/Mother's Name",
                dob: 'Date of Birth',
                address: 'Address',
                front_image_url: 'Front Image URL'
            }
        }
    };

    const getDocumentActionConfig = (documentStatus) => {
        switch (documentStatus) {
            case "approved":
                return {
                    label: "Verified",
                    variant: "confirm",
                    disabled: true,
                    icon: faCheckCircle,
                };
            case "rejected":
                return {
                    label: "Verify",
                    variant: "delete",
                    disabled: false,
                    icon: faExclamationTriangle,
                };
            default:
                return {
                    label: "Verify",
                    variant: "cancel",
                    disabled: false,
                    icon: faExclamationTriangle,
                };
        }
    };

    const canShowCancelButton = (bookingStatus) => {
        return !["confirmed", "expired", "ongoing","cancelled"].includes(bookingStatus);
    };
    
    // Update the handleDocumentTypeChange function
    const handleDocumentTypeChange = (type) => {
        setDocumentType(type);
        // Initialize document data with empty values
        const initialData = {};
        documentSchemas[type]?.required.forEach(field => {
            initialData[field] = '';
        });

        // Auto-fill URL fields from initialDocumentData
        Object.entries(initialDocumentData).forEach(([fieldName, url]) => {
            if (documentSchemas[type]?.required.includes(fieldName)) {
                initialData[fieldName] = url;
            }
        });

        setDocumentData(initialData);
        setDocumentErrors({});
    };

    const handleDocumentFieldChange = (field, value) => {
        setDocumentData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (documentErrors[field]) {
            setDocumentErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateDocument = () => {
        if (!documentType) {
            alert('Please select a document type');
            return false;
        }

        const errors = {};
        const schema = documentSchemas[documentType];

        schema.required.forEach(field => {
            if (!documentData[field]?.trim()) {
                errors[field] = `${schema.labels[field]} is required`;
            }
        });

        setDocumentErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            pending: "bg-yellow-500/20 text-yellow-400",
            confirmed: "bg-green-500/20 text-green-400",
            cancelled: "bg-red-500/20 text-red-400",
            expired: "bg-gray-500/20 text-gray-400",
            ongoing: "bg-blue-500/20 text-blue-400",
        };
        return (
            <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || "bg-gray-500/20 text-gray-400"
                    }`}
            >
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getPaymentBadge = (paymentStatus) => {
        const paymentColors = {
            paid: "bg-green-500/20 text-green-400",
            failed: "bg-red-500/20 text-red-400",
            refunded: "bg-blue-500/20 text-blue-400",
            cancelled: "bg-gray-500/20 text-gray-400",
        };
        return (
            <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${paymentColors[paymentStatus] || "bg-gray-500/20 text-gray-400"
                    }`}
            >
                {paymentStatus
                    ? paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)
                    : "N/A"}
            </span>
        );
    };

    const handleQuickStatusUpdate = async (bookingId, newStatus) => {
        if (newStatus === "cancelled") {
            setSelectedBooking(bookingId);
            setCancelReason("");
            setShowCancelModal(true);
        } else if (newStatus === "confirmed") {
            // Get the booking to extract user_id
            const booking = bookings.find(b => b.id === bookingId);
            if (booking && booking.user_id) {
                setSelectedBooking(bookingId);

                // Check for existing verification history first
                // This function will automatically fetch images from verify-document API if exists,
                // or fall back to document API for new verification
                await fetchDocumentVerificationHistory(booking.user_id);

                // Show the confirm modal (showDuplicateDocModal will show first if existing doc found)
                if (!showDuplicateDocModal) {
                    setShowConfirmModal(true);
                }
            }
        } else {
            await onStatusUpdate(bookingId, newStatus);
        }
    };

    const handleConfirmBooking = async () => {
        if (!validateDocument()) {
            alert('Please fill all required document fields correctly');
            return;
        }

        setActionLoading(true);
        try {
            // Get the booking to extract user_id
            const booking = bookings.find(b => b.id === selectedBooking);

            if (booking && booking.user_id) {
                // Call the document verification API
                const verificationResponse = await fetch('/api/admin/verify-document', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: booking.user_id,
                        booking_id: selectedBooking,
                        document_type: documentType,
                        document_data: documentData,
                        status: 'approved',
                        verification_notes: 'Verified during booking confirmation',
                        review_message: 'Document verified and booking approved'
                    })
                });

                const verificationData = await verificationResponse.json();

                if (!verificationData.success) {
                    throw new Error(verificationData.message || 'Document verification failed');
                }

                // Only after successful verification, update booking status
                await onStatusUpdate(selectedBooking, "confirmed");

                // Show success message
                alert('Booking confirmed and document verified successfully!');

                // Reset states
                closeModals();
            }
        } catch (error) {
            console.error('Error confirming booking:', error);
            alert(`Failed to confirm booking: ${error.message}`);
        } finally {
            setActionLoading(false);
        }
    };

    const fetchDocumentVerificationHistory = async (userId) => {
        try {
            const response = await fetch(`/api/admin/verify-document?user_id=${userId}`);
            const data = await response.json();

            if (data.success && data.documents.length > 0) {
                // Find the most recent approved document
                const latestDoc = data.documents.find(doc => doc.status === 'approved');

                if (latestDoc) {
                    // Store the existing document data for the modal
                    setExistingDocData(latestDoc);

                    // Extract image URLs from existing verified document
                    const existingDocUrls = {};
                    Object.entries(latestDoc.document_data).forEach(([key, value]) => {
                        if (key.includes('_image_url') || key.includes('_url')) {
                            const cleanKey = key.replace('_image_url', '').replace('_url', '');
                            // Map field names to tab names
                            const tabName = cleanKey === 'front' || cleanKey === 'back' || cleanKey === 'photo'
                                ? cleanKey
                                : 'front'; // default to 'front' for other URL fields
                            existingDocUrls[tabName] = value;
                        }
                    });

                    // Store the URLs for display
                    setDocumentUrls(existingDocUrls);

                    // Show the duplicate document modal
                    setShowDuplicateDocModal(true);

                    // Auto-select first available tab
                    const availableTabs = Object.keys(existingDocUrls);
                    if (availableTabs.length > 0) {
                        setActiveDocumentTab(availableTabs[0]);
                    }
                } else {
                    // If no existing verified document, fetch document images as usual
                    await fetchDocumentImages(userId);
                }
            } else {
                // If no verification history, fetch document images as usual
                await fetchDocumentImages(userId);
            }
        } catch (error) {
            console.error('Error fetching verification history:', error);
            // Fall back to document images API
            await fetchDocumentImages(userId);
        }
    };

    // Update the fetchDocumentImages function again
    const fetchDocumentImages = async (userId) => {
        try {
            setLoadingDocuments(true);
            const response = await fetch(`/api/admin/documents?user_id=${userId}`);
            const data = await response.json();

            if (data.success && data.documents.length > 0) {
                // Find the most recent document with images
                const documentWithImages = data.documents.find(doc => doc.urls && Object.keys(doc.urls).length > 0);

                if (documentWithImages) {
                    setDocumentUrls(documentWithImages.urls);

                    // Store the URLs for later use when document type is selected
                    const urlMapping = {
                        'front': 'front_image_url',
                        'back': 'back_image_url',
                        'photo': 'photo_url'
                    };

                    const extractedUrls = {};
                    Object.entries(documentWithImages.urls).forEach(([key, url]) => {
                        const fieldName = urlMapping[key] || key;
                        extractedUrls[fieldName] = url;
                    });

                    setInitialDocumentData(extractedUrls);

                    // Auto-select first available tab
                    const availableTabs = Object.keys(documentWithImages.urls);
                    if (availableTabs.length > 0) {
                        setActiveDocumentTab(availableTabs[0]);
                    }
                } else {
                    setDocumentUrls({});
                    setInitialDocumentData({});
                }
            } else {
                setDocumentUrls({});
                setInitialDocumentData({});
            }
        } catch (error) {
            console.error('Error fetching document images:', error);
            setDocumentUrls({});
            setInitialDocumentData({});
        } finally {
            setLoadingDocuments(false);
        }
    };

    const handleUseExistingDocument = () => {
        if (existingDocData) {
            // Auto-fill the form with existing verified data
            setDocumentType(existingDocData.document_type);
            setDocumentData(existingDocData.document_data);

            // IMPORTANT: Make sure documentUrls already contains images from verify-document API
            // (they were set in fetchDocumentVerificationHistory)

            // Close the modal
            setShowDuplicateDocModal(false);
            setExistingDocData(null);
        }
    };

    const handleUseNewDocument = () => {
        // Clear the form
        setDocumentType('');
        setDocumentData({});
        setDocumentErrors({});

        // IMPORTANT: Re-fetch images from document API for new verification
        const booking = bookings.find(b => b.id === selectedBooking);
        if (booking && booking.user_id) {
            fetchDocumentImages(booking.user_id);
        }

        // Clear existing data
        setExistingDocData(null);
        setShowDuplicateDocModal(false);

        // Optionally show a message
        alert('You can now enter new document information. Loading fresh document images...');
    };

    const handleRejectDocument = async () => {
        if (!window.confirm('Are you sure you want to reject this document? This will mark the document as rejected but you can still proceed with booking confirmation.')) {
            return;
        }

        setActionLoading(true);
        try {
            const booking = bookings.find(b => b.id === selectedBooking);

            if (booking && booking.user_id) {
                const verificationResponse = await fetch('/api/admin/verify-document', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_id: booking.user_id,
                        booking_id: selectedBooking,
                        document_type: documentType,
                        document_data: documentData,
                        status: 'rejected',
                        verification_notes: 'Document rejected by admin',
                        review_message: 'Document verification failed'
                    })
                });

                const verificationData = await verificationResponse.json();

                if (!verificationData.success) {
                    throw new Error(verificationData.message || 'Failed to reject document');
                }

                alert('Document marked as rejected. You can still confirm the booking.');
            }
        } catch (error) {
            console.error('Error rejecting document:', error);
            alert(`Failed to reject document: ${error.message}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleConfirmCancel = async () => {
        if (selectedBooking && cancelReason.trim()) {
            setActionLoading(true);
            try {
                await onStatusUpdate(selectedBooking, "cancelled", cancelReason);
                setShowCancelModal(false);
                setSelectedBooking(null);
                setCancelReason("");
            } finally {
                setActionLoading(false);
            }
        }
    };

    const handleDeleteClick = (bookingId) => {
        setSelectedBooking(bookingId);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedBooking) {
            setActionLoading(true);
            try {
                await onDeleteBooking(selectedBooking);
                setShowDeleteModal(false);
                setSelectedBooking(null);
            } finally {
                setActionLoading(false);
            }
        }
    };

    const closeModals = () => {
        setShowCancelModal(false);
        setShowDeleteModal(false);
        setShowConfirmModal(false);
        setShowDuplicateDocModal(false);
        setSelectedBooking(null);
        setCancelReason("");
        setActionLoading(false);

        // Reset document states - but keep documentUrls if we need to show them again
        setLoadingDocuments(false);
        setActiveDocumentTab('front');
        setDocumentType('');
        setDocumentData({});
        setDocumentErrors({});
        setExistingDocData(null);
    // NOTE: We're NOT clearing documentUrls here so they persist between modal openings
    // unless you want a fresh fetch each time
    };

    const ActionButton = ({
        onClick,
        icon,
        label,
        variant = "default",
        disabled = false
    }) => {
        const variants = {
            default: "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20",
            confirm: "bg-green-500/10 text-green-400 hover:bg-green-500/20",
            cancel: "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20",
            delete: "bg-red-500/10 text-red-400 hover:bg-red-500/20",
        };

        return (
            <button
                onClick={onClick}
                disabled={disabled}
                className={`flex items-center px-3 py-1.5 rounded-lg transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]}`}
            >
                <FontAwesomeIcon icon={icon} className="w-4 h-4 mr-2" />
                {label}
            </button>
        );
    };

    if (bookings.length === 0 && !loading) {
        return (
            <div className="bg-neutral-900 rounded-xl shadow p-8 text-center border border-neutral-800">
                <p className="text-neutral-400 text-lg">No bookings found</p>
                <p className="text-neutral-500 mt-2">Try adjusting your filters</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-neutral-800 rounded-xl shadow-sm overflow-hidden border border-neutral-700">
                {/* Scrollable Table */}
                <div
                    style={{
                        maxHeight: "calc(100vh - 400px)",
                        minHeight: "400px",
                        overflowY: "auto",
                        overflowX: "auto"
                      }}
                >
                    <table className="w-full text-left border-collapse text-neutral-50 min-w-[1024px]">
                        <thead className="bg-neutral-700 sticky top-0 z-20 text-sm">
                            <tr>
                                {[
                                    "Booking ID",
                                    "User",
                                    "Apartment",
                                    "Dates",
                                    "Status",
                                    "Payment",
                                    "Amount",
                                    "Actions",
                                ].map((th, idx) => (
                                    <th
                                        key={idx}
                                        className="p-4 text-left font-semibold text-neutral-300 uppercase tracking-wide"
                                    >
                                        {th}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-neutral-700">
                            {bookings.map((booking) => (
                                <tr
                                    key={booking.id}
                                    className="hover:bg-neutral-800 transition duration-150"
                                >
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-neutral-200">
                                            #{booking.id}
                                        </div>
                                        <div className="text-xs text-neutral-400">
                                            {new Date(booking.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    {/* In the table cell for User information, add: */}
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-neutral-200">
                                            {booking.user_name}
                                        </div>
                                        <div className="text-xs text-neutral-400">
                                            {booking.user_email}
                                        </div>
                                        <div className="text-xs text-neutral-400">
                                            {booking.user_phone}
                                        </div>
                                        {/* Add document verification status indicator */}
                                        {booking.document_status && (
                                            <div className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${booking.document_status === 'approved' ? 'bg-green-500/20 text-green-400' : booking.document_status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                Doc: {booking.document_status}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-neutral-200">
                                            {booking.apartment_title}
                                        </div>
                                        <div className="text-xs text-neutral-400">
                                            {booking.total_nights} nights
                                        </div>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="text-sm text-neutral-200">
                                            {new Date(booking.start_date).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-neutral-500 text-center">
                                            to
                                        </div>
                                        <div className="text-sm text-neutral-200">
                                            {new Date(booking.end_date).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        {getStatusBadge(booking.status)}
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        {getPaymentBadge(booking.payment_status)}
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-neutral-200">
                                            ₹{booking.total_amount || booking.paid_amount || "0"}
                                        </div>
                                        {booking.paid_amount && (
                                            <div className="text-xs text-neutral-400">
                                                Paid: ₹{booking.paid_amount}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="flex flex-wrap gap-2">
                                            <ActionButton
                                                onClick={() => onViewBooking(booking)}
                                                icon={faEye}
                                                label="View"
                                                variant="default"
                                            />

                                            {/* Document Verify / Verified Button */}
                                            {(() => {
                                                const docConfig = getDocumentActionConfig(booking.document_status);
                                                return (
                                                    <ActionButton
                                                        onClick={() => {
                                                            if (!docConfig.disabled) {
                                                                handleQuickStatusUpdate(booking.id, "confirmed");
                                                            }
                                                        }}
                                                        icon={docConfig.icon}
                                                        label={docConfig.label}
                                                        variant={docConfig.variant}
                                                        disabled={docConfig.disabled}
                                                    />
                                                );
                                            })()}

                                            {/* Cancel button — fully hidden when not allowed */}
                                            {canShowCancelButton(booking.status) && (
                                                <ActionButton
                                                    onClick={() => handleQuickStatusUpdate(booking.id, "cancelled")}
                                                    icon={faBan}
                                                    label="Cancel"
                                                    variant="cancel"
                                                />
                                            )}

                                            <ActionButton
                                                onClick={() => handleDeleteClick(booking.id)}
                                                icon={faTrash}
                                                label="Delete"
                                                variant="delete"
                                            />
                                        </div>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination?.pages > 1 && (
                    <div className="bg-neutral-900 px-4 py-3 flex items-center justify-between border-t border-neutral-800 sm:px-6">
                        <div className="flex justify-between sm:justify-start space-x-2 w-full">
                            <button
                                onClick={() => onPageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-neutral-700 text-sm font-medium rounded-md text-neutral-400 hover:bg-neutral-800 disabled:opacity-50 transition"
                            >
                                Previous
                            </button>

                            <div className="flex space-x-1">
                                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                                    (pageNum) => (
                                        <button
                                            key={pageNum}
                                            onClick={() => onPageChange(pageNum)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${pageNum === pagination.page
                                                ? "bg-blue-600/20 border-blue-500 text-blue-400"
                                                : "bg-neutral-900 border-neutral-700 text-neutral-400 hover:bg-neutral-800"
                                                } transition`}
                                        >
                                            {pageNum}
                                        </button>
                                    )
                                )}
                            </div>

                            <button
                                onClick={() => onPageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.pages}
                                className="relative inline-flex items-center px-4 py-2 border border-neutral-700 text-sm font-medium rounded-md text-neutral-400 hover:bg-neutral-800 disabled:opacity-50 transition"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                )}
            </div>

            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 w-full max-w-5xl my-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <div className="bg-green-500/20 p-2 rounded-lg mr-3">
                                    <FontAwesomeIcon icon={faCheckCircle} className="w-6 h-6 text-green-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-neutral-200">
                                    Confirm Booking with Document Verification
                                </h3>
                            </div>
                            <button
                                onClick={closeModals}
                                className="text-neutral-400 hover:text-neutral-300 transition"
                            >
                                <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column - Document Images */}
                            <div className="space-y-4">
                                <h4 className="text-md font-medium text-neutral-300 mb-2">
                                    Document Images
                                </h4>

                                {loadingDocuments ? (
                                    <div className="flex items-center justify-center h-64 bg-neutral-800/50 rounded-lg border border-neutral-700">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                                    </div>
                                ) : Object.keys(documentUrls).length > 0 ? (
                                    <>
                                        {/* Tab Navigation */}
                                        <div className="flex space-x-2 border-b border-neutral-700">
                                            {Object.keys(documentUrls).map(tab => (
                                                <button
                                                    key={tab}
                                                    onClick={() => setActiveDocumentTab(tab)}
                                                    className={`px-4 py-2 text-sm font-medium transition ${activeDocumentTab === tab
                                                        ? 'text-green-400 border-b-2 border-green-400'
                                                        : 'text-neutral-400 hover:text-neutral-300'
                                                        }`}
                                                >
                                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Image Display */}
                                        <div className="bg-neutral-800/50 rounded-lg border border-neutral-700 p-4">
                                            {documentUrls[activeDocumentTab] && (
                                                <div className="space-y-3">
                                                    <img
                                                        src={documentUrls[activeDocumentTab]}
                                                        alt={`${activeDocumentTab} view`}
                                                        className="w-full h-auto max-h-72 object-contain rounded-lg"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23222'/%3E%3Ctext x='100' y='75' text-anchor='middle' fill='%23666' font-family='Arial' font-size='14'%3EImage not available%3C/text%3E%3C/svg%3E";
                                                        }}
                                                    />
                                                    <div className="text-xs text-neutral-400 text-center">
                                                        Click on tabs to switch between views
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Image URLs List */}
                                        <div className="bg-neutral-800/30 rounded-lg p-4 border border-neutral-700">
                                            <h5 className="text-sm font-medium text-neutral-300 mb-2">Document URLs</h5>
                                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                                {Object.entries(documentUrls).map(([key, url]) => (
                                                    <div key={key} className="flex items-center justify-between text-xs">
                                                        <span className="text-neutral-400">{key}:</span>
                                                        <a
                                                            href={url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-green-400 hover:text-green-300 truncate max-w-[200px]"
                                                            title={url}
                                                        >
                                                            Open in new tab
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-64 bg-neutral-800/50 rounded-lg border border-neutral-700 p-4">
                                        <FontAwesomeIcon icon={faExclamationTriangle} className="w-12 h-12 text-neutral-600 mb-3" />
                                        <p className="text-neutral-400 text-center">No document images found for this user</p>
                                        <p className="text-neutral-500 text-sm text-center mt-1">
                                            The user may not have uploaded any documents yet.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Document Details Form */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-md font-medium text-neutral-300">
                                        Enter Document Details
                                    </h4>
                                    <span className="text-xs text-neutral-500">
                                        Verify against the images
                                    </span>
                                </div>

                                {/* Document Type Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                                        Select Document Type <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={documentType}
                                            onChange={(e) => handleDocumentTypeChange(e.target.value)}
                                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/30 appearance-none"
                                        >
                                            <option value="">-- Select Document Type --</option>
                                            <option value="aadhaar">Aadhaar Card</option>
                                            <option value="pan">PAN Card</option>
                                            <option value="driving_license">Driving License</option>
                                            <option value="passport">Passport</option>
                                            <option value="voter_id">Voter ID</option>
                                        </select>
                                        <FontAwesomeIcon
                                            icon={faChevronDown}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 pointer-events-none"
                                        />
                                    </div>
                                </div>

                                {/* Dynamic Form Fields */}
                                {documentType && (
                                    <div className="space-y-4 max-h-96 overflow-y-auto px-2 py-1">
                                        {documentSchemas[documentType]?.required.map((field) => (
                                            <div key={field} className="space-y-2">
                                                <label className="block text-sm font-medium text-neutral-300">
                                                    {documentSchemas[documentType].labels[field]} <span className="text-red-400">*</span>
                                                </label>
                                                <input
                                                    type={field.includes('_url') ? 'url' :
                                                        field.includes('dob') || field.includes('date') ? 'date' : 'text'}
                                                    value={documentData[field] || ''}
                                                    onChange={(e) => handleDocumentFieldChange(field, e.target.value)}
                                                    placeholder={`Enter ${documentSchemas[documentType].labels[field]}`}
                                                    className={`w-full bg-neutral-800 border ${documentErrors[field] ? 'border-red-500/50' : 'border-neutral-700'} rounded-lg px-4 py-3 text-neutral-200 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/30`}
                                                />
                                                {documentErrors[field] && (
                                                    <p className="text-sm text-red-400">{documentErrors[field]}</p>
                                                )}
                                            </div>
                                        ))}
                                        {/* <div>
                                            hhi
                                        </div> */}
                                    </div>
                                )}

                                <p className="text-neutral-400 text-sm pt-4 border-t border-neutral-800">
                                    Compare the document details with the images before confirming the booking.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-neutral-800">
                            <button
                                onClick={closeModals}
                                disabled={actionLoading}
                                className="flex items-center px-4 py-2 text-neutral-400 hover:text-neutral-300 transition disabled:opacity-50"
                            >
                                <FontAwesomeIcon icon={faTimes} className="w-4 h-4 mr-2" />
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (validateDocument()) {
                                        handleConfirmBooking();
                                    }
                                }}
                                disabled={actionLoading || Object.keys(documentUrls).length === 0}
                                className="flex items-center px-4 py-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg transition disabled:opacity-50"
                                title={Object.keys(documentUrls).length === 0 ? "No document images available" : ""}
                            >
                                {actionLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400 mr-2"></div>
                                        Confirming...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 mr-2" />
                                        Confirm with Document Verification
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Duplicate Document Modal */}
            {showDuplicateDocModal && existingDocData && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 w-full max-w-lg">
                        <div className="flex items-center mb-4">
                            <div className="bg-blue-500/20 p-2 rounded-lg mr-3">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-200">
                                Existing Verified Document Found
                            </h3>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center mb-4 p-3 bg-neutral-800/50 rounded-lg border border-neutral-700">
                                <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5 text-green-400 mr-3" />
                                <div>
                                    <p className="text-sm font-medium text-neutral-200">
                                        Previously verified {existingDocData.document_type} document found
                                    </p>
                                    <p className="text-xs text-neutral-400 mt-1">
                                        Verified on: {new Date(existingDocData.verified_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Add image preview section */}
                            {Object.keys(documentUrls).length > 0 && (
                                <div className="mb-4 p-3 bg-neutral-800/30 rounded-lg border border-neutral-700">
                                    <p className="text-sm font-medium text-neutral-300 mb-2">Document Images Available:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.keys(documentUrls).slice(0, 3).map((tab) => (
                                            <div key={tab} className="flex flex-col items-center">
                                                <div className="w-16 h-16 bg-neutral-800 rounded border border-neutral-700 overflow-hidden">
                                                    <img
                                                        src={documentUrls[tab]}
                                                        alt={tab}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23222'/%3E%3Ctext x='32' y='32' text-anchor='middle' fill='%23666' font-family='Arial' font-size='10'%3EImage%3C/text%3E%3C/svg%3E";
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs text-neutral-400 mt-1 capitalize">{tab}</span>
                                            </div>
                                        ))}
                                        {Object.keys(documentUrls).length > 3 && (
                                            <div className="flex items-center justify-center w-16 h-16 bg-neutral-800 rounded border border-neutral-700">
                                                <span className="text-xs text-neutral-400">+{Object.keys(documentUrls).length - 3} more</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <p className="text-neutral-400 mb-4">
                                Would you like to use the existing verified document or enter new information?
                                {Object.keys(documentUrls).length > 0 && " Document images are already loaded and will be visible in both cases."}
                            </p>

                            <div className="space-y-3">
                                <div className="p-3 bg-neutral-800/30 rounded-lg border border-neutral-700">
                                    <p className="text-xs text-neutral-400 mb-1">Document Type:</p>
                                    <p className="text-sm text-neutral-200 capitalize">{existingDocData.document_type.replace('_', ' ')}</p>
                                </div>

                                <div className="p-3 bg-neutral-800/30 rounded-lg border border-neutral-700">
                                    <p className="text-xs text-neutral-400 mb-1">Verification Status:</p>
                                    <span className={`text-xs px-2 py-1 rounded-full ${existingDocData.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                        {existingDocData.status.charAt(0).toUpperCase() + existingDocData.status.slice(1)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-neutral-800">
                            <div className="text-xs text-neutral-500">
                                <FontAwesomeIcon icon={faEye} className="w-3 h-3 mr-1" />
                                Images will remain visible
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleUseNewDocument}
                                    className="flex items-center px-4 py-2 text-neutral-400 hover:text-neutral-300 transition hover:bg-neutral-800/50 rounded-lg"
                                >
                                    <FontAwesomeIcon icon={faTimes} className="w-4 h-4 mr-2" />
                                    Use New Document
                                </button>
                                <button
                                    onClick={handleUseExistingDocument}
                                    className="flex items-center px-4 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition"
                                >
                                    <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 mr-2" />
                                    Use Existing
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 w-xl">
                        <div className="flex items-center mb-4">
                            <div className="bg-yellow-500/20 p-2 rounded-lg mr-3">
                                <FontAwesomeIcon icon={faBan} className="w-6 h-6 text-yellow-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-200">
                                Cancel Booking
                            </h3>
                        </div>
                        <p className="text-neutral-400 mb-4">
                            Please provide a reason for cancellation:
                        </p>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Enter cancellation reason..."
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            rows="3"
                        />
                        {/* In the confirm modal button section, replace the single confirm button with: */}
                        <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-neutral-800">
                            <button
                                onClick={closeModals}
                                disabled={actionLoading}
                                className="flex items-center px-4 py-2 text-neutral-400 hover:text-neutral-300 transition disabled:opacity-50"
                            >
                                <FontAwesomeIcon icon={faTimes} className="w-4 h-4 mr-2" />
                                Cancel
                            </button>

                            {/* Reject Button (Optional) */}
                            <button
                                onClick={handleConfirmCancel}
                                disabled={actionLoading}
                                className="flex items-center px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition disabled:opacity-50"
                            >
                                <FontAwesomeIcon icon={faBan} className="w-4 h-4 mr-2" />
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 w-full max-w-md">
                        <div className="flex items-center mb-4">
                            <div className="bg-red-500/20 p-2 rounded-lg mr-3">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="w-6 h-6 text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-200">
                                Delete Booking
                            </h3>
                        </div>
                        <p className="text-neutral-400 mb-6">
                            Are you sure you want to delete this booking? This action cannot be undone and all booking data will be permanently removed.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={closeModals}
                                disabled={actionLoading}
                                className="flex items-center px-4 py-2 text-neutral-400 hover:text-neutral-300 transition disabled:opacity-50"
                            >
                                <FontAwesomeIcon icon={faTimes} className="w-4 h-4 mr-2" />
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={actionLoading}
                                className="flex items-center px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition disabled:opacity-50"
                            >
                                {actionLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400 mr-2"></div>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faTrash} className="w-4 h-4 mr-2" />
                                        Delete Booking
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BookingsList;