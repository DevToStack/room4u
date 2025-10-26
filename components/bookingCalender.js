'use client';
import { useState, useEffect, useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

export default function BookingCalendar({
    formData,
    setFormData,
    disabledRanges,
    lockedRanges = [],
    size = 'medium', // ✅ "extraSmall" | "small" | "medium" | "large" | "extraLarge"
    background = 'white/10', // ✅ NEW: background color class
}) {
    const [monthsToShow, setMonthsToShow] = useState(1);
    console.log('Locked Ranges:', lockedRanges);
    // ✅ size map
    const sizeMap = useMemo(() => {
        return {
            extraSmall: { scale: 0.7, font: 'text-xs', width: 'max-w-[270px]' },
            small: { scale: 0.9, font: 'text-sm', width: 'max-w-[310px]' },
            medium: { scale: 1, font: 'text-base', width: 'max-w-[320px]' },
            large: { scale: 1.2, font: 'text-lg', width: 'max-w-[420px]' },
            extraLarge: { scale: 1.5, font: 'text-xl', width: 'max-w-[560px]' },
        };
    }, []);

    const { scale, font, width } = sizeMap[size] || sizeMap.medium;

    // screen responsive months
    useEffect(() => {
        const handleResize = () => {
            setMonthsToShow(1);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSelect = (range) => {
        if (!range?.from || !range?.to) return;

        const toDateStr = (date) => {
            const offset = date.getTimezoneOffset();
            const localDate = new Date(date.getTime() - offset * 60 * 1000);
            return localDate.toISOString().split('T')[0];
        };

        setFormData((prev) => ({
            ...prev,
            checkin: toDateStr(range.from),
            checkout: toDateStr(range.to),
        }));
    };

    // Combine disabled + locked ranges
    const allDisabled = [
        ...disabledRanges,
        ...lockedRanges.map(({ from, to }) => ({
            from: new Date(from),
            to: new Date(to),
        })),
    ];

    return (
        <div
            className={`border border-white/30 rounded-xl p-2 mx-auto shadow-md ${width} bg-${background}`}
            style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
        >
            <DayPicker
                mode="range"
                numberOfMonths={monthsToShow}
                selected={
                    formData.checkin && formData.checkout
                        ? { from: new Date(formData.checkin), to: new Date(formData.checkout) }
                        : undefined
                }
                onSelect={handleSelect}
                disabled={allDisabled} // ✅ include locked
                modifiers={{
                    locked: lockedRanges.map(r => ({ from: new Date(r.from), to: new Date(r.to) })),
                }}
                modifiersClassNames={{
                    disabled: 'bg-white/10 text-gray-400 opacity-50',
                    locked: 'bg-red-600/40 text-red-200',
                    selected: 'bg-white/20 text-white',
                    range_start: 'bg-white/20 text-white rounded-l-full',
                    range_end: 'bg-red-200 text-white rounded-r-full',
                    range_middle: 'bg-white/20 text-white',
                }}
                className={`${font} bg-transparent text-white`}
            />


        </div>
    );
}
