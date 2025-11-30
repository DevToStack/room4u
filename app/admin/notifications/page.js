"use client";

import { useState, useEffect } from "react";
import NotificationList from "../components/notifications/NotificationList";
import NotificationFilters from "../components/notifications/Notifications";

export default function NotificationsPage() {
    const [filters, setFilters] = useState({
        booking_id: "",
        user_id: "",
        type: "",
        unread: false,
        start_date: "",
        end_date: "",
    });

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        setLoading(true);

        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, value);
        });

        const res = await fetch(`/api/admin/notifications?${params.toString()}`);
        const data = await res.json();
        setNotifications(data.notifications || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchNotifications();
    }, [filters]);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Admin Notifications</h1>

            <NotificationFilters filters={filters} setFilters={setFilters} />

            {loading ? (
                <div className="space-y-4 p-2">
                    {[...Array(5)].map((_, index) => (
                        <div
                            key={index}
                            className="flex items-start justify-between p-4 rounded-xl border border-neutral-700 backdrop-blur-xl shadow-md relative overflow-hidden mt-5 animate-pulse"
                        >
                            <div className="flex gap-4 flex-1">
                                {/* Skeleton Icon */}
                                <div className="w-11 h-11 flex items-center justify-center rounded-full bg-neutral-700">
                                </div>

                                {/* Skeleton Content */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-5 bg-neutral-700 rounded w-1/4"></div>
                                        <div className="h-4 bg-neutral-700 rounded w-12"></div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="h-4 bg-neutral-700 rounded w-1/2"></div>
                                    </div>

                                    
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <div className="flex gap-2 justify-end">
                                    <div className="w-24 h-8 bg-neutral-700 rounded-lg"></div>
                                    <div className="w-20 h-8 bg-neutral-700 rounded-lg"></div>
                                </div>
                                <div>
                                    <div className="h-3 bg-neutral-700 rounded w-full mt-2"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <NotificationList
                    notifications={notifications}
                    refresh={fetchNotifications}
                />
            )}
        </div>
    );
}
