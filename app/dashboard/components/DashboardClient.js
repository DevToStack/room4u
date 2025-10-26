// app/dashboard/components/DashboardClient.js
'use client';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Overview from './Overview';
import Bookings from './Bookings';
import Payments from './Payments';
import Settings from './Settings';

export default function DashboardClient({ initialData }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <Overview data={initialData.overview} />;
            case 'bookings':
                return <Bookings data={initialData.bookings} />;
            case 'payments':
                return <Payments data={initialData.payments} />;
            case 'settings':
                return <Settings data={initialData.settings} />;
            default:
                return <Overview data={initialData.overview} />;
        }
    };

    return (
        <div className="flex h-screen bg-neutral-900">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />

            <main className="flex-1 overflow-auto">
                <div className="p-6 max-sm:pt-16">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}