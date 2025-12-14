"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import BookingCalendar from "@/components/bookingCalender";
import Toast from "@/components/toast";
import { Loader2, ShieldCheck, Tag } from "lucide-react";
import VerificationModal from "./VerificationModal";
import FeedbackModal from "./FeedbackModal";
import GuestDetailsForm from "./GuestDetailsForm";
import GuestDetailsModal from "./GuestDetailsModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useOffers, applyOffer, getApplicableOffers } from "@/hooks/useOffers";

function formatForMySQL(date) {
    const pad = (n) => n.toString().padStart(2, "0");
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const mi = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

function calculateNights(checkin, checkout) {
    if (!checkin || !checkout) return 0;
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const timeDiff = checkoutDate.getTime() - checkinDate.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return nights > 0 ? nights : 0;
}

function BookingForm({ apartmentId, disabledRanges, lockedRanges, dailyRate = 200, cleaningFee = 500 }) {
    const router = useRouter();
    const { offers, loading: offersLoading } = useOffers(apartmentId);
    const [formData, setFormData] = useState({ checkin: "", checkout: "", guests: 1 });
    const [formError, setFormError] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [bookingSummary, setBookingSummary] = useState(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [loadCallender, setLoadCallender] = useState(false);
    const [id, setId] = useState(null);
    const [guestsInfo, setGuestsInfo] = useState([]);
    const [showGuestModal, setShowGuestModal] = useState(false);


    const applicableOffers = useMemo(() => {
        return getApplicableOffers(offers, apartmentId);
    }, [offers, apartmentId]);

    // Check if any guest is 18+ years old
    const hasAdultGuest = useMemo(() => {
        return guestsInfo.some(guest => {
            const age = guest.age;
            return age && Number(age) >= 18;
        });
    }, [guestsInfo]);

    // Fixed check-in and check-out times
    const fixedCheckinTime = "15:00"; // 3:00 PM
    const fixedCheckoutTime = "11:00"; // 11:00 AM

    // Calculate price summary with offers applied
    useEffect(() => {
        if (formData.checkin && formData.checkout) {
            const nights = calculateNights(formData.checkin, formData.checkout);

            // Apply offer to daily rate
            const discountedDailyRate = applyOffer(dailyRate, offers, apartmentId);
            const hasDailyDiscount = discountedDailyRate < dailyRate;

            const basePrice = nights * discountedDailyRate;
            const total = basePrice + cleaningFee;

            // Calculate discount details
            let appliedOffer = null;
            if (hasDailyDiscount && applicableOffers.length > 0) {
                // Find which offer was applied
                applicableOffers.sort((a, b) => b.discount_percentage - a.discount_percentage);
                appliedOffer = applicableOffers[0];
            }

            setBookingSummary({
                nights,
                dailyRate: discountedDailyRate,
                originalDailyRate: dailyRate,
                basePrice,
                cleaningFee,
                total,
                guests: formData.guests,
                hasDiscount: hasDailyDiscount,
                discountAmount: hasDailyDiscount ? (dailyRate - discountedDailyRate) * nights : 0,
                appliedOffer: appliedOffer
            });
        } else {
            setBookingSummary(null);
        }
    }, [formData.checkin, formData.checkout, formData.guests, dailyRate, cleaningFee, apartmentId, applicableOffers]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Check if there's an adult guest
        if (!hasAdultGuest) {
            setFormError("At least one guest must be 18 years or older.");
            return;
        }

        if (!agreeTerms) {
            setFormError("You must agree to the Terms & Conditions to continue.");
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!formData.checkin || !formData.checkout) {
            setFormError("Please select check-in and check-out dates.");
            return;
        }

        const checkinDateTime = new Date(`${formData.checkin}T${fixedCheckinTime}`);
        const checkoutDateTime = new Date(`${formData.checkout}T${fixedCheckoutTime}`);

        if (checkinDateTime < today) {
            setFormError("Check-in date cannot be in the past.");
            return;
        }
        if (checkoutDateTime <= checkinDateTime) {
            setFormError("Check-out must be after check-in.");
            return;
        }

        setFormError("");
        setError("");
        setShowVerificationModal(true);
    };

    const handleConfirmBooking = async () => {
        try {
            setLoading(true);

            if (!formData.guests || formData.guests < 1) {
                setFormError("Please select number of guests.");
                setShowVerificationModal(false);
                return;
            }

            if (!bookingSummary) {
                setFormError("Please select valid dates.");
                setShowVerificationModal(false);
                return;
            }

            // Check again for adult guest before confirming
            if (!hasAdultGuest) {
                setFormError("At least one guest must be 18 years or older.");
                setShowVerificationModal(false);
                return;
            }

            const checkinSQL = formatForMySQL(new Date(`${formData.checkin}T${fixedCheckinTime}`));
            const checkoutSQL = formatForMySQL(new Date(`${formData.checkout}T${fixedCheckoutTime}`));

            const bookingRes = await fetch("/api/bookings/create-temp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    apartment_id: Number(apartmentId),
                    check_in: checkinSQL,
                    check_out: checkoutSQL,
                    guests: Number(formData.guests),
                    total_amount: Number(bookingSummary.total),
                    nights: Number(bookingSummary.nights),
                    guest_details: guestsInfo,
                }),
            });

            const bookingData = await bookingRes.json();

            if (!bookingRes.ok) {
                setFormError(bookingData.error || "Apartment not available.");
                return;
            }

            setId(bookingData.id);
            setShowVerificationModal(false);
            setShowFeedbackModal(true);
            setLoadCallender(true);
            router.push('/dashboard')
        } catch (err) {
            console.error("Booking error:", err);
            setError("Something went wrong. Please try again.");
            setShowVerificationModal(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section>
            <div className="sticky top-24 bg-neutral-900 rounded-xl p-4 sm:p-6 border border-white/10 shadow-lg space-y-6">
                {/* Errors */}
                {(formError || error) && (
                    <Toast
                        message={formError || error}
                        type="error"
                        onClose={() => { setFormError(""); setError(""); }}
                    />
                )}
                {/* Offer Banner */}
                {!offersLoading && applicableOffers.length > 0 && (
                    <div className="bg-gradient-to-r from-teal-900/30 to-teal-800/30 border border-teal-700/50 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                            <Tag className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="font-semibold text-teal-300 mb-1">Special Offer Applied!</p>
                                <div className="space-y-1">
                                    {applicableOffers.map((offer) => (
                                        <div key={offer.id} className="text-sm">
                                            <span className="font-medium">{offer.title}:</span>
                                            <span className="text-teal-200 ml-2">{offer.discount_percentage}% OFF</span>
                                            {offer.description && (
                                                <p className="text-gray-300 text-xs mt-0.5">{offer.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                    Valid until: {new Date(applicableOffers[0].valid_until).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                {/* Booking Form */}
                <div>
                    <h2 className="text-xl font-bold mb-6 text-center">Book Your Stay</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Calendar */}
                        <BookingCalendar
                            loadCallender={loadCallender}
                            setLoadCallender={setLoadCallender}
                            apartmentId={Number(apartmentId)}
                            formData={formData}
                            setFormData={setFormData}
                            background="neutral-800"
                        />

                        {/* Fixed Times Display */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-white mb-1 block">Check-in Time</label>
                                <div className="w-full p-3 rounded-lg bg-neutral-800 text-white border border-white/10">
                                    {fixedCheckinTime} (3:00 PM)
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Fixed check-in time</p>
                            </div>
                            <div>
                                <label className="text-sm text-white mb-1 block">Check-out Time</label>
                                <div className="w-full p-3 rounded-lg bg-neutral-800 text-white border border-white/10">
                                    {fixedCheckoutTime} (11:00 AM)
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Fixed check-out time</p>
                            </div>
                        </div>

                        {/* Guests */}
                        <div className="flex flex-col justify-between text-sm space-y-2">
                            <GuestList
                                guests={guestsInfo}
                                hasAdultGuest={hasAdultGuest}
                                onEdit={(index) => {
                                    setFormData({ ...formData, editIndex: index });
                                    setShowGuestModal(true);
                                }}
                                onDelete={(index) => {
                                    const updated = [...guestsInfo];
                                    updated.splice(index, 1);
                                    setGuestsInfo(updated);

                                    // Update guest count
                                    setFormData({ ...formData, guests: updated.length });
                                }}

                            />

                            {/* Adult Guest Requirement Message */}
                            {guestsInfo.length > 0 && !hasAdultGuest && (
                                <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded-lg border border-red-800/50">
                                    ⚠️ At least one guest must be 18 years or older to book.
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => setShowGuestModal(true)}
                                className="mt-3 w-full bg-teal-800 border border-white/10 p-3 rounded-lg text-gray-300 hover:bg-teal-700 transition"
                            >
                                + Add Guest
                            </button>

                        </div>

                        {/* Price Summary */}
                        <div className="p-4 rounded-xl border border-white/10 bg-neutral-800 shadow-sm space-y-3">
                            <div className="flex justify-between items-center">
                                <p className="text-white font-semibold text-lg">Price Summary</p>
                                {bookingSummary?.hasDiscount && bookingSummary.appliedOffer && (
                                    <span className="bg-teal-900 text-teal-300 text-xs font-medium px-2 py-1 rounded">
                                        {bookingSummary.appliedOffer.title}
                                    </span>
                                )}
                            </div>

                            {bookingSummary ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Check-in</span>
                                        <span>{formData.checkin} at {fixedCheckinTime}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Check-out</span>
                                        <span>{formData.checkout} at {fixedCheckoutTime}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Guests</span>
                                        <span>{formData.guests} {formData.guests === 1 ? "Guest" : "Guests"}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Nights</span>
                                        <span>{bookingSummary.nights}</span>
                                    </div>

                                    <div className="border-t border-white/10 my-2 pt-2 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="flex items-center gap-2">
                                                {bookingSummary.hasDiscount ? (
                                                    <>
                                                        <span className="text-teal-300">₹{bookingSummary.dailyRate}</span>
                                                        <span className="line-through text-gray-400">₹{bookingSummary.originalDailyRate}</span>
                                                    </>
                                                ) : (
                                                    <span>₹{bookingSummary.dailyRate}</span>
                                                )}
                                                <span>× {bookingSummary.nights} nights</span>
                                            </span>
                                            <span>₹{bookingSummary.basePrice}</span>
                                        </div>

                                        <div className="flex justify-between text-sm">
                                            <span>Cleaning Fee</span>
                                            <span>₹{cleaningFee}</span>
                                        </div>

                                        {bookingSummary.hasDiscount && (
                                            <div className="flex justify-between text-sm text-teal-400">
                                                <span>Discount Applied ({bookingSummary.appliedOffer?.discount_percentage}%)</span>
                                                <span>-₹{bookingSummary.discountAmount.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/10">
                                        <span>Total</span>
                                        <span className="text-teal-400">₹{bookingSummary.total}</span>
                                    </div>

                                    {bookingSummary.hasDiscount && (
                                        <p className="text-xs text-gray-400 text-center pt-2">
                                            You save ₹{bookingSummary.discountAmount.toFixed(2)} with this offer!
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-400">
                                    Select dates to see price summary
                                </div>
                            )}
                        </div>

                        {/* Secure Payment Badge */}
                        <div className="flex items-center justify-center gap-2 p-3 bg-teal-900/20 rounded-lg border border-teal-800/50">
                            <ShieldCheck className="w-5 h-5 text-teal-400" />
                            <span className="text-sm">Secure booking process</span>
                        </div>

                        {/* Terms */}
                        <div className="flex items-start gap-3 text-sm text-gray-300">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={agreeTerms}
                                onChange={() => setAgreeTerms(!agreeTerms)}
                                className="mt-1 accent-teal-600"
                            />
                            <label htmlFor="terms" className="leading-snug">
                                I agree to the{" "}
                                <a href="/terms-conditions" className="text-teal-400 hover:underline">
                                    Terms & Conditions
                                </a>{" "}
                                and{" "}
                                <a href="/cancellation-refund" className="text-teal-400 hover:underline">
                                    Cancellation Policy
                                </a>.
                            </label>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || !agreeTerms || !bookingSummary || !hasAdultGuest}
                            className={`w-full text-white py-4 rounded-lg transition font-medium shadow-lg flex items-center justify-center bg-gradient-to-r from-teal-600 to-teal-700 
                                ${!hasAdultGuest ? 'cursor-not-allowed opacity-70' : 'hover:from-teal-700 hover:to-teal-800'}`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...
                                </>
                            ) :(
                                "Request a Booking"
                            )}
                        </button>
                    </form>

                    <GuestDetailsModal
                        isOpen={showGuestModal}
                        guestCount={formData.guests}
                        initialData={
                            formData.editIndex !== undefined
                                ? guestsInfo[formData.editIndex]
                                : null
                        }
                        onClose={() => {
                            setShowGuestModal(false);
                            setFormData({ ...formData, editIndex: undefined });
                        }}
                        onSave={(data) => {
                            if (formData.editIndex !== undefined) {
                                const updated = [...guestsInfo];
                                updated[formData.editIndex] = data;
                                setGuestsInfo(updated);
                                setFormData({ ...formData, guests: updated.length, editIndex: undefined });
                            } else {
                                const updated = [...guestsInfo, data];
                                setGuestsInfo(updated);
                                setFormData({ ...formData, guests: updated.length });
                            }
                            setShowGuestModal(false);
                        }}

                    />


                </div>
            </div>

            <VerificationModal
                loadCallender={loadCallender}
                setLoadCallender={setLoadCallender}
                isOpen={showVerificationModal}
                onClose={() => setShowVerificationModal(false)}
                onConfirm={handleConfirmBooking}
                loading={loading}
            />
            {/* <FeedbackModal
                isOpen={showFeedbackModal}
                onClose={() => {
                    setShowFeedbackModal(false);
                    router.push(`/dashboard`);
                }}
                bookingId={id}
            /> */}
        </section>
    );
}

function GuestList({ guests, hasAdultGuest, onEdit, onDelete }) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Guests</span>
                {guests.length > 0 && (
                    <span className={`text-xs px-2 py-1 rounded-full ${hasAdultGuest ? 'bg-green-900/30 text-green-400 border border-green-800/50' : 'bg-red-900/30 text-red-400 border border-red-800/50'}`}>
                        {hasAdultGuest ? '✓ Adult present' : '⚠️ No adult'}
                    </span>
                )}
            </div>

            {guests.length === 0 && (
                <div className="text-gray-500 text-sm">No guest details added.</div>
            )}

            <div className="space-y-2">
                {guests.map((guest, index) => {
                    const age = guest.age ? Number(guest.age) : null;
                    const isAdult = age !== null && age >= 18;

                    return (
                        <div
                            key={index}
                            className={`flex items-center justify-between p-3 rounded-lg border ${isAdult ? 'bg-green-900/10 border-green-800/30' : 'bg-red-900/10 border-red-800/30'}`}
                        >
                            <div className="text-white">
                                <div className="font-medium">{guest.name || `Guest ${index + 1}`}</div>
                                <div className="text-xs text-gray-400">
                                    {age !== null ? `${age} years old` : 'Age not specified'}
                                    {guest.email && ` • ${guest.email}`}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Age indicator */}
                                <span className={`text-xs px-2 py-1 rounded ${isAdult ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                                    {age !== null ? (isAdult ? '18+' : `<18`) : 'No age'}
                                </span>

                                {/* Edit */}
                                <button
                                    type="button"
                                    onClick={() => onEdit(index)}
                                    className="text-teal-400 hover:text-teal-300"
                                >
                                    <FontAwesomeIcon icon={faPen} className="w-4 h-4" />
                                </button>

                                {/* Delete */}
                                <button
                                    type="button"
                                    onClick={() => onDelete(index)}
                                    className="text-red-400 hover:text-red-300"
                                >
                                    <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default BookingForm;