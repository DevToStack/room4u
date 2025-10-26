'use client';
import { useState } from 'react';
import HeroParticlesBackground from './particals';
import RoomAvailabilityForm from './Form';
import Toast from '@/components/toast';

const HeroSection = () => {
    const [open, setOpen] = useState(false);
    const [toast, setToast] = useState(null);

    return (
        <section className="relative bg-black w-full min-h-screen overflow-hidden flex flex-col justify-center items-center text-white px-6 sm:px-12 py-20">
            {/* Background Particles */}
            <div className="absolute inset-0 w-full h-full">
                <HeroParticlesBackground />
            </div>

            {/* Hero Content */}
            <div className="relative z-10 flex flex-col items-center text-center justify-center w-full">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold
                               text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-orange-400">
                    Book Your Perfect Apartment
                </h1>



                <p className="mt-4 text-lg sm:text-xl md:text-2xl text-gray-300 max-w-xl animate-fade-in">
                    Find and book the ideal space instantly with just a few clicks.
                </p>

                {/* Buttons */}
                <div className="mt-8 flex justify-center gap-4">
                    <a
                        href="#pricing"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-5 rounded-xl shadow-lg 
                       transition duration-300 transform hover:scale-105"
                    >
                        Book Room
                    </a>

                    <button
                        onClick={() => setOpen(true)}
                        className="border border-green-400 text-green-400 hover:bg-green-600 hover:text-white 
                       font-semibold py-3 px-4 rounded-xl transition duration-300 
                       bg-white/10 backdrop-blur-md shadow-lg transform hover:scale-105"
                    >
                        Check Availability
                    </button>
                </div>
            </div>

            {/* Popup Form Modal */}
            <RoomAvailabilityForm
                open={open}
                onClose={() => setOpen(false)}
                setToast={setToast} // pass setter to modal
            />
            {/* Toast always rendered in parent */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </section>
    );
};

export default HeroSection;
