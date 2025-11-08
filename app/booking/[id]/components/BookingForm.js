"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BookingCalendar from "@/components/bookingCalender";
import Toast from "@/components/toast";
import { Loader2, ShieldCheck } from "lucide-react";
import VerificationModal from "./VerificationModal";
import FeedbackModal from "./FeedbackModal";

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
    const [formData, setFormData] = useState({ checkin: "", checkout: "", guests: 2 });
    const [formError, setFormError] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [bookingSummary, setBookingSummary] = useState(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [id, setId] = useState(null);

    // Fixed check-in and check-out times
    const fixedCheckinTime = "15:00"; // 3:00 PM
    const fixedCheckoutTime = "11:00"; // 11:00 AM

    // Calculate price summary
    useEffect(() => {
        if (formData.checkin && formData.checkout) {
            const nights = calculateNights(formData.checkin, formData.checkout);
            const basePrice = nights * dailyRate;
            const total = basePrice + cleaningFee;

            setBookingSummary({
                nights,
                basePrice,
                cleaningFee,
                total,
                guests: formData.guests
            });
        } else {
            setBookingSummary(null);
        }
    }, [formData.checkin, formData.checkout, formData.guests, dailyRate, cleaningFee]);

    const handleSubmit = (e) => {
        e.preventDefault();

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

                {/* Booking Form */}
                <div>
                    <h2 className="text-xl font-bold mb-6 text-center">Book Your Stay</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Calendar */}
                        <BookingCalendar
                            formData={formData}
                            setFormData={setFormData}
                            disabledRanges={disabledRanges}
                            lockedRanges={lockedRanges}
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
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Guests</span>
                            <select
                                value={formData.guests || 2}
                                onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                                className="bg-neutral-800 text-white p-1 rounded border border-white/10"
                            >
                                {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>)}
                            </select>
                        </div>

                        {/* Price Summary */}
                        <div className="p-4 rounded-xl border border-white/10 bg-neutral-800 shadow-sm space-y-3">
                            <p className="text-white font-semibold text-lg">Price Summary</p>

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
                                            <span>₹{dailyRate} × {bookingSummary.nights} nights</span>
                                            <span>₹{bookingSummary.basePrice}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Cleaning Fee</span>
                                            <span>₹{cleaningFee}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/10">
                                        <span>Total</span>
                                        <span className="text-teal-400">₹{bookingSummary.total}</span>
                                    </div>
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
                                <a href="/terms" className="text-teal-400 hover:underline">
                                    Terms & Conditions
                                </a>{" "}
                                and{" "}
                                <a href="/cancellation-policy" className="text-teal-400 hover:underline">
                                    Cancellation Policy
                                </a>.
                            </label>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || !agreeTerms || !bookingSummary}
                            className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 rounded-lg hover:from-teal-700 hover:to-teal-800 transition font-medium shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...
                                </>
                            ) : (
                                "Continue to Payment"
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <VerificationModal
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

export default BookingForm;