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