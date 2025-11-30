"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUserShield,
    faUserTie,
    faIdBadge,
    faClock,
    faBuilding,
    faClipboardList,
    faUsersCog,
    faChartBar,
    faCreditCard,
    faStar,
    faBell,
    faImage,
    faEye,
    faEdit,
    faTrash,
    faBan
} from "@fortawesome/free-solid-svg-icons";

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("/api/admin/profile", { credentials: "include" });
                const data = await res.json();

                if (!data.success) return;
                setProfile(data.user);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) return <div className="p-10 text-center text-neutral-200">Loading...</div>;
    if (!profile) return <div className="p-10 text-center text-neutral-200">Failed to load profile</div>;

    const isAdmin = profile.role === "admin";

    return (
        <div className="max-h-[90vh] overflow-y-auto bg-neutral-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="bg-neutral-800 p-6 shadow-xl rounded-xl flex items-center justify-between border border-neutral-700">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Management Profile</h1>
                        <p className="text-neutral-300">
                            Welcome back, <span className="font-semibold text-white">{profile.name}</span>
                        </p>
                    </div>

                    <span
                        className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 text-white ${isAdmin ? "bg-purple-600" : "bg-blue-600"
                            }`}
                    >
                        <FontAwesomeIcon icon={isAdmin ? faUserShield : faUserTie} />
                        {profile.role.toUpperCase()}
                    </span>
                </div>

                {/* User info card */}
                <div className="bg-neutral-800 p-6 shadow-xl rounded-xl grid md:grid-cols-2 gap-6 border border-neutral-700">
                    <div>
                        <h2 className="text-lg font-semibold mb-4 text-white">User Information</h2>
                        <div className="space-y-3 text-neutral-300">
                            <p><b className="text-neutral-100">Name:</b> {profile.name}</p>
                            <p><b className="text-neutral-100">Email:</b> {profile.email}</p>
                            <p><b className="text-neutral-100">Joined:</b> {new Date(profile.created_at).toLocaleDateString()}</p>
                            <p><b className="text-neutral-100">Employee ID:</b> {profile.id ?? "N/A"}</p>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-4 text-white">System Information</h2>
                        <div className="space-y-3 text-neutral-300">
                            <p className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faClock} className="text-neutral-100" />
                                Last Login: {profile.last_login || "Recently"}
                            </p>
                            <p className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faIdBadge} className="text-neutral-100" />
                                Role: {profile.role}
                            </p>
                            <p className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faBuilding} className="text-neutral-100" />
                                Department: {profile.department ?? "General"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Management Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Admin Only Cards */}
                    {isAdmin && (
                        <>
                            <ManagementCard
                                title="Dashboard & Analytics"
                                icon={faChartBar}
                                color="bg-green-600"
                                permissions={["View all statistics", "Revenue tracking", "Performance metrics"]}
                                onClick={() => router.push('/admin')}
                            />
                            <ManagementCard
                                title="User Management"
                                icon={faUsersCog}
                                color="bg-purple-600"
                                permissions={["Create users", "Edit permissions", "Delete users"]}
                                onClick={() => router.push('/admin/users')}
                            />
                            <ManagementCard
                                title="Transaction Tracking"
                                icon={faCreditCard}
                                color="bg-emerald-600"
                                permissions={["View all transactions", "Export records", "Financial reports"]}
                                onClick={() => router.push('/admin/payments')}
                            />
                            <ManagementCard
                                title="Gallery Management"
                                icon={faImage}
                                color="bg-indigo-600"
                                permissions={["Upload photos", "Edit gallery", "Delete images"]}
                                onClick={() => router.push('/admin/gallery')}
                            />
                            <ManagementCard
                                title="Apartment Management"
                                icon={faBuilding}
                                color="bg-blue-600"
                                permissions={["Add apartments", "Edit listings", "Manage availability"]}
                                onClick={() => router.push('/admin/apartments')}
                            />
                            <ManagementCard
                                title="Feedback & Reviews"
                                icon={faStar}
                                color="bg-amber-600"
                                permissions={["View all feedback", "Respond to reviews", "Delete content"]}
                                onClick={() => router.push('/admin/feedback-reviews')}
                            />
                        </>
                    )}

                    {/* Shared Cards - Different permissions based on role */}
                    <ManagementCard
                        title="Booking Management"
                        icon={faClipboardList}
                        color={isAdmin ? "bg-red-600" : "bg-blue-600"}
                        permissions={isAdmin ?
                            ["View all bookings", "Edit bookings", "Cancel bookings"] :
                            ["View assigned bookings", "Manage bookings", "No delete access"]
                        }
                        onClick={() => router.push('/admin/bookings')}
                    />

                    {/* Staff Only Cards */}
                    {!isAdmin && (
                        <>
                            <ManagementCard
                                title="User Information"
                                icon={faUserTie}
                                color="bg-gray-600"
                                permissions={["View user details", "Read-only access", "No edit/delete"]}
                                onClick={() => router.push('/admin/users')}
                            />
                            <ManagementCard
                                title="Notifications"
                                icon={faBell}
                                color="bg-orange-600"
                                permissions={["View notifications", "Mark as read", "Stay updated"]}
                                onClick={() => router.push('/admin/notifications')}
                            />
                            <ManagementCard
                                title="Feedback Management"
                                icon={faStar}
                                color="bg-amber-600"
                                permissions={["View feedback", "Manage responses", "Delete reviews"]}
                                onClick={() => router.push('/admin/feedback-reviews')}
                            />
                            <ManagementCard
                                title="Gallery View"
                                icon={faImage}
                                color="bg-gray-600"
                                permissions={["View photos only", "Read permission", "No edit/delete"]}
                                onClick={() => router.push('/admin/gallery')}
                            />
                        </>
                    )}
                </div>

                {/* Permissions Summary */}
                <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
                    <h2 className="text-lg font-semibold mb-4 text-white">Role Permissions Summary</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-medium text-green-400 mb-2">Allowed Actions</h3>
                            <ul className="text-sm text-neutral-300 space-y-1">
                                {isAdmin ? (
                                    <>
                                        <li className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faEdit} className="text-green-400 text-xs" />
                                            Full system access
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faTrash} className="text-green-400 text-xs" />
                                            Delete any content
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faUserShield} className="text-green-400 text-xs" />
                                            Manage staff permissions
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        <li className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faEye} className="text-green-400 text-xs" />
                                            View user information
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faEdit} className="text-green-400 text-xs" />
                                            Manage bookings (no delete)
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faTrash} className="text-green-400 text-xs" />
                                            Delete feedback/reviews
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-medium text-red-400 mb-2">Restricted Actions</h3>
                            <ul className="text-sm text-neutral-300 space-y-1">
                                {isAdmin ? (
                                    <li className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faBan} className="text-red-400 text-xs" />
                                        No restrictions - Full access
                                    </li>
                                ) : (
                                    <>
                                        <li className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faBan} className="text-red-400 text-xs" />
                                            Cannot edit/delete users
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faBan} className="text-red-400 text-xs" />
                                            Cannot view transactions
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <FontAwesomeIcon icon={faBan} className="text-red-400 text-xs" />
                                            Cannot edit/delete gallery
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ManagementCard({ title, icon, color, permissions, onClick }) {
    return (
        <div
            className="bg-neutral-800 p-6 shadow-xl rounded-xl border border-neutral-700 hover:border-neutral-500 transition-all duration-200 cursor-pointer hover:transform hover:scale-[1.02]"
            onClick={onClick}
        >
            <div className={`w-12 h-12 flex items-center justify-center rounded-lg text-white ${color}`}>
                <FontAwesomeIcon icon={icon} className="text-lg" />
            </div>
            <h3 className="mt-4 font-semibold text-lg text-white">{title}</h3>
            <div className="mt-3 space-y-2">
                {permissions.map((permission, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-neutral-400">
                        <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                        {permission}
                    </div>
                ))}
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-700">
                <button className="text-sm text-blue-400 hover:text-blue-300 font-medium">
                    Access Module →
                </button>
            </div>
        </div>
    );
}