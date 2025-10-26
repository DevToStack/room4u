'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBuilding } from '@fortawesome/free-solid-svg-icons'
import { faFacebookF, faTwitter, faInstagram, faLinkedinIn } from '@fortawesome/free-brands-svg-icons'

export default function Footer() {
    return (
        <footer className="relative bg-neutral-900 text-white overflow-hidden">
            {/* Decorative Glows */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-teal-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-teal-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center mb-4">
                            <FontAwesomeIcon icon={faBuilding} className="h-8 w-8 text-teal-400" />
                            <span className="ml-2 text-xl font-bold">LuxStay</span>
                        </div>
                        <p className="text-gray-400 mb-4 max-w-md">
                            Your trusted platform for premium apartment bookings. Connecting guests with amazing hosts worldwide.
                        </p>
                        <div className="flex space-x-4">
                            {[faFacebookF, faTwitter, faInstagram, faLinkedinIn].map((icon, i) => (
                                <FontAwesomeIcon
                                    key={i}
                                    icon={icon}
                                    className="h-5 w-5 text-gray-400 hover:text-teal-400 cursor-pointer transition p-2 rounded-full hover:bg-white/10"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold mb-4 text-teal-400">Quick Links</h3>
                        <ul className="space-y-2 text-gray-400">
                            {['Home', '#apartments', '#how-it-works', '#admin'].map((link, i) => (
                                <li key={i}>
                                    <a href={link} className="hover:text-teal-400 transition">
                                        {link === '#' ? 'Home' : link.replace('#', '').replace('-', ' ')}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-semibold mb-4 text-teal-400">Support</h3>
                        <ul className="space-y-2 text-gray-400">
                            {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map((item, i) => (
                                <li key={i}>
                                    <a href="#" className="hover:text-teal-400 transition">{item}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
                    <p>&copy; 2024 LuxStay. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
