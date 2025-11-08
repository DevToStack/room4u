'use client';
import { useEffect } from "react";
import { Loader2, ShieldCheck } from "lucide-react";

function VerificationModal({ isOpen, onClose, onConfirm, loading }) {
    // Disable scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed left-0 top-0 w-full h-full 
                       flex items-center justify-center 
                       bg-black/70 backdrop-blur-sm 
                       z-[9999] p-4"
            style={{ position: "fixed" }} // ensures it never inherits parent positioning
        >
            <div
                className="bg-neutral-900 rounded-2xl p-6 max-w-md w-full 
                           border border-white/10 shadow-2xl 
                           relative z-[10000]"
            >
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8 text-teal-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                        Confirm Your Booking
                    </h3>
                    <p className="text-gray-300 text-sm">
                        Please verify your booking details before proceeding.
                        You&apos;ll complete payment on the next page.
                    </p>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-3 px-4 bg-neutral-700 hover:bg-neutral-600 
                                   text-white rounded-lg transition font-medium 
                                   disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 
                                   text-white rounded-lg transition font-medium 
                                   disabled:opacity-50 flex items-center justify-center"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Confirming...
                            </>
                        ) : (
                            "Confirm Booking"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default VerificationModal;
