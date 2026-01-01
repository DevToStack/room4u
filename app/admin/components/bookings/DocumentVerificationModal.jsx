import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCheckCircle,
    faTimes,
    faExclamationTriangle,
    faChevronDown
} from '@fortawesome/free-solid-svg-icons';

const DocumentConfirmModal = ({
    isOpen,
    onClose,
    onSubmit,
    documentUrls,
    isLoading,
    initialDocumentType = '',
    initialDocumentData = {},
    documentSchemas,
    userInfo,
    bookingInfo
}) => {
    const [activeDocumentTab, setActiveDocumentTab] = useState('front');
    const [documentType, setDocumentType] = useState(initialDocumentType || '');
    const [documentData, setDocumentData] = useState(initialDocumentData || {});
    const [documentErrors, setDocumentErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setDocumentType(initialDocumentType || '');
            setDocumentData(initialDocumentData || {});
            setDocumentErrors({});
            setActiveDocumentTab('front');
        }
    }, [isOpen, initialDocumentType, initialDocumentData]);

    const handleDocumentTypeChange = (type) => {
        setDocumentType(type);
        setDocumentData({});
        setDocumentErrors({});
    };

    const handleDocumentFieldChange = (field, value) => {
        setDocumentData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error for this field if user starts typing
        if (documentErrors[field]) {
            setDocumentErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateDocument = () => {
        if (!documentType) {
            setDocumentErrors(prev => ({ ...prev, type: 'Please select a document type' }));
            return false;
        }

        const schema = documentSchemas[documentType];
        if (!schema) return false;

        const errors = {};
        let isValid = true;

        schema.required.forEach(field => {
            if (!documentData[field] || documentData[field].trim() === '') {
                errors[field] = `${schema.labels[field]} is required`;
                isValid = false;
            }
        });

        setDocumentErrors(errors);
        return isValid;
    };

    const handleSubmit = () => {
        if (validateDocument()) {
            onSubmit({
                documentType,
                documentData,
                images: documentUrls
            });
        }
    };

    const hasDocumentImages = documentUrls && Object.keys(documentUrls).length > 0;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6 w-full max-w-5xl my-8">
                {/* Header */}
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
                        onClick={onClose}
                        disabled={isLoading}
                        className="text-neutral-400 hover:text-neutral-300 transition disabled:opacity-50"
                    >
                        <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                    </button>
                </div>

                {/* User/Booking Info (Optional) */}
                {(userInfo || bookingInfo) && (
                    <div className="mb-6 p-4 bg-neutral-800/30 rounded-lg border border-neutral-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {userInfo && (
                                <div>
                                    <h4 className="text-sm font-medium text-neutral-400 mb-1">User Information</h4>
                                    <p className="text-neutral-200">{userInfo.name}</p>
                                    <p className="text-sm text-neutral-400">{userInfo.email}</p>
                                </div>
                            )}
                            {bookingInfo && (
                                <div>
                                    <h4 className="text-sm font-medium text-neutral-400 mb-1">Booking Information</h4>
                                    <p className="text-neutral-200">{bookingInfo.apartmentTitle}</p>
                                    <p className="text-sm text-neutral-400">Booking ID: {bookingInfo.id}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Document Images */}
                    <div className="space-y-4">
                        <h4 className="text-md font-medium text-neutral-300 mb-2">
                            Document Images
                        </h4>

                        {isLoading ? (
                            <div className="flex items-center justify-center h-64 bg-neutral-800/50 rounded-lg border border-neutral-700">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                            </div>
                        ) : hasDocumentImages ? (
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
                                <p className="text-neutral-400 text-center">No document images found</p>
                                <p className="text-neutral-500 text-sm text-center mt-1">
                                    You can still proceed by entering document details manually.
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
                            {documentErrors.type && (
                                <p className="text-sm text-red-400 mt-1">{documentErrors.type}</p>
                            )}
                        </div>

                        {/* Dynamic Form Fields */}
                        {documentType && documentSchemas[documentType] && (
                            <div className="space-y-4 max-h-96 overflow-y-auto px-2 py-1">
                                {documentSchemas[documentType].required.map((field) => (
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
                            </div>
                        )}

                        <p className="text-neutral-400 text-sm pt-4 border-t border-neutral-800">
                            Compare the document details with the images before confirming.
                        </p>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-neutral-800">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex items-center px-4 py-2 text-neutral-400 hover:text-neutral-300 transition disabled:opacity-50"
                    >
                        <FontAwesomeIcon icon={faTimes} className="w-4 h-4 mr-2" />
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex items-center px-4 py-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg transition disabled:opacity-50"
                    >
                        {isLoading ? (
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
    );
};

export default DocumentConfirmModal;