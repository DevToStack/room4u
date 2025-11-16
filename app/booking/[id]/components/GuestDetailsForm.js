"use client";

import { useState, useEffect } from "react";

export default function GuestDetailsForm({ guestCount, onChange }) {
    const [activeTab, setActiveTab] = useState(0);

    // All guest info stored as array
    const [guestInfo, setGuestInfo] = useState([]);

    // Initialize guest array based on guestCount
    useEffect(() => {
        const newGuests = Array.from({ length: guestCount }, (_, i) => ({
            name: "",
            age: "",
            gender: "",
            phone: "",
        }));
        setGuestInfo(newGuests);
        setActiveTab(0);
        onChange(newGuests);
    }, [guestCount]);

    // Update a single guest object
    const updateGuest = (index, field, value) => {
        const updated = [...guestInfo];
        updated[index][field] = value;
        setGuestInfo(updated);
        onChange(updated); // pass updated data back to parent
    };

    return (
        <div className="p-5 rounded-xl bg-neutral-800 border border-white/10 shadow-md space-y-4">
            <p className="text-lg font-semibold text-white">Guest Details</p>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {guestInfo.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveTab(i)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border 
                        ${activeTab === i
                                ? "bg-teal-600 border-teal-700 text-white"
                                : "bg-neutral-900 border-white/10 text-gray-300 hover:bg-neutral-700"
                            }`}
                    >
                        Guest {i + 1}
                    </button>
                ))}
            </div>

            {/* Active form */}
            <div className="p-4 rounded-xl border border-white/10 bg-neutral-900 space-y-4">
                {/* Name */}
                <div>
                    <label className="text-sm text-gray-300">Full Name</label>
                    <input
                        type="text"
                        value={guestInfo[activeTab]?.name || ""}
                        onChange={(e) => updateGuest(activeTab, "name", e.target.value)}
                        placeholder="John Doe"
                        className="mt-1 w-full p-3 rounded-lg bg-neutral-800 text-white border border-white/10"
                    />
                </div>

                {/* Age + Gender */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-gray-300">Age</label>
                        <input
                            type="number"
                            value={guestInfo[activeTab]?.age || ""}
                            onChange={(e) => updateGuest(activeTab, "age", e.target.value)}
                            placeholder="25"
                            className="mt-1 w-full p-3 rounded-lg bg-neutral-800 text-white border border-white/10"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-300">Gender</label>
                        <select
                            value={guestInfo[activeTab]?.gender || ""}
                            onChange={(e) => updateGuest(activeTab, "gender", e.target.value)}
                            className="mt-1 w-full p-3 rounded-lg bg-neutral-800 text-white border border-white/10"
                        >
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>

                {/* Phone */}
                <div>
                    <label className="text-sm text-gray-300">Phone Number</label>
                    <input
                        type="tel"
                        value={guestInfo[activeTab]?.phone || ""}
                        onChange={(e) => updateGuest(activeTab, "phone", e.target.value)}
                        placeholder="+91 98765 43210"
                        className="mt-1 w-full p-3 rounded-lg bg-neutral-800 text-white border border-white/10"
                    />
                </div>
            </div>
        </div>
    );
}
