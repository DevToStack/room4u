'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faShieldAlt,
    faStar,
    faBolt,
    faHeadset
} from '@fortawesome/free-solid-svg-icons'

const features = [
    {
        icon: faShieldAlt,
        title: 'Verified Hosts',
        description: 'All hosts are thoroughly verified to ensure your safety and security.'
    },
    {
        icon: faStar,
        title: 'Premium Quality',
        description: 'Every apartment meets our high standards for quality and comfort.'
    },
    {
        icon: faBolt,
        title: 'Instant Booking',
        description: 'Book your stay instantly with our seamless booking process.'
    },
    {
        icon: faHeadset,
        title: '24/7 Support',
        description: 'Our support team is available around the clock to help you.'
    }
]

export default function Features() {
    return (
        <section id="features" className="py-24 bg-neutral-900 relative overflow-hidden">
            {/* Decorative floating circles (subtle for performance) */}
            <div className="absolute top-0 left-0 w-48 h-48 bg-teal-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-teal-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Why Choose <span className="text-teal-400">Rooms4U</span>?
                    </h2>
                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                        We provide the best apartment booking experience with premium features for both guests and hosts.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="text-center p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:scale-105 transition-transform duration-300 shadow-lg"
                        >
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-teal-400 text-neutral-900 text-2xl shadow-xl">
                                <FontAwesomeIcon icon={feature.icon} className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                            <p className="text-gray-300 text-sm md:text-base">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
