'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    faBookJournalWhills,
    faStar,
    faBuilding,
    faPeopleGroup,
    faShield,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export default function NavBar({ activeTab, setActiveTab }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profile, setProfile] = useState(null);
    const router = useRouter();

    useEffect(() => {
        router.prefetch("/signin");
        router.prefetch("/profile");

        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/auth/me", {
                    method: "GET",
                    credentials: "include", // ✅ send HttpOnly cookies automatically
                    cache: "no-store",
                });

                if (res.status === 401) {
                    setProfile(null);
                    router.push("/");
                    return;
                }

                if (!res.ok) {
                    console.error(`Profile fetch failed: ${res.status}`);
                    setProfile(null);
                    return;
                }

                const data = await res.json();

                if (data) {
                    setProfile(data);
                } else {
                    setProfile(null);
                    router.push("/");
                }
            } catch (err) {
                console.error("Profile fetch error:", err);
                setProfile(null);
                router.push("/");
            }
        };

        fetchProfile();
    }, [router]);

    const toggleSidebar = () => setSidebarOpen((prev) => !prev);

    const tabRouteMap = {
        home: "/",
        learn: "/#how-it-works",
        choice: "/#features",
        contact: "/#contact",
        about: "/#about",
        review: "/#reviews",
        book: "/terms",
        profile: "/profile",
        login: "/signin",
    };

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        const route = tabRouteMap[tabId] || "/";
        router.push(route);
    };

    const tabs = [
        { id: "home", label: "Home" },
        { id: "learn", label: "How It Works" },
        { id: "choice", label: "Why Choose Us" },
        { id: "contact", label: "Contact Us" },
        { id: "about", label: "About Us" },
        { id: "review", label: "Reviews" },
        { id: "book", label: "Privacy Policy" },
    ];

    const sidebarMenu = [
        { href: "/#how-it-works", icon: faBookJournalWhills, label: "How It Works" },
        { href: "/#features", icon: faStar, label: "Why Choose Us" },
        { href: "/#contact", icon: faBuilding, label: "Contact Us" },
        { href: "/#about", icon: faPeopleGroup, label: "About Us" },
        { href: "/#reviews", icon: faStar, label: "Reviews" },
        { href: "/terms", icon: faShield, label: "Privacy Policy" },
    ];

    return (
        <>
            {/* Top Nav */}
            <nav className="fixed top-0 left-0 w-full z-50 bg-black border-b border-white/20 shadow-lg">
                <div className="w-full max-w-[1500px] mx-auto px-3 py-2 flex justify-between items-center">
                    {/* Logo + Hamburger */}
                    <div className="flex items-center gap-3">
                        <div
                            onClick={toggleSidebar}
                            className="flex flex-col justify-center gap-[5px] cursor-pointer group lg:hidden"
                        >
                            <span className="w-7 h-[3px] bg-white rounded-full group-hover:scale-x-125 transition-transform duration-300"></span>
                            <span className="w-5 h-[3px] bg-white rounded-full group-hover:scale-x-110 transition-transform duration-300"></span>
                            <span className="w-6 h-[3px] bg-white rounded-full group-hover:scale-x-125 transition-transform duration-300"></span>
                        </div>
                        <h1 className="text-white text-2xl font-bold tracking-tight">Rooms4u</h1>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4 max-lg:hidden">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabClick(tab.id)}
                                    className={`transition-all duration-300 ${isActive
                                        ? "text-green-300 underline"
                                        : "text-white hover:text-green-300 cursor-pointer"
                                        }`}
                                >
                                    <span className="text-sm">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Auth Buttons */}
                    {!profile ? (
                        <div className="flex gap-2 min-lg:gap-3">
                            <button
                                onClick={() => router.push("/register")}
                                className="rounded-full p-2 px-3 text-gray-100 hover:text-gray-200 bg-white/20 hover:bg-white/10 cursor-pointer"
                            >
                                Sign Up
                            </button>
                            <button
                                onClick={() => router.push("/signin")}
                                className="rounded-full p-2 px-4 text-gray-100 hover:text-gray-200 bg-white/20 hover:bg-white/10 cursor-pointer"
                            >
                                Login
                            </button>
                        </div>
                    ) : (
                        <div
                            className="text-gray-100 flex items-center rounded-full sm:pr-3 bg-white/10 gap-2 cursor-pointer"
                            onClick={() => router.push("/profile")}
                        >
                            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-xl font-bold p-5">
                                {profile?.name?.charAt(0)}
                            </div>
                                <div className="max-sm:hidden min-w-[60px]">{profile?.name}</div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full bg-black text-white z-50 transition-transform duration-500
                w-80 p-3
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div className="flex justify-between items-center p-1">
                    <h2 className="text-2xl font-extrabold">Rooms4u</h2>
                    <button onClick={toggleSidebar} className="text-3xl focus:outline-none">
                        &times;
                    </button>
                </div>

                <ul className="mt-1 space-y-2 p-2">
                    {sidebarMenu.map((item, idx) => (
                        <li
                            key={idx}
                            className="p-3 rounded-lg bg-gray-100/20 hover:bg-gray-100/40"
                        >
                            <Link
                                href={item.href}
                                className="flex items-center gap-3 cursor-pointer"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <FontAwesomeIcon icon={item.icon} className="mr-2 ml-2" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}
