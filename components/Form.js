'use client';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faUser, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import BookingCalendar from '@/components/bookingCalender';

const RoomAvailabilityForm = ({ open, onClose, setToast }) => {
    const [formData, setFormData] = useState({ checkin: '', checkout: '' });
    const [availability, setAvailability] = useState(null);
    const [showCalendar, setShowCalendar] = useState(false);

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    useEffect(() => {
        if (!open) {
            setFormData({ checkin: '', checkout: '' });
            setAvailability(null);
            setShowCalendar(false);
        }
    }, [open]);

    const handleCheckAvailability = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/check-availability", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    apartment_id: 1,
                    checkin: formData.checkin,
                    checkout: formData.checkout,
                }),
            });

            const data = await res.json();

            onClose(); // close modal

            setToast({
                message: data.message || (data.available ? "Room available" : "Room not available"),
                type: data.available ? "success" : "error",
            });
        } catch (err) {
            onClose();
            setToast({ message: "Server error. Please try again.", type: "error" });
        }
      };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-[330px]">
                <form
                    onSubmit={handleCheckAvailability}
                    className="flex flex-col items-center justify-center max-w-sm mx-auto
                               bg-black/30 backdrop-blur-md
                               rounded-2xl p-6 space-y-6 
                               border border-white/30 shadow-lg animate-scale-up"
                >
                    {/* Close Button */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-3 right-3 flex items-center gap-1 
                            text-gray-400 rounded-full 
                            px-3 py-1 bg-white/20 
                            hover:bg-red-600/70 hover:text-gray-100 font-medium"
                    >
                        Close
                    </button>

                    <h2 className="text-2xl font-bold text-center text-gray-100 drop-shadow-sm mt-6">
                        Check Room Availability
                    </h2>

                    {/* Date Range Input */}
                    <div className="w-full relative">
                        <label className="text-gray-200 font-medium">Check-In / Check-Out</label>
                        <div
                            onClick={() => setShowCalendar(!showCalendar)}
                            className="flex items-center justify-between cursor-pointer text-white placeholder-gray-400 
                   bg-transparent backdrop-blur-sm mt-2 p-2 border border-white/30 rounded-xl 
                   focus-within:border-white transition-colors duration-200"
                            tabIndex={0} // allows focus
                        >
                            <span>
                                {formData.checkin && formData.checkout
                                    ? `${formData.checkin} → ${formData.checkout}`
                                    : 'Select dates'}
                            </span>
                            <FontAwesomeIcon icon={faCalendar} />
                        </div>
                        {showCalendar && (
                            <div className="absolute left-0 mt-2 z-50">
                                <BookingCalendar
                                    formData={formData}
                                    setFormData={setFormData}
                                    disabledRanges={[]}
                                    lockedRanges={[]}
                                    size="small"
                                    background="black"
                                />
                            </div>
                        )}
                    </div>

                    {/* Guests Input */}
                    <div className="flex flex-col w-full">
                        <label htmlFor="guests" className="text-gray-200 font-medium">Number of Guests</label>
                        <div className="flex items-center mt-2 border border-white/30 rounded-xl bg-transparent p-2 focus-within:border-white transition-colors duration-200">
                            <FontAwesomeIcon icon={faUser} className="text-gray-300 mr-2" />
                            <input
                                type="number"
                                id="guests"
                                min="1"
                                className="text-white placeholder-gray-400 bg-transparent w-full focus:outline-none"
                                placeholder="e.g. 4"
                            />
                        </div>
                    </div>


                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={!formData.checkin || !formData.checkout}
                        className="w-full px-6 py-3 rounded-xl font-semibold 
                                   bg-white/20 hover:bg-white/30 
                                   text-white shadow-md transition duration-300 
                                   disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        Check Availability <FontAwesomeIcon icon={faCheck} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RoomAvailabilityForm;
