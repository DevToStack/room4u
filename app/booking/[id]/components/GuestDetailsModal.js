"use client";

import { X } from "lucide-react";
import GuestDetailsForm from "./GuestDetailsForm";

export default function GuestDetailsModal({
    isOpen,
    onClose,
    guestCount,
    onSave,
    initialData     // <-- FIXED: now modal receives initialData
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-100 px-4">
            <div className="relative bg-neutral-900 p-6 rounded-xl w-full max-w-lg border border-white/10">

                {/* X Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-white 
                        hover:bg-neutral-800 p-1 rounded-full transition"
                >
                    <X className="w-5 h-5" />
                </button>

                <GuestDetailsForm
                    guestCount={guestCount}
                    initialData={initialData}   // <-- FIXED: pass correctly
                    onComplete={onSave}
                />

            </div>
        </div>
    );
}
