'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBuilding, faCommentDots, faLightbulb, faStar, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { faFacebookF, faTwitter, faInstagram, faLinkedinIn } from '@fortawesome/free-brands-svg-icons'
import { useState } from 'react'
import FeedbackModal from './FeedbackModal'

export default function Footer() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isHovering, setIsHovering] = useState(false)

    return (
        <>
            <footer className="relative bg-gradient-to-b from-neutral-900 to-neutral-950 text-white overflow-hidden">
                {/* Enhanced Decorative Elements */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl -translate-x-1/4 -translate-y-1/4"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl translate-x-1/4 translate-y-1/4"></div>

                {/* Animated gradient border top */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-teal-500/20 to-transparent"></div>

                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        {/* Company Info - Span 4 columns */}
                        <div className="lg:col-span-4">
                            <div className="flex items-center mb-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-teal-400 rounded-full blur-md opacity-50"></div>
                                    <div className="relative flex justify-center items-center rounded-full bg-gradient-to-br from-teal-400 to-teal-600 h-12 w-12 font-bold text-neutral-900 text-lg">
                                        R4U
                                    </div>
                                </div>
                                <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-white to-teal-200 bg-clip-text text-transparent">
                                    Rooms4U
                                </span>
                            </div>
                            <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
                                Your trusted platform for premium apartment bookings. Connecting guests with amazing hosts worldwide since 2020.
                            </p>
                            <div className="flex space-x-3">
                                {[faFacebookF, faTwitter, faInstagram, faLinkedinIn].map((icon, i) => (
                                    <a
                                        key={i}
                                        href="#"
                                        className="relative group"
                                        aria-label={`Follow us on ${icon.iconName}`}
                                    >
                                        <div className="absolute inset-0 bg-teal-500 rounded-full blur group-hover:blur-md transition-all duration-300 opacity-0 group-hover:opacity-20"></div>
                                        <FontAwesomeIcon
                                            icon={icon}
                                            className="relative h-6 w-6 text-gray-400 hover:text-white transition-all duration-300 p-3 rounded-full border border-gray-700 hover:border-teal-400 hover:bg-teal-400/10"
                                        />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Quick Links - Span 3 columns */}
                        <div className="lg:col-span-2">
                            <h3 className="font-bold mb-6 text-lg text-white flex items-center">
                                <span className="bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">
                                    Quick Links
                                </span>
                                <div className="ml-2 w-2 h-2 bg-teal-400 rounded-full"></div>
                            </h3>
                            <ul className="space-y-3">
                                {[
                                    { label: 'Home', href: '/' },
                                    { label: 'Apartments', href: '/apartments' },
                                    { label: 'How It Works', href: '#how-it-works' },
                                    { label: 'Why Rooms4U?', href: '#features' },
                                ].map((item, i) => (
                                    <li key={i}>
                                        <a
                                            href={item.href}
                                            className="group flex items-center text-gray-300 hover:text-white transition-all duration-200"
                                        >
                                            <FontAwesomeIcon
                                                icon={faChevronRight}
                                                className="h-2 w-2 mr-2 text-teal-400 opacity-0 group-hover:opacity-100 transition-all duration-200 transform -translate-x-1 group-hover:translate-x-0"
                                            />
                                            <span className="group-hover:translate-x-1 transition-transform duration-200">
                                                {item.label}
                                            </span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Support - Span 3 columns */}
                        <div className="lg:col-span-3">
                            <h3 className="font-bold mb-6 text-lg text-white flex items-center">
                                <span className="bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">
                                    Support
                                </span>
                                <div className="ml-2 w-2 h-2 bg-teal-400 rounded-full"></div>
                            </h3>
                            <ul className="space-y-3">
                                {[
                                    { label: 'Help Center', href: '/help' },
                                    { label: 'Contact Us', href: '/contact' },
                                    { label: 'Privacy Policy', href: '/privacy-policy' },
                                    { label: 'Terms of Service', href: '/terms-conditions' },
                                ].map((item, i) => (
                                    <li key={i}>
                                        <a
                                            href={item.href}
                                            className="group flex items-center text-gray-300 hover:text-white transition-all duration-200"
                                        >
                                            <FontAwesomeIcon
                                                icon={faChevronRight}
                                                className="h-2 w-2 mr-2 text-teal-400 opacity-0 group-hover:opacity-100 transition-all duration-200 transform -translate-x-1 group-hover:translate-x-0"
                                            />
                                            <span className="group-hover:translate-x-1 transition-transform duration-200">
                                                {item.label}
                                            </span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Enhanced Feedback Section - Span 3 columns */}
                        <div className="lg:col-span-3">
                            <div
                                className="relative group cursor-pointer"
                                onMouseEnter={() => setIsHovering(true)}
                                onMouseLeave={() => setIsHovering(false)}
                                onClick={() => setIsModalOpen(true)}
                            >
                                {/* Background glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>

                                {/* Card container */}
                                <div className="relative bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 rounded-2xl p-6 transform transition-all duration-300 group-hover:scale-[1.02] group-hover:border-teal-400/30">
                                    {/* Icon with glow */}
                                    <div className="relative inline-block mb-4">
                                        <div className="absolute inset-0 bg-teal-400 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                                        <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full">
                                            <FontAwesomeIcon
                                                icon={faCommentDots}
                                                className="h-6 w-6 text-white"
                                            />
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold mb-2 text-white">
                                        We Value Your Feedback
                                    </h3>

                                    {/* Features list */}
                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center text-sm">
                                            <FontAwesomeIcon icon={faStar} className="h-3 w-3 text-amber-400 mr-2" />
                                            <span className="text-gray-300">Rate your experience</span>
                                        </div>
                                        <div className="flex items-center text-sm">
                                            <FontAwesomeIcon icon={faLightbulb} className="h-3 w-3 text-teal-400 mr-2" />
                                            <span className="text-gray-300">Suggest improvements</span>
                                        </div>
                                    </div>

                                    {/* Main CTA Button */}
                                    <button
                                        className="w-full group/btn relative overflow-hidden bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl hover:shadow-teal-500/20"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                                        <div className="relative flex items-center justify-center gap-3">
                                            <span>Share Your Feedback</span>
                                            <FontAwesomeIcon
                                                icon={faChevronRight}
                                                className="h-3 w-3 transform group-hover/btn:translate-x-1 transition-transform duration-300"
                                            />
                                        </div>
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Bottom section */}
                    <div className="border-t border-neutral-800 mt-12 pt-2">
                        <div className="flex flex-col md:flex-row justify-center items-center">
                            <p className="text-gray-400 text-sm">
                                &copy; {new Date().getFullYear()} Rooms4U. All rights reserved.
                            </p>
                            
                        </div>
                    </div>
                </div>
            </footer>

            {/* Feedback Modal */}
            <FeedbackModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    )
}