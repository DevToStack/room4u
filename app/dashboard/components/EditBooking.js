'use client';
import { useState, useEffect } from 'react';

export default function BookingUpdateModal({
    isOpen,
    onClose,
    booking,
    onUpdateSuccess
}) {
    const [formData, setFormData] = useState({
        start_date: booking.start_date,
        end_date: booking.end_date,
        guests: booking.guests,
        guest_details: booking.guest_details || [],
        apartment_id: booking.apartment_id,
        total_amount: booking.total_amount
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [dateConflict, setDateConflict] = useState(null);

    if (!isOpen) return null;

    // AUTO-RECALCULATE TOTAL AMOUNT
    useEffect(() => {
        if (!formData.start_date || !formData.end_date) return;

        const start = new Date(formData.start_date);
        const end = new Date(formData.end_date);
        const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

        if (nights > 0) {
            setFormData(prev => ({
                ...prev,
                total_amount: nights * booking.price_per_night
            }));
        }
    }, [formData.start_date, formData.end_date]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const payload = {
                apartment_id: formData.apartment_id,
                start_date: formData.start_date,
                end_date: formData.end_date,
                guests: formData.guests,
                total_amount: formData.total_amount,
                guest_details: formData.guest_details
            };

            const response = await fetch(`/api/dashboard/bookings/${booking.id}`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                if (result.code === "DATE_CONFLICT") {
                    setDateConflict(result.conflictingDates);
                    setError(result.error);
                } else {
                    setError(result.error || "Failed to update booking");
                }
                return;
            }

            onUpdateSuccess();
            onClose();

        } catch (err) {
            console.error(err);
            setError("Unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateGuestDetail = (index, field, value) => {
        const updated = [...formData.guest_details];
        updated[index][field] = value;
        setFormData(prev => ({ ...prev, guest_details: updated }));
    };

    const addGuest = () => {
        setFormData(prev => ({
            ...prev,
            guest_details: [
                ...prev.guest_details,
                { name: "", age: "", gender: "", contact: "" }
            ]
        }));
    };

    const removeGuest = (index) => {
        const updated = [...formData.guest_details];
        updated.splice(index, 1);
        setFormData(prev => ({ ...prev, guest_details: updated }));
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={handleOverlayClick}
        >
            <div
                className="bg-neutral-900 border border-neutral-700 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <div className="p-5 border-b border-neutral-700 flex justify-between items-center">
                    <h2 className="text-lg text-teal-400 font-semibold">Update Booking #{booking.id}</h2>
                    <button onClick={onClose} className="text-2xl text-gray-400 hover:text-teal-300">×</button>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Start Date */}
                    <div>
                        <label className="text-sm text-gray-300">Start Date</label>
                        <input
                            type="date"
                            value={formData.start_date}
                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-gray-100"
                        />
                        <p className="text-xs text-gray-500">Current: {formatDate(booking.start_date)}</p>
                    </div>

                    {/* End Date */}
                    <div>
                        <label className="text-sm text-gray-300">End Date</label>
                        <input
                            type="date"
                            value={formData.end_date}
                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-gray-100"
                        />
                        <p className="text-xs text-gray-500">Current: {formatDate(booking.end_date)}</p>
                    </div>

                    {/* Guests Count */}
                    <div>
                        <label className="text-sm text-gray-300">Guests</label>
                        <input
                            type="number"
                            value={formData.guests}
                            min="1"
                            max={booking.max_guests}
                            onChange={(e) => setFormData({ ...formData, guests: Number(e.target.value) })}
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-gray-100"
                        />
                    </div>

                    {/* Total Amount */}
                    <div>
                        <label className="text-sm text-gray-300">Total Amount</label>
                        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-gray-100">
                            ₹ {formData.total_amount}
                        </div>
                    </div>

                    {/* Guest Details Section */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <h3 className="text-md text-teal-300">Guest Details</h3>
                            <button
                                type="button"
                                onClick={addGuest}
                                className="px-3 py-1 bg-teal-600 rounded-lg text-sm"
                            >
                                + Add Guest
                            </button>
                        </div>

                        {formData.guest_details.map((guest, index) => (
                            <div key={index} className="border border-neutral-700 rounded-lg p-3 space-y-2">
                                <div className="flex justify-between">
                                    <h4 className="text-gray-300 text-sm">Guest #{index + 1}</h4>
                                    <button
                                        type="button"
                                        onClick={() => removeGuest(index)}
                                        className="text-red-400 hover:text-red-300 text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>

                                <input
                                    type="text"
                                    placeholder="Name"
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2"
                                    value={guest.name}
                                    onChange={(e) => updateGuestDetail(index, "name", e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="Age"
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2"
                                    value={guest.age}
                                    onChange={(e) => updateGuestDetail(index, "age", e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Gender"
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2"
                                    value={guest.gender}
                                    onChange={(e) => updateGuestDetail(index, "gender", e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Contact"
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2"
                                    value={guest.contact}
                                    onChange={(e) => updateGuestDetail(index, "contact", e.target.value)}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-lg p-3">
                            {error}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 border border-neutral-600 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-2 bg-teal-600 hover:bg-teal-500 rounded-lg"
                        >
                            {isSubmitting ? "Updating..." : "Update Booking"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
