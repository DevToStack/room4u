'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faCalendarAlt, faCreditCard, faHouse } from '@fortawesome/free-solid-svg-icons'

const steps = [
    {
        icon: faSearch,
        title: 'Search & Explore',
        description: 'Find the perfect apartment that matches your preferences and budget.'
    },
    {
        icon: faCalendarAlt,
        title: 'Book Instantly',
        description: 'Select your dates and book your stay with our secure payment system.'
    },
    {
        icon: faCreditCard,
        title: 'Secure Payment',
        description: 'Your payment is protected until you check into your apartment.'
    },
    {
        icon: faHouse,
        title: 'Enjoy Your Stay',
        description: 'Check in seamlessly and enjoy your premium apartment experience.'
    }
]

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 bg-neutral-900 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                {/* Section Header */}
                <div className="mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        How It Works
                    </h2>
                    <p className="text-lg md:text-xl text-gray-300">
                        Book your perfect stay in just a few simple steps
                    </p>
                </div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 relative">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="text-center relative p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl hover:shadow-2xl hover:scale-105 transition-transform duration-300"
                        >
                            {/* Connection line for desktop */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-teal-400/20 -z-10" />
                            )}

                            <div className="bg-teal-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 relative text-neutral-900 shadow-lg">
                                <FontAwesomeIcon icon={step.icon} className="h-8 w-8" />
                                <div className="absolute -top-2 -right-2 bg-neutral-900 text-teal-400 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                                    {index + 1}
                                </div>
                            </div>

                            <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                            <p className="text-gray-300 text-sm md:text-base">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
