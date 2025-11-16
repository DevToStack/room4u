'use client';
import { useState, useEffect, useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export default function BookingCalendar({
    loadCallender,
    setLoadCallender,
    apartmentId,
    formData,
    setFormData,
    size = "medium",
    background = "white/10"
}) {
    const [monthsToShow, setMonthsToShow] = useState(1);
    const [disabledRanges, setDisabledRanges] = useState([]);
    const [loading, setLoading] = useState(false);
    // ----------------------------------------
    // 🔥 Fetch booked dates dynamically
    // ----------------------------------------
    async function fetchDisabledDates() {
        if (!apartmentId) return;
        setLoading(true)
        try {
            const res = await fetch("/api/booked-dates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ apartment_id: apartmentId })
            });

            const data = await res.json();

            if (data.bookings) {
                const ranges = data.bookings.map(b => ({
                    from: new Date(b.start_date),
                    to: new Date(b.end_date)
                }));

                setDisabledRanges(ranges);
                setLoading(false)
            }
        } catch (err) {
            console.error("Calendar fetch error:", err);
        }finally{
            setLoading(false);
        }
    }

    // Initial load
    useEffect(() => {
        fetchDisabledDates();
    }, [apartmentId]);

    // Reload when loadCallender = true
    useEffect(() => {
        if (loadCallender) {
            fetchDisabledDates();
            setLoadCallender(false);
        }
    }, [loadCallender]);

    // Responsive: always show 1 month (your design)
    useEffect(() => {
        const handleResize = () => setMonthsToShow(1);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Calendar scaling presets
    const sizeMap = useMemo(() => ({
        extraSmall: { scale: 0.7, font: 'text-xs', width: 'max-w-[270px]' },
        small: { scale: 0.9, font: 'text-sm', width: 'max-w-[310px]' },
        medium: { scale: 1, font: 'text-base', width: 'max-w-[320px]' },
        large: { scale: 1.2, font: 'text-lg', width: 'max-w-[420px]' },
        extraLarge: { scale: 1.5, font: 'text-xl', width: 'max-w-[560px]' },
    }), []);

    const { scale, font, width } = sizeMap[size] || sizeMap.medium;

    // ----------------------------------------
    // 📌 Handle selecting date range
    // ----------------------------------------
    const handleSelect = (range) => {
        if (!range?.from || !range?.to) return;

        const normalize = (date) => {
            const off = date.getTimezoneOffset();
            const local = new Date(date.getTime() - off * 60 * 1000);
            return local.toISOString().split("T")[0];
        };

        setFormData(prev => ({
            ...prev,
            checkin: normalize(range.from),
            checkout: normalize(range.to)
        }));
    };

    // ----------------------------------------
    // FINAL disabled = Past dates + Booked ranges
    // ----------------------------------------
    const finalDisabled = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const pastDisabled = {
            from: new Date(0),
            to: new Date(today.getTime() - 86400000),
        };

        return [pastDisabled, ...disabledRanges];
    }, [disabledRanges]);

    // ----------------------------------------
    // Render calendar
    // ----------------------------------------
    return (
        <div
            className={`relative border border-white/30 rounded-xl p-2 mx-auto shadow-md ${width} bg-${background}`}
            style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
        >
            {/* 🔥 Skeleton Loader (when loading) */}
            {loading ? (
                <div className="space-y-4">

                    {/* Month Title Skeleton */}
                    <div className="h-6 w-30 bg-white/10 rounded-full animate-pulse"></div>

                    {/* Weekdays Skeleton */}
                    <div className="grid grid-cols-7 gap-2 mt-2">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-4 bg-white/10 rounded-full animate-pulse"
                            />
                        ))}
                    </div>

                    {/* Gen-Z Bubble Date Placeholders */}
                    <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 42 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-10 rounded-md bg-white/10 animate-pulse
                               backdrop-blur-md border border-white/5"
                            />
                        ))}
                    </div>
                </div>
            ) : (
                /* Actual DayPicker Calendar */
                <DayPicker
                    mode="range"
                    numberOfMonths={monthsToShow}
                    selected={
                        formData.checkin && formData.checkout
                            ? { from: new Date(formData.checkin), to: new Date(formData.checkout) }
                            : undefined
                    }
                    onSelect={handleSelect}
                    disabled={finalDisabled}
                    className={`${font} bg-transparent text-white`}
                    modifiersClassNames={{
                        disabled: "bg-white/10 text-gray-400 opacity-50",
                        selected: "bg-white/20 text-white",
                        range_start: "bg-white/20 text-white rounded-l-full",
                        range_end: "bg-white/20 text-white rounded-r-full",
                        range_middle: "bg-white/20 text-white",
                    }}
                />
            )}

        </div>
    );
    
}
