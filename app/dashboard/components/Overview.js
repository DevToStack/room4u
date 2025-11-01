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
import { formatDate } from "@/lib/formateDate";

export default function Overview() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    async function getOverviewData() {
        try {
            setLoading(true);
            const [overviewRes, statsRes] = await Promise.all([
                fetch(`/api/dashboard/overview`, {
                    credentials: "include",
                    cache: "no-store",
                }),
                fetch(`/api/dashboard/stats`, {
                    credentials: "include",
                    cache: "no-store",
                }),
            ]);

            if (!overviewRes.ok || !statsRes.ok) {
                throw new Error("Unauthorized or failed to fetch data");
            }

            const overview = await overviewRes.json();
            const stats = await statsRes.json();

            setData({ ...overview, ...stats });
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
        <div className="space-y-6">
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((card, index) => (
                    <Card key={index} className="p-6 bg-gray-900 border-gray-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-400">{card.title}</p>
                                <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
                                <p className="text-sm text-gray-500 mt-1">{card.subtext}</p>
                            </div>
                            <div
                                className={`p-3 rounded-2xl ${card.color === "teal" ? "bg-teal-900/30" : "bg-gray-800"
                                    }`}
                            >
                                <FontAwesomeIcon
                                    icon={card.icon}
                                    className={`${card.color === "teal"
                                        ? "text-teal-400"
                                        : "text-gray-400"
                                        } text-lg`}
                                />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {quickActions.map((action, index) => (
                    <Card
                        key={index}
                        className="p-6 cursor-pointer bg-gray-900 border-gray-800 hover:bg-gray-800 transition-all duration-200"
                        onClick={action.action}
                    >
                        <div className="flex items-center">
                            <div
                                className={`p-3 rounded-2xl ${action.color === "teal" ? "bg-teal-900/30" : "bg-gray-800"
                                    } mr-4`}
                            >
                                <FontAwesomeIcon
                                    icon={action.icon}
                                    className={`${action.color === "teal"
                                        ? "text-teal-400"
                                        : "text-gray-400"
                                        } text-xl`}
                                />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">{action.title}</h3>
                                <p className="text-sm text-gray-400 mt-1">{action.description}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Upcoming Check-ins */}
            <Card className="p-6 bg-gray-900 border-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Upcoming Check-ins</h2>
                    <button className="text-teal-400 hover:text-teal-300 font-medium transition-colors">
                        See all →
                    </button>
                </div>

                {safeData.upcomingCheckins.length > 0 ? (
                    <div className="flex flex-wrap gap-6 justify-start">
                        {safeData.upcomingCheckins.map((booking, index) => (
                            <div
                                key={index}
                                className="relative flex flex-col justify-between
                                    p-4 bg-neutral-800 rounded-2xl border border-neutral-700
                                    flex-grow flex-shrink min-w-[260px] max-w-[320px]
                                    basis-[300px] transition-transform hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="flex items-center space-x-4 mt-3">
                                    <div>
                                        <h4 className="font-semibold text-white">
                                            {booking.apartment || "Unknown Apartment"}
                                        </h4>
                                        <p className="text-sm text-gray-400">
                                            {booking.guestName || "Unknown Guest"}
                                        </p>
                                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                            <span>Check-in: {formatDate(booking.checkIn)}</span>
                                            <span>•</span>
                                            <span>{booking.nights || 0} nights</span>
                                        </div>

                                        <div className="flex justify-between items-center space-x-4 w-full px-3 mt-2">
                                            <div className="flex items-center space-x-2">
                                                <FontAwesomeIcon
                                                    icon={faIndianRupeeSign}
                                                    className="text-teal-400"
                                                />
                                                <span className="font-semibold text-white">
                                                    {(booking.amount || 0).toLocaleString()}
                                                </span>
                                            </div>
                                            <button className="text-teal-400 hover:text-teal-300 text-sm font-medium transition-colors">
                                                See details
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <span
                                    className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium ${booking.paymentStatus === "paid"
                                        ? "bg-orange-900/30 text-orange-300"
                                        : "bg-teal-900/30 text-teal-300"
                                        }`}
                                >
                                    {booking.paymentStatus === "paid" ? "Due Soon" : "Confirmed"}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <FontAwesomeIcon icon={faHome} className="text-gray-500 text-xl" />
                        </div>
                        <p className="text-gray-400 font-medium">No upcoming check-ins</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Check-ins for the next 7 days will appear here
                        </p>
                    </div>
                )}
            </Card>
        </div>
    );
}
