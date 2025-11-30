"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCalendarCheck,
    faIndianRupeeSign,
    faClock,
    faUser,
    faHome,
    faPhone
} from "@fortawesome/free-solid-svg-icons";
import Card from "./Card";
import BookingInfoModal from "./BookingInfoModal";

export default function Overview() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    async function getOverviewData() {
        try {
            setLoading(true);
            const [overviewRes, statsRes, upBookings] = await Promise.all([
                fetch(`/api/dashboard/overview`, {
                    credentials: "include",
                    cache: "no-store",
                }),
                fetch(`/api/dashboard/stats`, {
                    credentials: "include",
                    cache: "no-store",
                }),
                fetch(`/api/dashboard/bookings`, {
                    credentials: "include",
                    cache: "no-store",
                }),
            ]);

            if (!overviewRes.ok || !statsRes.ok) {
                throw new Error("Unauthorized or failed to fetch data");
            }

            const overview = await overviewRes.json();
            const stats = await statsRes.json();
            const bookings = await upBookings.json();
            setData({ ...overview, ...stats, ...bookings });
        } catch (err) {
            console.error("Fetch error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getOverviewData();
    }, []);

    if (loading) {
        return (
            <div className="h-screen text-white p-6 flex items-center justify-center"
                style={{ maxHeight: 'calc(100vh - 96px)' }}
            >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64 text-red-400">
                Failed to load: {error}
            </div>
        );
    }
    const openModal = (booking) => {
        setSelectedBooking(booking);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedBooking(null);
        setIsModalOpen(false);
    };

    const safeData = {
        totalBookings: data?.totalBookings || 0,
        totalPayments: data?.totalPayments || 0,
        paidPayments: data?.paidPayments || 0,
        refundedPayments: data?.refundedPayments || 0,
        lastBooking: data?.lastBooking || {
            id: null,
            apartment: "No bookings yet",
            status: "N/A",
        },
        nextBooking: data?.nextBooking || {
            apartment: "No upcoming bookings",
            daysUntil: null,
        },
        upcomingCheckins: Array.isArray(data?.upcomingCheckins)
            ? data.upcomingCheckins
            : [],
    };

    const statsCards = [
        {
            title: "Total Bookings",
            value: safeData.totalBookings,
            subtext: "Last 30 days",
            icon: faCalendarCheck,
            color: "teal",
        },
        {
            title: "Total Payments",
            value: `₹${safeData.totalPayments.toLocaleString()}`,
            subtext: `Paid: ₹${safeData.paidPayments.toLocaleString()} • Refunded: ₹${safeData.refundedPayments.toLocaleString()}`,
            icon: faIndianRupeeSign,
            color: "teal",
        },
        {
            title: "Last Booking",
            value: safeData.lastBooking.id ? `#${safeData.lastBooking.id}` : "No bookings",
            subtext: `${safeData.lastBooking.apartment} • ${safeData.lastBooking.status}`,
            icon: faClock,
            color: "gray",
        },
        {
            title: "Next Booking",
            value:
                safeData.nextBooking.daysUntil > 0
                    ? `In ${safeData.nextBooking.daysUntil} days`
                    : safeData.nextBooking.daysUntil === 0
                        ? "Today"
                        : "No upcoming",
            subtext: safeData.nextBooking.apartment,
            icon: faUser,
            color: "gray",
        },
    ];

    const quickActions = [
        {
            title: "New Booking",
            description: "Create a new booking",
            icon: faCalendarCheck,
            color: "teal",
            action: () => console.log("New booking"),
        },
        {
            title: "Manage Bookings",
            description: "View all bookings",
            icon: faHome,
            color: "gray",
            action: () => console.log("Manage bookings"),
        },
        {
            title: "Contact Support",
            description: "Get help quickly",
            icon: faPhone,
            color: "teal",
            action: () => console.log("Contact support"),
        },
    ];

    return (
        <div className="space-y-10">

            {/* 🌈 GEN-Z Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((card, index) => (
                    <Card
                        key={index}
                        className="p-6 bg-neutral-900 border border-neutral-700 rounded-3xl shadow-[0_0_20px_-5px_rgba(0,0,0,0.6)] hover:shadow-[0_0_30px_-5px_rgba(0,0,0,0.7)] transition-all duration-300"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs uppercase tracking-wider text-neutral-500">{card.title}</p>
                                <p className="text-4xl font-extrabold text-white mt-3">{card.value}</p>
                                <p className="text-xs text-neutral-500 mt-1">{card.subtext}</p>
                            </div>

                            <div className={`p-3 rounded-2xl bg-neutral-700/60 border border-neutral-600`}>
                                <FontAwesomeIcon
                                    icon={card.icon}
                                    className={`text-xl text-teal-400`}
                                />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
            {/* 🏨 Last & Next Booking */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Last Booking */}
                <Card className="p-6 bg-neutral-900 border border-neutral-700 rounded-3xl hover:border-neutral-600 transition-all">
                    <h2 className="text-lg font-bold tracking-wide text-white mb-5">Last Booking</h2>

                    <div className="bg-neutral-800/60 backdrop-blur-lg rounded-2xl p-5 border border-neutral-700">
                        <p className="text-neutral-500 text-sm">Apartment</p>
                        <p className="text-xl font-semibold text-white mt-1">{data.lastBooking.apartment}</p>

                        <div className="mt-5 space-y-2 text-neutral-300 text-sm">
                            <p><b>Status:</b> {data.lastBooking.status}</p>
                            <p><b>Guests:</b> {data.lastBooking.guests}</p>
                            <p><b>Check-in:</b> {data.lastBooking.checkIn}</p>
                            <p><b>Check-out:</b> {data.lastBooking.checkOut}</p>
                            <p><b>Total:</b> ₹{data.lastBooking.amount}</p>
                        </div>
                    </div>
                </Card>

                {/* Next Booking */}
                <Card className="p-6 bg-neutral-900 border border-neutral-700 rounded-3xl hover:border-neutral-600 transition-all">
                    <h2 className="text-lg font-bold tracking-wide text-white mb-5">Next Booking</h2>

                    <div className="bg-neutral-800/60 backdrop-blur-lg rounded-2xl p-5 border border-neutral-700">
                        <p className="text-neutral-500 text-sm">Apartment</p>
                        <p className="text-xl font-semibold text-white mt-1">{data.nextBooking.apartment}</p>

                        <div className="mt-5 space-y-2 text-neutral-300 text-sm">
                            <p><b>Check-in:</b> {data.nextBooking.checkIn}</p>

                            <p className="font-semibold text-teal-400 tracking-wide">
                                {data.nextBooking.daysUntil > 1
                                    ? `${data.nextBooking.daysUntil} days remaining`
                                    : data.nextBooking.daysUntil === 1
                                        ? "1 day remaining"
                                        : "Today"}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* 📅 Upcoming Confirmed Check-ins */}
            <Card className="p-6 bg-neutral-900 border border-neutral-700 rounded-3xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white tracking-wide">Upcoming Check-ins</h2>
                </div>
                <div className="grid grid-cols-5 max-sm:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {data.bookings
                        .filter((b) => b.status === "confirmed")
                        .map((b) => {
                            const today = new Date().setHours(0, 0, 0, 0);
                            const checkInDate = new Date(b.checkIn).setHours(0, 0, 0, 0);
                            const diffMs = checkInDate - today;

                            const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                            const hours = Math.floor(diffMs / (1000 * 60 * 60));

                            let countdown;
                            if (days > 1) countdown = `${days} days remaining`;
                            else if (days === 1) countdown = "1 day remaining";
                            else if (days === 0) countdown = "Today";
                            else countdown = `${Math.abs(hours)} hours remaining`;

                            return (
                                <div
                                    key={b.id}
                                    className="
                                    relative rounded-3xl
                                    bg-neutral-900 border border-neutral-700
                                    p-6 flex flex-col gap-4
                                    shadow-[0_0_0_0_rgba(0,0,0,0.0)]
                                    hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.4)]
                                    hover:-translate-y-1
                                    transition-all duration-300
    "
                                >
                                    {/* Floating circular icon */}
                                    <div className="absolute -top-4 right-4 w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center border border-teal-500/30 backdrop-blur-sm">
                                        <span className="text-teal-300 text-xs font-semibold">#{b.id}</span>
                                    </div>
                                    {b.paymentStatus === 'paid' && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 h-10 rounded-full bg-teal-500/10 flex items-center justify-center border border-teal-500/30 backdrop-blur-sm">
                                            <span className="text-teal-300 text-xs font-semibold">Completed</span>
                                        </div>)
                                    }
                                    {b.paymentStatus !== 'paid' && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30 backdrop-blur-sm">
                                            <span className="text-red-300 text-xs font-semibold">Incomplete</span>
                                        </div>
                                    )}

                                    {/* Apartment + Status */}
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-white font-bold text-lg">{b.apartment}</p>
                                            <p className="text-neutral-500 text-xs mt-1">{b.guestName}</p>
                                        </div>

                                        <span
                                            className="
                                            px-3 py-1 text-xs rounded-full 
                                            bg-neutral-800 border border-neutral-700 
                                            text-teal-300 font-medium
                                            shadow-[inset_0_0_8px_rgba(0,150,150,0.3)]
            "
                                        >
                                            Confirmed
                                        </span>
                                    </div>

                                    {/* Info blocks */}
                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                        <div className="bg-neutral-800/50 p-3 rounded-xl border border-neutral-700 space-y-1">
                                            <p className="text-neutral-500 text-xs">Check-in</p>
                                            <p className="text-white font-semibold max-sm:text-xs">{b.checkIn}</p>
                                        </div>

                                        <div className="bg-neutral-800/50 p-3 rounded-xl border border-neutral-700 space-y-1">
                                            <p className="text-neutral-500 text-xs">Nights</p>
                                            <p className="text-white font-semibold max-sm:text-xs">{b.nights}</p>
                                        </div>

                                        <div className="bg-neutral-800/50 p-3 rounded-xl border border-neutral-700 space-y-1">
                                            <p className="text-neutral-500 text-xs">Guests</p>
                                            <p className="text-white font-semibold max-sm:text-xs ">{b.guests}</p>
                                        </div>

                                        <div className="bg-neutral-800/50 p-3 rounded-xl border border-neutral-700 space-y-1">
                                            <p className="text-neutral-500 text-xs">Total</p>
                                            <p className="text-white font-semibold max-sm:text-xs">₹{b.total}</p>
                                        </div>
                                    </div>

                                    {/* Countdown */}
                                    <p className="text-teal-400 text-sm font-semibold mt-2">
                                        ⏳ {countdown}
                                    </p>

                                    {/* Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();   // prevents card click issues
                                            openModal(b);
                                        }}
                                        className="
                                            mt-4 w-full py-2.5 
                                            rounded-xl text-sm font-medium 
                                            bg-neutral-800 hover:bg-neutral-700 
                                            text-white transition
                                        "
                                    >
                                        View Details
                                    </button>

                                </div>

                            );
                        })}
                </div>


            </Card>
            <BookingInfoModal
                booking={selectedBooking}
                isOpen={isModalOpen}
                onClose={closeModal}
                onCancel={() => console.log("Cancel Booking")}
                onDelete={() => console.log("Delete Booking")}
            />

        </div>
    );
    
    
}
