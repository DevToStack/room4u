"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCalendarCheck,
    faIndianRupeeSign,
    faClock,
    faUser,
    faHome,
    faPhone,
    faPlus,
    faArrowRight,
    faCalendarDays,
    faBed,
    faUsers,
    faMoneyBillWave,
    faChevronRight
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
            checkIn: "",
            total: 0
        },
        nextBooking: data?.nextBooking || {
            apartment: "No upcoming bookings",
            daysUntil: null,
            checkIn: ""
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
            iconColor: "text-teal-400",
            bgColor: "bg-gradient-to-br from-neutral-900 to-neutral-950",
            borderColor: "border-teal-500/20",
            iconBg: "bg-teal-500/10"
        },
        {
            title: "Total Revenue",
            value: `₹${safeData.totalPayments.toLocaleString()}`,
            subtext: `Paid: ₹${safeData.paidPayments.toLocaleString()} • Refunded: ₹${safeData.refundedPayments.toLocaleString()}`,
            icon: faIndianRupeeSign,
            iconColor: "text-blue-400",
            bgColor: "bg-gradient-to-br from-neutral-900 to-neutral-950",
            borderColor: "border-blue-500/20",
            iconBg: "bg-blue-500/10"
        },
        {
            title: "Last Booking",
            value: safeData.lastBooking.id ? `#${safeData.lastBooking.id}` : "No bookings",
            subtext: `${safeData.lastBooking.apartment} • ${safeData.lastBooking.status}`,
            icon: faClock,
            iconColor: "text-violet-400",
            bgColor: "bg-gradient-to-br from-neutral-900 to-neutral-950",
            borderColor: "border-violet-500/20",
            iconBg: "bg-violet-500/10"
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
            iconColor: "text-rose-400",
            bgColor: "bg-gradient-to-br from-neutral-900 to-neutral-950",
            borderColor: "border-rose-500/20",
            iconBg: "bg-rose-500/10"
        },
    ];

    const quickActions = [
        {
            title: "New Booking",
            description: "Create a new booking",
            icon: faPlus,
            color: "bg-gradient-to-r from-teal-500 to-emerald-500",
            iconBg: "bg-teal-500/10",
            borderColor: "border-teal-500/20",
            bgColor: "bg-gradient-to-br from-neutral-900 to-neutral-950",
        },
        {
            title: "View All Bookings",
            description: "Manage all bookings",
            icon: faCalendarDays,
            color: "bg-gradient-to-r from-blue-500 to-cyan-500",
            iconBg: "bg-blue-500/10",
            borderColor: "border-blue-500/20",
            bgColor: "bg-gradient-to-br from-neutral-900 to-neutral-950",
        },
        {
            title: "Contact Support",
            description: "Get help quickly",
            icon: faPhone,
            color: "bg-gradient-to-r from-violet-500 to-purple-500",
            iconBg: "bg-violet-500/10",
            borderColor: "border-violet-500/20",
            bgColor: "bg-gradient-to-br from-neutral-900 to-neutral-950",
        },
    ];

    // Skeleton Loaders - Updated to match actual layout
    const StatsSkeleton = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((card, index) => (
                <Card
                    key={index}
                    className={`p-6 border rounded-2xl animate-pulse ${card.bgColor} ${card.borderColor}`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${card.iconBg}`}></div>
                        <div className="flex-1">
                            <div className={`h-4 rounded w-24 mb-3 bg-neutral-800`}></div>
                            <div className={`h-7 rounded w-20 mb-3 bg-neutral-800`}></div>
                            <div className={`h-3 rounded w-32 bg-neutral-800`}></div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );

    const QuickActionsSkeleton = () => (
        <div className="space-y-4">
            {quickActions.map((action, index) => (
                <div
                    key={index}
                    className={`p-5 border rounded-2xl animate-pulse ${action.bgColor} ${action.borderColor}`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl ${action.iconBg}`}></div>
                            <div className="flex-1">
                                <div className={`h-5 rounded w-32 mb-2 bg-neutral-800`}></div>
                                <div className={`h-4 rounded w-40 bg-neutral-800`}></div>
                            </div>
                        </div>
                        <div className={`w-5 h-5 rounded bg-neutral-800`}></div>
                    </div>
                </div>
            ))}
        </div>
    );

    const RecentBookingsSkeleton = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Last Booking Skeleton */}
            <Card className="p-6 bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl animate-pulse">
                <div className="flex items-center justify-between mb-6">
                    <div className="h-6 w-32 bg-neutral-800 rounded"></div>
                    <div className="h-6 w-16 bg-neutral-800 rounded-full"></div>
                </div>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="h-4 w-16 bg-neutral-800 rounded"></div>
                        <div className="h-6 w-40 bg-neutral-800 rounded"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <div className="h-3 w-20 bg-neutral-800 rounded"></div>
                            <div className="h-4 w-24 bg-neutral-800 rounded"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 w-16 bg-neutral-800 rounded"></div>
                            <div className="h-4 w-20 bg-neutral-800 rounded"></div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Next Booking Skeleton */}
            <Card className="p-6 bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl animate-pulse">
                <div className="flex items-center justify-between mb-6">
                    <div className="h-6 w-32 bg-neutral-800 rounded"></div>
                    <div className="h-6 w-20 bg-neutral-800 rounded-full"></div>
                </div>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="h-4 w-16 bg-neutral-800 rounded"></div>
                        <div className="h-6 w-40 bg-neutral-800 rounded"></div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 w-20 bg-neutral-800 rounded"></div>
                        <div className="h-6 w-32 bg-neutral-800 rounded"></div>
                        <div className="h-12 w-full bg-neutral-800 rounded-xl"></div>
                    </div>
                </div>
            </Card>
        </div>
    );

    const UpcomingBookingsSkeleton = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Card
                        key={i}
                        className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-5 animate-pulse"
                    >
                        <div className="absolute top-3 right-3 w-16 h-6 bg-neutral-800 rounded-full"></div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="h-6 w-32 bg-neutral-800 rounded"></div>
                                <div className="h-4 w-24 bg-neutral-800 rounded"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <div className="h-3 w-16 bg-neutral-800 rounded"></div>
                                    <div className="h-4 w-20 bg-neutral-800 rounded"></div>
                                </div>
                                <div className="space-y-1">
                                    <div className="h-3 w-12 bg-neutral-800 rounded"></div>
                                    <div className="h-4 w-8 bg-neutral-800 rounded"></div>
                                </div>
                                <div className="space-y-1">
                                    <div className="h-3 w-14 bg-neutral-800 rounded"></div>
                                    <div className="h-4 w-6 bg-neutral-800 rounded"></div>
                                </div>
                                <div className="space-y-1">
                                    <div className="h-3 w-12 bg-neutral-800 rounded"></div>
                                    <div className="h-4 w-16 bg-neutral-800 rounded"></div>
                                </div>
                            </div>
                            <div className="h-10 w-full bg-neutral-800 rounded-xl"></div>
                            <div className="h-10 w-full bg-neutral-800 rounded-xl"></div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="p-4 bg-gradient-to-br from-neutral-900 to-neutral-950 border border-red-500/20 rounded-2xl mb-4">
                    <p className="text-red-400 font-medium">Failed to load dashboard</p>
                </div>
                <button
                    onClick={getOverviewData}
                    className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl text-white transition-all"
                >
                    Retry
                </button>
            </div>
        );
    }
    console.log(safeData.nextBooking);
    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-gradient-to-br from-neutral-950 to-black">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    Dashboard Overview
                </h1>
                <p className="text-neutral-500">
                    Welcome back! Here's what's happening with your properties.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Overview</h2>
                {loading ? (
                    <StatsSkeleton />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {statsCards.map((card, index) => (
                            <Card
                                key={index}
                                className={`group p-6 border rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${card.bgColor} ${card.borderColor}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${card.iconBg} border ${card.borderColor}`}>
                                        <FontAwesomeIcon
                                            icon={card.icon}
                                            className={`text-xl ${card.iconColor}`}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm text-neutral-500 font-medium">{card.title}</p>
                                        <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
                                        <p className="text-xs text-neutral-500 mt-2">{card.subtext}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions & Recent Bookings */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Quick Actions */}
                <div className="lg:col-span-1">
                    <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
                    {loading ? (
                        <QuickActionsSkeleton />
                    ) : (
                        <div className="space-y-4">
                            {quickActions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={action.action}
                                    className={`w-full p-5 border rounded-2xl text-left transition-all duration-300 group hover:scale-[1.02] ${action.bgColor} ${action.borderColor}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${action.iconBg} border ${action.borderColor}`}>
                                                <FontAwesomeIcon
                                                    icon={action.icon}
                                                    className="text-white"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white">{action.title}</p>
                                                <p className="text-sm text-neutral-500">{action.description}</p>
                                            </div>
                                        </div>
                                        <FontAwesomeIcon
                                            icon={faArrowRight}
                                            className="text-neutral-600 group-hover:text-white transition-colors"
                                        />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Bookings */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-semibold text-white mb-4">Recent Bookings</h2>
                    {loading ? (
                        <RecentBookingsSkeleton />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Last Booking */}
                            <Card className="p-6 bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-semibold text-white">Last Booking</h3>
                                    <span className="px-3 py-1 text-xs bg-neutral-800 border border-neutral-700 rounded-full text-neutral-400">
                                        Latest
                                    </span>
                                </div>
                                {!safeData.lastBooking.id ? (
                                    <div className="text-center py-8">
                                        <p className="text-neutral-500">No bookings yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-neutral-500">Apartment</p>
                                                <p className="font-semibold text-white">{safeData.lastBooking.apartment}</p>
                                            </div>
                                            <span className={`px-3 py-1 text-xs rounded-full ${safeData.lastBooking.status === 'confirmed'
                                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                }`}>
                                                {safeData.lastBooking.status}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-xs text-neutral-500">Check-in</p>
                                                <p className="text-sm text-white">{safeData.lastBooking.checkIn}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-neutral-500">Total</p>
                                                <p className="text-sm text-white">₹{safeData.lastBooking.total}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Card>

                            {/* Next Booking */}
                            <Card className="p-6 bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-semibold text-white">Next CheckIn</h3>
                                    <span className="px-3 py-1 text-xs bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400">
                                        Upcoming
                                    </span>
                                </div>
                                    {safeData.nextBooking.daysUntil === null ? (
                                    <div className="text-center py-8">
                                        <p className="text-neutral-500">No upcoming bookings</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-sm text-neutral-500">Apartment</p>
                                            <p className="font-semibold text-white">{safeData.nextBooking.apartment}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-neutral-500">Check-in</p>
                                            <p className="text-lg font-bold text-white mb-2">{safeData.nextBooking.checkIn}</p>
                                            <div className="px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl">
                                                <p className="text-sm font-semibold text-blue-400">
                                                    {safeData.nextBooking.daysUntil > 1
                                                        ? `${safeData.nextBooking.daysUntil} days remaining`
                                                        : safeData.nextBooking.daysUntil === 1
                                                            ? "1 day remaining"
                                                            : "Today"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>
                    )}
                </div>
            </div>

            {/* Upcoming Check-ins */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-white">Upcoming Check-ins</h2>
                        <p className="text-sm text-neutral-500">Confirmed bookings arriving soon</p>
                    </div>
                    {!loading && data?.bookings?.filter(b => b.status === "confirmed").length > 0 && (
                        <button className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
                            View all <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                        </button>
                    )}
                </div>

                {loading ? (
                    <UpcomingBookingsSkeleton />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {data?.bookings
                            ?.filter((b) => b.status === "confirmed")
                            .map((b) => {
                                const today = new Date().setHours(0, 0, 0, 0);
                                const checkInDate = new Date(b.checkIn).setHours(0, 0, 0, 0);
                                const diffMs = checkInDate - today;
                                const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

                                let countdown;
                                if (days > 1) countdown = `${days} days remaining`;
                                else if (days === 1) countdown = "1 day remaining";
                                else if (days === 0) countdown = "Today";
                                else countdown = "Past due";

                                return (
                                    <Card
                                        key={b.id}
                                        className="group relative overflow-hidden bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-5 hover:border-neutral-700 hover:shadow-xl transition-all duration-300"
                                    >
                                        {/* Status Badge */}
                                        <div className={`absolute top-3 right-3 px-2 py-1 text-xs rounded-full ${b.paymentStatus === 'paid'
                                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}>
                                            {b.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                                        </div>

                                        <div className="space-y-4">
                                            {/* Apartment Info */}
                                            <div>
                                                <p className="font-bold text-white text-lg mb-1">{b.apartment}</p>
                                                <p className="text-sm text-neutral-500">{b.guestName}</p>
                                            </div>

                                            {/* Info Grid */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-neutral-500">
                                                        <FontAwesomeIcon icon={faCalendarDays} className="text-xs" />
                                                        <span className="text-xs">Check-in</span>
                                                    </div>
                                                    <p className="text-sm font-medium text-white">{b.checkIn}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-neutral-500">
                                                        <FontAwesomeIcon icon={faBed} className="text-xs" />
                                                        <span className="text-xs">Nights</span>
                                                    </div>
                                                    <p className="text-sm font-medium text-white">{b.nights}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-neutral-500">
                                                        <FontAwesomeIcon icon={faUsers} className="text-xs" />
                                                        <span className="text-xs">Guests</span>
                                                    </div>
                                                    <p className="text-sm font-medium text-white">{b.guests}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-neutral-500">
                                                        <FontAwesomeIcon icon={faMoneyBillWave} className="text-xs" />
                                                        <span className="text-xs">Total</span>
                                                    </div>
                                                    <p className="text-sm font-medium text-white">₹{b.total}</p>
                                                </div>
                                            </div>

                                            {/* Countdown */}
                                            <div className="px-3 py-2 bg-neutral-800/50 border border-neutral-700 rounded-xl">
                                                <p className={`text-sm font-semibold ${days === 0
                                                    ? 'text-amber-400'
                                                    : days < 0
                                                        ? 'text-red-400'
                                                        : 'text-blue-400'
                                                    }`}>
                                                    ⏳ {countdown}
                                                </p>
                                            </div>

                                            {/* View Button */}
                                            <button
                                                onClick={() => openModal(b)}
                                                className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl text-white font-medium transition-all duration-300 group-hover:border-neutral-600"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </Card>
                                );
                            })}

                        {data?.bookings?.filter(b => b.status === "confirmed").length === 0 && (
                            <div className="col-span-full text-center py-12">
                                <div className="p-6 bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl inline-block">
                                    <p className="text-neutral-500">No upcoming check-ins</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

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