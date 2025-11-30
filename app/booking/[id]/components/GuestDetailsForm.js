"use client";

import { useEffect, useState } from "react";

export default function GuestDetailsForm({
    guestCount,
    initialData,
    onComplete
}) {
    const [guestInfo, setGuestInfo] = useState([]);
    const [activeTab, setActiveTab] = useState(0);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Upload states
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    // Country codes for phone
    const countryCodes = [
        { code: "+91", country: "India", flag: "IN" },
        { code: "+1", country: "USA", flag: "US" },
        { code: "+44", country: "UK", flag: "GB" },
        { code: "+61", country: "Australia", flag: "AU" },
        { code: "+65", country: "Singapore", flag: "SG" },
        { code: "+971", country: "UAE", flag: "AE" },
    ];

    // ---------------------------------------
    // INIT FORM DATA
    // ---------------------------------------
    // In your useEffect that loads initialData
    useEffect(() => {
        if (initialData) {
            // Extract country code from existing phone number
            const processedData = { ...initialData };

            if (processedData.phone) {
                // Find if phone starts with any known country code
                const matchedCode = countryCodes.find(country =>
                    processedData.phone.startsWith(country.code)
                );

                if (matchedCode) {
                    processedData.countryCode = matchedCode.code;
                    processedData.phone = processedData.phone.replace(matchedCode.code, '');
                } else {
                    // Default to India if no match found
                    processedData.countryCode = "+91";
                }
            } else {
                processedData.countryCode = "+91";
            }

            setGuestInfo([processedData]);
            setActiveTab(0);
            return;
        }

        const emptyGuests = Array.from({ length: guestCount }, () => ({
            name: "",
            age: "",
            gender: "",
            phone: "",
            countryCode: "+91",
            id_document_url: "",
            id_document_public_id: "",
        }));

        setGuestInfo(emptyGuests);
        setActiveTab(0);
    }, [guestCount, initialData]);
    // ---------------------------------------
    // UPDATE FIELD
    // ---------------------------------------
    const updateField = (index, field, value) => {
        setGuestInfo(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });

        // Clear error when field is updated
        if (errors[`guest-${index}-${field}`]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`guest-${index}-${field}`];
                return newErrors;
            });
        }
    };

    // ---------------------------------------
    // VALIDATION
    // ---------------------------------------
    const validateForm = () => {
        const newErrors = {};

        guestInfo.forEach((guest, index) => {
            if (!guest.name?.trim()) {
                newErrors[`guest-${index}-name`] = "Name is required";
            }

            if (!guest.age) {
                newErrors[`guest-${index}-age`] = "Age is required";
            } else if (guest.age < 1 || guest.age > 120) {
                newErrors[`guest-${index}-age`] = "Please enter a valid age";
            }

            if (!guest.gender) {
                newErrors[`guest-${index}-gender`] = "Gender is required";
            }

            if (!guest.phone?.trim()) {
                newErrors[`guest-${index}-phone`] = "Phone number is required";
            } else if (!/^\d{10}$/.test(guest.phone.replace(/\D/g, ''))) {
                newErrors[`guest-${index}-phone`] = "Please enter a valid 10-digit phone number";
            }

            if (!guest.id_document_url) {
                newErrors[`guest-${index}-document`] = "ID proof is required";
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ---------------------------------------
    // PREPARE DATA FOR API - MERGE COUNTRY CODE WITH PHONE
    // ---------------------------------------
    const prepareGuestDataForAPI = () => {
        return guestInfo.map(guest => {
            // Create a copy of the guest object to avoid mutating the original
            const guestData = { ...guest };

            // Merge country code with phone number
            if (guestData.countryCode && guestData.phone) {
                guestData.phone = guestData.countryCode + guestData.phone;
            }

            // Remove the separate countryCode field if you don't want it in the API data
            delete guestData.countryCode;

            return guestData;
        });
    };

    // ---------------------------------------
    // FILE UPLOAD HANDLER
    // ---------------------------------------
    async function handleFileUpload(file) {
        setUploading(true);
        setProgress(15);

        const formData = new FormData();
        formData.append("file", file);

        try {
            // Fake smooth progress until 90%
            let current = 15;
            const interval = setInterval(() => {
                current += 5;
                setProgress(current);
                if (current >= 90) clearInterval(interval);
            }, 200); // update every 200ms

            // Upload request
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const json = await res.json();
            if (!json.success) throw new Error(json.error);

            // Jump to 100%
            setProgress(100);

            // Stop smooth progress timer
            clearInterval(interval);

            // Update form
            updateField(activeTab, "id_document_url", json.data.public_id);
            updateField(activeTab, "id_document_public_id", json.data.public_id);

            // Hide progress after a moment
            setTimeout(() => {
                setUploading(false);
                setProgress(0);
            }, 800);

        } catch (err) {
            console.error("Upload Error:", err.message);
            setUploading(false);
            setProgress(0);
        }
    }

    // ---------------------------------------
    // DELETE IMAGE
    // ---------------------------------------
    async function handleDeleteImage() {
        const public_id = guestInfo[activeTab].id_document_public_id;
        if (!public_id) return;

        try {
            await fetch(`/api/upload?public_id=${public_id}`, {
                method: "DELETE",
            });

            updateField(activeTab, "id_document_url", "");
            updateField(activeTab, "id_document_public_id", "");
        } catch (err) {
            console.error("Delete Error:", err.message);
        }
    }

    // ---------------------------------------
    // SUBMIT FORM
    // ---------------------------------------
    const handleSubmit = async () => {
        if (!validateForm()) {
            // Scroll to first error
            const firstError = Object.keys(errors)[0];
            const element = document.querySelector(`[data-field="${firstError}"]`);
            element?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare data with merged phone numbers
            const apiData = prepareGuestDataForAPI();
            await onComplete(apiData.length === 1 ? apiData[0] : apiData);
        } catch (error) {
            console.error("Submission error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (guestInfo.length === 0) return null;
    const guest = guestInfo[activeTab];

    return (
        <div className="text-white max-w-2xl mx-auto">

            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Guest Details</h2>
                <p className="text-neutral-400">Please fill in the details for all guests</p>
            </div>

            {/* Tabs */}
            {!initialData && guestCount > 1 && (
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {guestInfo.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveTab(idx)}
                            className={`flex-shrink-0 px-4 py-2 rounded-lg transition-all duration-200 ${activeTab === idx
                                ? "bg-blue-600 shadow-lg shadow-blue-600/25"
                                : "bg-neutral-800 hover:bg-neutral-700"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${activeTab === idx ? "bg-white" : "bg-neutral-400"
                                    }`} />
                                Guest {idx + 1}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* FORM FIELDS */}
            <div className="space-y-6">

                {/* Name */}
                <div className="flex flex-col gap-2" data-field={`guest-${activeTab}-name`}>
                    <label className="text-sm font-medium">Full Name *</label>
                    <input
                        value={guest.name}
                        onChange={(e) => updateField(activeTab, "name", e.target.value)}
                        className={`w-full p-3 rounded-lg bg-neutral-800 border transition-colors ${errors[`guest-${activeTab}-name`]
                            ? "border-red-500 focus:border-red-500"
                            : "border-neutral-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            }`}
                        placeholder="Enter guest name"
                    />
                    {errors[`guest-${activeTab}-name`] && (
                        <p className="text-red-400 text-sm">{errors[`guest-${activeTab}-name`]}</p>
                    )}
                </div>

                {/* Age + Gender */}
                <div className="grid grid-cols-2 gap-4">
                    <div data-field={`guest-${activeTab}-age`}>
                        <label className="text-sm font-medium">Age *</label>
                        <input
                            value={guest.age}
                            onChange={(e) => updateField(activeTab, "age", e.target.value)}
                            className={`w-full h-12 p-3 rounded-lg bg-neutral-800 border transition-colors ${errors[`guest-${activeTab}-age`]
                                ? "border-red-500 focus:border-red-500"
                                : "border-neutral-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                }`}
                            placeholder="Age"
                            type="number"
                            min="1"
                            max="120"
                        />
                        {errors[`guest-${activeTab}-age`] && (
                            <p className="text-red-400 text-sm">{errors[`guest-${activeTab}-age`]}</p>
                        )}
                    </div>

                    <div data-field={`guest-${activeTab}-gender`}>
                        <label className="text-sm font-medium">Gender *</label>
                        <select
                            value={guest.gender}
                            onChange={(e) => updateField(activeTab, "gender", e.target.value)}
                            className={`w-full h-12 rounded-lg bg-neutral-800 border transition-colors ${errors[`guest-${activeTab}-gender`]
                                ? "border-red-500 focus:border-red-500"
                                : "border-neutral-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                }`}
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                        {errors[`guest-${activeTab}-gender`] && (
                            <p className="text-red-400 text-sm">{errors[`guest-${activeTab}-gender`]}</p>
                        )}
                    </div>
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-2" data-field={`guest-${activeTab}-phone`}>
                    <label className="text-sm font-medium">Phone Number *</label>
                    <div className="flex gap-3">
                        <select
                            value={guest.countryCode || "+91"}
                            onChange={(e) => updateField(activeTab, "countryCode", e.target.value)}
                            className="w-32 p-3 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                        >
                            {countryCodes.map((country) => (
                                <option key={country.code} value={country.code}>
                                    {country.flag} {country.code}
                                </option>
                            ))}
                        </select>
                        <input
                            value={guest.phone}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                updateField(activeTab, "phone", value);
                            }}
                            className={`flex-1 p-3 rounded-lg bg-neutral-800 border transition-colors ${errors[`guest-${activeTab}-phone`]
                                ? "border-red-500 focus:border-red-500"
                                : "border-neutral-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                }`}
                            placeholder="1234567890"
                            type="text"
                            maxLength="10"
                        />
                    </div>
                    {errors[`guest-${activeTab}-phone`] && (
                        <p className="text-red-400 text-sm">{errors[`guest-${activeTab}-phone`]}</p>
                    )}
                </div>

                {/* ---------------------------------------------------------------- */}
                {/* UPLOAD ID SECTION */}
                {/* ---------------------------------------------------------------- */}
                <div
                    className={`border rounded-xl p-5 transition-colors ${errors[`guest-${activeTab}-document`]
                        ? "border-red-500/50 bg-red-500/5"
                        : "border-neutral-700 bg-neutral-900/50"
                        }`}
                    data-field={`guest-${activeTab}-document`}
                >
                    <h3 className="text-lg font-semibold mb-4">Upload ID Proof *</h3>

                    {!guest.id_document_url ? (
                        <div className="space-y-4">
                            <div className="relative border-2 border-dashed border-neutral-700 rounded-lg p-6 text-center transition-colors hover:border-blue-500/50">
                                <div className="mb-3">
                                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-sm text-neutral-300 mb-2">Upload ID Proof</p>
                                <p className="text-xs text-neutral-500">Supports JPG, PNG, PDF (Max 5MB)</p>

                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            if (file.size > 5 * 1024 * 1024) {
                                                alert("File size must be less than 5MB");
                                                return;
                                            }
                                            handleFileUpload(file);
                                        }
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>

                            {/* Progress Bar */}
                            {uploading && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-400">Uploading...</span>
                                        <span className="text-blue-400">{progress}%</span>
                                    </div>
                                    <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="border border-green-500/30 rounded-lg bg-green-500/5 p-4 flex items-center gap-4 max-sm:gap-2">
                            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="text-green-400 font-medium max-sm:text-[14px]">Upload Successful</p>
                                <p className="text-green-400/70 text-sm max-sm:text-[8px]">ID proof has been uploaded</p>
                            </div>
                            <button
                                onClick={handleDeleteImage}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                    {errors[`guest-${activeTab}-document`] && (
                        <p className="text-red-400 text-sm mt-2">{errors[`guest-${activeTab}-document`]}</p>
                    )}
                </div>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${isSubmitting
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25"
                        }`}
                >
                    {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
                        </div>
                    ) : (
                        "Save Guest Details"
                    )}
                </button>

            </div>
        </div>
    );
}