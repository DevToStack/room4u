// app/dashboard/components/Sidebar.js
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
    faXmark
} from '@fortawesome/free-solid-svg-icons';

export default function Sidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) {
    const menuItems = [
        { id: 'overview', label: 'Overview', icon: faChartSimple },
        { id: 'bookings', label: 'Bookings', icon: faCalendarCheck },
        { id: 'payments', label: 'Payments', icon: faCreditCard },
        { id: 'settings', label: 'Settings', icon: faGear },
    ];

    const quickLinks = [
        { label: 'Home', icon: faHouse },
        { label: 'Bookings Page', icon: faCalendarCheck },
        { label: 'Payments Page', icon: faCreditCard },
        { label: 'Help', icon: faQuestionCircle },
    ];

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
                fixed inset-y-0 left-0 z-50 w-64 bg-neutral-900 shadow-xl transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0
            `}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-neutral-700">
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
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        setSidebarOpen(false);
                                    }}
                                    className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 ${activeTab === item.id
                                            ? 'bg-emerald-500 text-white shadow-lg'
                                            : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                                        }`}
                                >
                                    <FontAwesomeIcon
                                        icon={item.icon}
                                        className="w-5 h-5 mr-3"
                                    />
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Quick Links */}
                        <div className="mt-8">
                            <h3 className="px-4 text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                                Quick Links
                            </h3>
                            <div className="space-y-2">
                                {quickLinks.map((link, index) => (
                                    <button
                                        key={index}
                                        className="w-full flex items-center px-4 py-3 rounded-xl text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all duration-200"
                                    >
                                        <FontAwesomeIcon icon={link.icon} className="w-4 h-4 mr-3" />
                                        <span className="font-medium">{link.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-neutral-700">
                        <button className="w-full flex items-center justify-center px-4 py-3 bg-red-900/30 text-red-300 rounded-xl hover:bg-red-800/40 hover:text-red-200 transition-all duration-200 font-medium border border-red-800/30">
                            <FontAwesomeIcon icon={faRightFromBracket} className="w-5 h-5 mr-2" />
                            Logout
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
                <h2 className="text-lg font-semibold text-neutral-100">Dashboard</h2>
            </div>
        </>
    );
}