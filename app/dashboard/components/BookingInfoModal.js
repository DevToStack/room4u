'use client';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTimes,
    faCalendar,
    faClock,
    faInfoCircle,
    faCheckCircle,
    faExclamationTriangle,
    faTrash,
    faBan,
    faArrowLeft,
    faRupeeSign,
    faUser,
    faUsers,
    faAddressCard,
    faBed,
    faTag,
    faDoorOpen,
    faPhone,
    faHourglassHalf,
    faSpinner,
    faChartLine,
    faRupee,
    faUpload,
    faIndianRupee
} from "@fortawesome/free-solid-svg-icons";
import VerificationModal from "@/app/booking/[id]/components/VerificationModal";
import { useState } from "react";

export default function BookingInfoModal({
    booking,
    isOpen,
    onClose,
    onCancel,
    onDelete
}) {
    if (!isOpen || !booking) return null;

    const [loading, setLoading] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    // ---- Progress Logic ----
    const getProgress = () => {
        if (booking.status === "pending") return 50;
        if (booking.status === "confirmed" && booking.paymentStatus !== "paid")
            return 90;
        if (booking.paymentStatus === "paid") return 100;
        return 0;
    };
    const handleConfirmBooking = () => {
        // Logic to confirm booking
        setLoading(true);
        setShowVerificationModal(false);
    };
    const getVerificationColor = (status) => {
        return {
            in_progress: "text-yellow-400",
            verified: "text-green-400",
            rejected: "text-red-400",
        }[status] || "text-gray-400";
    };

    const getVerificationIcon = (status) => {
        return {
            in_progress: faSpinner,
            verified: faCheckCircle,
            rejected: faExclamationTriangle,
        }[status] || faClock;
    };
    
    const getStatusColor = (status) => {
        return {
            pending: "text-yellow-400",
            confirmed: "text-teal-400",
            cancelled: "text-red-400",
            expired: "text-gray-400",
        }[status] || "text-gray-400";
    };

    const getPaymentColor = (status) => {
        return {
            unpaid: "text-red-400",
            paid: "text-green-400",
        }[status] || "text-gray-400";
    };
    console.log(booking.id);
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[9999] p-4">

            <div className="w-full max-h-[600px] max-w-2xl bg-neutral-900/90 rounded-2xl shadow-2xl border border-neutral-700 p-6 max-sm:p-3 animate-[fadeIn_.3s_ease]">

                {/* Header */}
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FontAwesomeIcon icon={faInfoCircle} className="text-teal-400" />
                        Booking Details
                    </h2>

                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition"
                    >
                        <FontAwesomeIcon icon={faTimes} size="lg" />
                    </button>
                </div>

                {/* Booking Info */}
                <div className="space-y-4 max-h-[420px] overflow-y-auto">

                    {/* Progress Bar – Minimal Line */}
                    <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                        <h3 className="text-sm text-gray-300 mb-3 flex items-center gap-2">
                            <FontAwesomeIcon icon={faChartLine} className="text-teal-400" />
                            Booking Progress
                        </h3>

                        <div className="relative w-full h-2 bg-neutral-700 rounded-full">
                            <div
                                className="absolute left-0 top-0 h-full bg-teal-500 rounded-full transition-all duration-500"
                                style={{ width: `${getProgress()}%` }}
                            ></div>

                            {/* Moving dot */}
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-teal-400 rounded-full shadow-lg transition-all duration-500"
                                style={{ left: `calc(${getProgress()}% - 8px)` }}
                            ></div>
                        </div>

                        <p className="text-xs text-gray-400 text-right mt-2">
                            {getProgress()}%
                        </p>
                    </div>


                    {/* Main Booking Details */}
                    <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                        <h3 className="text-lg text-teal-400 font-semibold mb-3 flex items-center gap-2">
                            <FontAwesomeIcon icon={faBed} />
                            Apartment: {booking.apartment}
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300">

                            {/* Item */}
                            <div className="flex items-center gap-3 p-3 bg-neutral-900/40 rounded-xl border border-neutral-700">
                                <FontAwesomeIcon icon={faCalendar} className="text-teal-400 text-lg" />
                                <div>
                                    <p className="text-xs text-gray-400">Check-In</p>
                                    <p className="text-sm">{booking.checkIn}</p>
                                </div>
                            </div>

                            {/* Item */}
                            <div className="flex items-center gap-3 p-3 bg-neutral-900/40 rounded-xl border border-neutral-700">
                                <FontAwesomeIcon icon={faCalendar} className="text-teal-400 text-lg" />
                                <div>
                                    <p className="text-xs text-gray-400">Check-Out</p>
                                    <p className="text-sm">{booking.checkOut}</p>
                                </div>
                            </div>

                            {/* Item */}
                            <div className="flex items-center gap-3 p-3 bg-neutral-900/40 rounded-xl border border-neutral-700">
                                <FontAwesomeIcon icon={faClock} className="text-teal-400 text-lg" />
                                <div>
                                    <p className="text-xs text-gray-400">Booked On</p>
                                    <p className="text-sm">{booking.created_at}</p>
                                </div>
                            </div>

                            {/* Item */}
                            <div className="flex items-center gap-3 p-3 bg-neutral-900/40 rounded-xl border border-neutral-700">
                                <FontAwesomeIcon icon={faHourglassHalf} className="text-teal-400 text-lg" />
                                <div>
                                    <p className="text-xs text-gray-400">Expires</p>
                                    <p className="text-sm">{booking.expires_at || "N/A"}</p>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center gap-3 p-3 bg-neutral-900/40 rounded-xl border border-neutral-700">
                                <FontAwesomeIcon icon={faTag} className={`text-lg ${getStatusColor(booking.status)}`} />
                                <div>
                                    <p className="text-xs text-gray-400">Status</p>
                                    <p className={`text-sm font-semibold ${getStatusColor(booking.status)}`}>
                                        {booking.status.toUpperCase()}
                                    </p>
                                </div>
                            </div>

                            {/* Payment */}
                            <div className="flex items-center gap-3 p-3 bg-neutral-900/40 rounded-xl border border-neutral-700">
                                <FontAwesomeIcon icon={faCheckCircle} className={`text-lg ${getPaymentColor(booking.paymentStatus)}`} />
                                <div>
                                    <p className="text-xs text-gray-400">Payment</p>
                                    <p className={`text-sm font-semibold ${getPaymentColor(booking.paymentStatus)}`}>
                                        {booking.paymentStatus?.toUpperCase() || "UNPAID"}
                                    </p>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="flex items-center gap-3 p-3 bg-neutral-900/40 rounded-xl border border-neutral-700 col-span-full">
                                <FontAwesomeIcon icon={faIndianRupee} className="text-green-400 text-lg" />
                                <div>
                                    <p className="text-xs text-gray-400">Total</p>
                                    <p className="text-sm font-semibold">₹{booking.total}</p>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Document Verification */}
                    {booking.document_verification && (
                        <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-blue-400">
                                <FontAwesomeIcon icon={faAddressCard} />
                                Document Verification
                            </h3>

                            <div className="flex items-center justify-between gap-4">

                                {/* Status */}
                                <div className="flex items-center gap-3">
                                    <FontAwesomeIcon
                                        icon={getVerificationIcon(booking.document_verification.status)}
                                        spin={booking.document_verification.status === "in_progress"}
                                        className={`text-lg ${getVerificationColor(
                                            booking.document_verification.status
                                        )}`}
                                    />
                                    <div>
                                        <p className="text-xs text-gray-400">Status</p>
                                        <p
                                            className={`text-sm font-semibold ${getVerificationColor(
                                                booking.document_verification.status
                                            )}`}
                                        >
                                            {booking.document_verification.status
                                                .replace("_", " ")
                                                .toUpperCase()}
                                        </p>
                                    </div>
                                </div>

                                {/* Reupload Button — ONLY IF REJECTED */}
                                {booking.document_verification.status === "rejected" && (
                                    <button
                                        onClick={() => {
                                            setShowVerificationModal(true);
                                        }}
                                        className="px-4 py-2 bg-red-900/40 border border-red-600 text-red-400 rounded-xl hover:bg-red-900/60 transition flex items-center gap-2"
                                    >
                                        <FontAwesomeIcon icon={faUpload} />
                                        Re-upload Document
                                    </button>
                                )}
                            </div>

                            {/* Admin Message (If Any) */}
                            {booking.document_verification.reviewMessage && (
                                <div className="mt-4 p-3 bg-neutral-900/60 border border-neutral-700 rounded-xl text-sm text-gray-300">
                                    <p className="text-xs text-gray-400 mb-1">Reviewer Note</p>
                                    {booking.document_verification.reviewMessage}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Guest Details */}
                    {Array.isArray(booking.guest_details) && booking.guest_details.length > 0 && (
                        <div className="bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                            <h3 className="text-lg text-purple-400 font-semibold mb-3 flex items-center gap-2">
                                <FontAwesomeIcon icon={faUsers} />
                                Guest Details
                            </h3>

                            <div className="grid grid-cols-2 gap-6 max-sm:grid-cols-1">
                                {booking.guest_details.map((g, index) => {
                                    const initial = g.name?.charAt(0)?.toUpperCase() || "G";
                                    return (
                                        <div
                                            key={index}
                                            className="flex flex-col items-center gap-4 p-4 bg-neutral-700/40 border border-neutral-600 rounded-2xl shadow-md"
                                        >
                                            <div className="flex justify-start w-full gap-3">
                                                {/* Avatar Circle */}
                                                <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                                                    {initial}
                                                </div>
                                                <div className="flex flex-col">
                                                    <p className="flex items-center gap-2 text-lg">
                                                        {g.name}
                                                    </p>
                                                    <div className="flex gap-6">
                                                        <p className="flex items-center gap-2 text-sm">
                                                            <FontAwesomeIcon icon={faClock} />
                                                            Age: {g.age}
                                                        </p>

                                                        <p className="flex items-center gap-2 text-sm">
                                                            <FontAwesomeIcon icon={faUser}/>
                                                            {g.gender}
                                                        </p>
                                                    </div>

                                                </div>
                                                
                                            </div>
                                            
                                            

                                            <p className="flex items-center justify-center gap-2 w-full">
                                                <FontAwesomeIcon icon={faPhone} className="text-gray-400" />
                                                {g.phone}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}


                </div>

                {/* Footer Buttons */}
                <div className="flex justify-between items-center mt-6">

                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-neutral-800 border border-neutral-600 text-gray-300 rounded-xl hover:bg-neutral-700 transition flex items-center gap-2"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Back
                    </button>

                    <div className="flex gap-3">

                        {booking.status !== "cancelled" &&
                            booking.status !== "expired" && (
                                <button
                                    onClick={() => onCancel(booking)}
                                    className="px-4 py-2 bg-amber-800/40 border border-amber-600 text-amber-400 rounded-xl hover:bg-amber-800/60 transition flex items-center gap-2"
                                >
                                    <FontAwesomeIcon icon={faBan} />
                                    Cancel Booking
                                </button>
                            )}
                    </div>

                </div>
            </div>

            <VerificationModal
                isOpen={showVerificationModal}
                onClose={() => setShowVerificationModal(false)}
                onConfirm={handleConfirmBooking}
                loading={loading}
                bookingId={booking.id}
            />
        </div>
    );
}
