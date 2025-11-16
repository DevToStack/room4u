'use client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChartSimple,
    faCalendarCheck,
    faCreditCard,
    faGear,
    faHouse,
    faQuestionCircle,
    faRightFromBracket,
    faBars,
    faXmark,
    faBuilding,
    faExclamationCircle,
    faStar
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);

    const menuItems = [
        { id: 'overview', label: 'Overview', icon: faChartSimple, href: '/dashboard' },
        { id: 'bookings', label: 'Bookings', icon: faCalendarCheck, href: '/dashboard/bookings' },
        { id: 'payments', label: 'Payments', icon: faCreditCard, href: '/dashboard/payments' },
        { id: 'reviews', label: 'Reviews', icon: faStar, href: '/dashboard/reviews' },
        { id: 'settings', label: 'Settings', icon: faGear, href: '/dashboard/settings' },
    ];

    const quickLinks = [
        { label: 'Home', icon: faHouse, href: '/' },
        { label: 'Apartments', icon: faBuilding, href: '/apartments' },
        { label: 'About Us', icon: faExclamationCircle, href: '/about' },
        { label: 'Help', icon: faQuestionCircle, href: '/help' },
    ];

    const isActive = (href) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard';
        }
        return pathname.startsWith(href);
    };

    const handleLogout = async () => {
        try {
            setLoading(true);

            const res = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!res.ok) {
                throw new Error('Logout failed');
            }

            // Redirect after logout
            window.location.href = '/';
        } catch (error) {
            console.error('Logout Error:', error);
            alert('Something went wrong while logging out.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-70 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-neutral-900 border-r border-neutral-700 shadow-xl transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0
            `}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between lg:justify-start gap-4 p-4 border-b border-neutral-700">
                        <div className='flex justify-center items-center rounded-full bg-emerald-400 h-10 w-10 font-bold text-neutral-900'>
                            R4U
                        </div>
                        <h1 className="text-2xl font-bold text-emerald-400">Rooms4U</h1>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-2 rounded-lg hover:bg-neutral-800 transition-colors"
                        >
                            <FontAwesomeIcon icon={faXmark} className="text-neutral-300" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4">
                        <div className="space-y-2">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 ${isActive(item.href)
                                            ? 'bg-emerald-500 text-white shadow-lg'
                                            : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                                        }`}
                                >
                                    <FontAwesomeIcon icon={item.icon} className="w-5 h-5 mr-3" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            ))}
                        </div>

                        {/* Quick Links */}
                        <div className="mt-8">
                            <h3 className="px-4 text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                                Quick Links
                            </h3>
                            <div className="space-y-2">
                                {quickLinks.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className="w-full flex items-center px-4 py-3 rounded-xl text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all duration-200"
                                    >
                                        <FontAwesomeIcon icon={link.icon} className="w-4 h-4 mr-3" />
                                        <span className="font-medium">{link.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-neutral-700">
                        <button
                            onClick={handleLogout}
                            disabled={loading}
                            className={`w-full flex items-center justify-center px-4 py-3 rounded-xl transition-all duration-200 font-medium border border-red-800/30
                                ${loading
                                    ? 'bg-red-900/50 text-red-200 cursor-not-allowed'
                                    : 'bg-red-900/30 text-red-300 hover:bg-red-800/40 hover:text-red-200'}
                            `}
                        >
                            <FontAwesomeIcon icon={faRightFromBracket} className="w-5 h-5 mr-2" />
                            {loading ? 'Logging out...' : 'Logout'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 flex items-center bg-neutral-800 shadow-sm z-30 p-2 border-b border-neutral-700">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-lg hover:bg-neutral-700 transition-colors"
                >
                    <FontAwesomeIcon icon={faBars} className="text-neutral-300" />
                </button>
                <h2 className="text-lg font-semibold text-neutral-100 ml-4">
                    {menuItems.find(item => isActive(item.href))?.label || 'Dashboard'}
                </h2>
            </div>
        </>
    );
}
