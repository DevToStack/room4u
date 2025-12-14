"use client";

import { useEffect, useState } from "react";

export default function GuestDetailsForm({ initialData, onComplete }) {
    const [guest, setGuest] = useState({
        name: "",
        age: "",
        gender: "",
        phone: "",
        countryCode: "+91",
    });

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

    // INIT DATA (Edit mode)
    useEffect(() => {
        if (initialData) {
            const data = { ...initialData };

            // Extract country code
            const matchedCode = countryCodes.find(c =>
                data.phone.startsWith(c.code)
            );

            if (matchedCode) {
                data.countryCode = matchedCode.code;
                data.phone = data.phone.replace(matchedCode.code, "");
            } else {
                data.countryCode = "+91";
            }

            setGuest(data);
        }
    }, [initialData]);

    // UPDATE FIELD
    const updateField = (field, value) => {
        setGuest(prev => ({ ...prev, [field]: value }));

        // Clear error when changing field
        setErrors(prev => {
            const updated = { ...prev };
            delete updated[field];
            return updated;
        });
    };

    // VALIDATION
    const validate = () => {
        const newErrors = {};

        if (!guest.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!guest.age) {
            newErrors.age = "Age is required";
        } else if (guest.age < 1 || guest.age > 120) {
            newErrors.age = "Please enter a valid age";
        }

        if (!guest.gender) {
            newErrors.gender = "Gender is required";
        }

        if (!guest.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^\d{10}$/.test(guest.phone)) {
            newErrors.phone = "Enter a valid 10-digit number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // SCROLL TO FIRST ERROR
    const scrollToFirstError = (errObj) => {
        const firstKey = Object.keys(errObj)[0];
        const element = document.querySelector(`[data-field="${firstKey}"]`);
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    // SUBMIT
    const handleSubmit = async () => {
        if (!validate()) {
            scrollToFirstError(errors);
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                ...guest,
                phone: guest.countryCode + guest.phone,
            };

            delete payload.countryCode;

            await onComplete(payload);
        } catch (err) {
            console.error(err);
        }

        setIsSubmitting(false);
    };

    return (
        <div className="text-white max-w-2xl mx-auto">

            <h2 className="text-2xl font-bold mb-4">Guest Details</h2>

            <div className="space-y-6">

                {/* NAME */}
                <div className="flex flex-col gap-2" data-field="name">
                    <label className="text-sm font-medium">Full Name *</label>
                    <input
                        value={guest.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        className={`w-full p-3 rounded-lg bg-neutral-800 border ${errors.name
                            ? "border-red-500"
                            : "border-neutral-700 focus:border-blue-500"
                            }`}
                        placeholder="Enter name"
                    />
                    {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
                </div>

                {/* AGE + GENDER */}
                <div className="grid grid-cols-2 gap-4">

                    <div data-field="age">
                        <label className="text-sm font-medium">Age *</label>
                        <input
                            type="number"
                            min="1"
                            max="120"
                            value={guest.age}
                            onChange={(e) => updateField("age", e.target.value)}
                            className={`w-full p-3 rounded-lg bg-neutral-800 border ${errors.age
                                ? "border-red-500"
                                : "border-neutral-700 focus:border-blue-500"
                                }`}
                        />
                        {errors.age && <p className="text-red-400 text-sm">{errors.age}</p>}
                    </div>

                    <div data-field="gender">
                        <label className="text-sm font-medium">Gender *</label>
                        <select
                            value={guest.gender}
                            onChange={(e) => updateField("gender", e.target.value)}
                            className={`w-full p-3 rounded-lg bg-neutral-800 border ${errors.gender
                                ? "border-red-500"
                                : "border-neutral-700 focus:border-blue-500"
                                }`}
                        >
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                        {errors.gender && <p className="text-red-400 text-sm">{errors.gender}</p>}
                    </div>

                </div>

                {/* PHONE */}
                <div data-field="phone">
                    <label className="text-sm font-medium">Phone *</label>

                    <div className="flex gap-3">
                        <select
                            value={guest.countryCode}
                            onChange={(e) => updateField("countryCode", e.target.value)}
                            className="w-32 p-3 rounded-lg bg-neutral-800 border border-neutral-700"
                        >
                            {countryCodes.map(c => (
                                <option key={c.code} value={c.code}>
                                    {c.flag} {c.code}
                                </option>
                            ))}
                        </select>

                        <input
                            value={guest.phone}
                            onChange={(e) =>
                                updateField("phone", e.target.value.replace(/\D/g, ""))
                            }
                            type="text"
                            maxLength={10}
                            className={`flex-1 p-3 rounded-lg bg-neutral-800 border ${errors.phone
                                ? "border-red-500"
                                : "border-neutral-700 focus:border-blue-500"
                                }`}
                            placeholder="1234567890"
                        />
                    </div>

                    {errors.phone && <p className="text-red-400 text-sm">{errors.phone}</p>}
                </div>

                {/* SUBMIT BUTTON */}
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-lg font-semibold ${isSubmitting
                        ? "bg-blue-400"
                        : "bg-blue-600 hover:bg-blue-700"
                        }`}
                >
                    {isSubmitting ? "Saving..." : "Save Guest Details"}
                </button>

            </div>
        </div>
    );
}
