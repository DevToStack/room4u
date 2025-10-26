'use client'

import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faTimes, faBuilding, faStar, faCrown, faUser, faSignOutAlt, faTachometerAlt } from '@fortawesome/free-solid-svg-icons'
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from './AuthModal'

export default function Header({
    navItems = ['Apartments', 'Features', 'Why Us', 'How It Works'],
    authButtons = true,
    logo = { name: 'Rooms4U', showStar: true },
    transparentOnScroll = true,
    className = ''
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [authOpen, setAuthOpen] = useState(false);
    const [activeAuthTab, setActiveAuthTab] = useState('login');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userName, setUserName] = useState('');

    // Check authentication status on component mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    useEffect(() => {
        if (!transparentOnScroll) {
            setIsScrolled(true)
            return
        }
        const handleScroll = () => setIsScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [transparentOnScroll])

    // Function to check if user is authenticated by calling your API
    const checkAuthStatus = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/auth/me', {
                method: 'GET',
                credentials: 'include', // Important for sending cookies
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setIsLoggedIn(true);
                setUserName(data.name || ''); // Store user name if needed
            } else {
                setIsLoggedIn(false);
                setUserName('');
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            setIsLoggedIn(false);
            setUserName('');
        } finally {
            setIsLoading(false);
        }
    }

    // Function to handle logout
    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                console.log('Logout successful');
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear client-side state regardless of API response
            setIsLoggedIn(false);
            setUserName('');
            setIsMenuOpen(false);

            // Force a page reload to ensure clean state
            window.location.href = '/';
        }
    }

    const handleLoginClick = () => {
        setActiveAuthTab('login');
        setAuthOpen(true);
    }

    const handleRegisterClick = () => {
        setActiveAuthTab('register');
        setAuthOpen(true);
    }

    // Update auth state when modal closes (in case login was successful)
    const handleAuthModalClose = () => {
        setAuthOpen(false);
        // Re-check auth status after a short delay to allow for login processing
        setTimeout(() => {
            checkAuthStatus();
        }, 500);
    }

    // Skalito Loader Component
    const SkalitoLoader = () => (
        <div className="flex items-center justify-center space-x-1">
            <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="w-2 h-2 bg-teal-400 rounded-full"
                        animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>
            <span className="text-gray-400 text-sm ml-2">Loading...</span>
        </div>
    );

    // Show loading state briefly while checking auth
    if (isLoading) {
        return (
            <header className={`fixed top-0 w-screen z-50 bg-neutral-900 backdrop-blur-2xl border-b border-neutral-800 shadow-2xl ${className}`}>
            </header>
        );
    }

    return (
        <>
            <header
                className={`fixed top-0 w-screen z-50 transition-all duration-300 ${className} ${transparentOnScroll
                    ? (isScrolled
                        ? 'bg-neutral-900 backdrop-blur-2xl border-b border-neutral-800 shadow-2xl'
                        : 'bg-transparent border-b border-white/10 backdrop-blur-sm')
                    : 'bg-neutral-900 backdrop-blur-2xl border-b border-neutral-800 shadow-2xl'
                    }`}
            >
                <nav className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-14">
                        {/* Logo */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center group cursor-pointer"
                        >
                            <div className='flex justify-center items-center rounded-full bg-teal-400 h-10 w-10 font-bold text-neutral-900'>
                                R4U
                            </div>
                            <span
                                className={`ml-3 text-2xl font-bold transition-colors duration-300 text-white`}
                            >
                                {logo.name}
                            </span>
                        </motion.div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            {navItems.map((item, index) => (
                                <motion.a
                                    key={item}
                                    href={`#${item.toLowerCase().replace(' ', '-')}`}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="relative font-medium text-gray-200 hover:text-teal-400 transition-all duration-100 group"
                                >
                                    {item}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-400 group-hover:w-full transition-all duration-100"></span>
                                </motion.a>
                            ))}
                        </div>

                        {/* Desktop Auth Buttons / Dashboard */}
                        {authButtons && (
                            <div className="hidden md:flex items-center space-x-4">
                                {!isLoggedIn ? (
                                    <>
                                        <motion.button
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="px-6 py-2 rounded-xl font-medium text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-300"
                                            onClick={handleLoginClick}
                                        >
                                            Login
                                        </motion.button>
                                        <motion.button
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 }}
                                            whileHover={{ scale: 1.05, boxShadow: '0 10px 30px -10px rgba(14,203,199,0.5)' }}
                                            className="bg-teal-400 text-neutral-900 font-semibold px-6 py-2 rounded-xl hover:shadow-2xl transition-all duration-300"
                                            onClick={handleRegisterClick}
                                        >
                                            Sign Up
                                        </motion.button>
                                    </>
                                ) : (
                                    <>
                                        <motion.a
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 }}
                                            href="/dashboard"
                                            whileHover={{ scale: 1.05 }}
                                            className="flex items-center space-x-2 bg-teal-400 text-neutral-900 font-semibold px-6 py-2 rounded-xl hover:shadow-2xl transition-all duration-300"
                                        >
                                            <FontAwesomeIcon icon={faTachometerAlt} className="h-4 w-4" />
                                            <span>Dashboard</span>
                                        </motion.a>
                                        <motion.button
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 }}
                                            className="flex items-center space-x-2 px-6 py-2 rounded-xl font-medium text-gray-200 hover:text-red-400 hover:bg-white/10 transition-all duration-300"
                                            onClick={handleLogout}
                                        >
                                            <FontAwesomeIcon icon={faSignOutAlt} className="h-4 w-4" />
                                            <span>Logout</span>
                                        </motion.button>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="md:hidden p-2 rounded-lg backdrop-blur-sm text-white"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} className="h-6 w-6" />
                        </motion.button>
                    </div>

                    {/* Mobile Navigation */}
                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.15 }}
                                className="md:hidden overflow-hidden"
                            >
                                <div className="py-6 px-3 border-t border-white/20 bg-neutral-900/80 backdrop-blur-2xl mt-2">
                                    <div className="flex flex-col space-y-6">
                                        {navItems.map((item, index) => (
                                            <motion.a
                                                key={item}
                                                href={`#${item.toLowerCase().replace(' ', '-')}`}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="text-white hover:text-teal-400 transition-colors duration-100 font-medium text-lg"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                {item}
                                            </motion.a>
                                        ))}
                                        {authButtons && (
                                            <div className="flex flex-col space-y-4 pt-6 border-t border-white/20">
                                                {!isLoggedIn ? (
                                                    <>
                                                        <motion.button
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: 0.4 }}
                                                            className="flex items-center space-x-3 text-white hover:text-teal-400 transition-colors duration-100 font-medium text-left py-2"
                                                            onClick={() => {
                                                                setIsMenuOpen(false);
                                                                handleLoginClick();
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faUser} className="h-4 w-4" />
                                                            <span>Login</span>
                                                        </motion.button>
                                                        <motion.button
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: 0.5 }}
                                                            whileHover={{ scale: 1.02 }}
                                                            className="flex items-center space-x-3 bg-teal-400 text-neutral-900 font-semibold py-3 rounded-xl text-center justify-center"
                                                            onClick={() => {
                                                                setIsMenuOpen(false);
                                                                handleRegisterClick();
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faUser} className="h-4 w-4" />
                                                            <span>Sign Up</span>
                                                        </motion.button>
                                                    </>
                                                ) : (
                                                    <div className='flex justify-between'>
                                                        <motion.a
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: 0.4 }}
                                                            href="/dashboard"
                                                            className="flex px-4 items-center space-x-3 bg-teal-400 text-neutral-900 font-semibold py-3 rounded-xl text-center justify-center"
                                                            onClick={() => setIsMenuOpen(false)}
                                                        >
                                                            <FontAwesomeIcon icon={faTachometerAlt} className="h-4 w-4" />
                                                            <span>Dashboard</span>
                                                        </motion.a>
                                                        <motion.button
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: 0.5 }}
                                                            className="flex px-4 rounded-xl max-sm:bg-neutral-800 max-sm:text-red-400 items-center space-x-3 text-white hover:text-red-400 transition-colors duration-100 font-medium text-left py-2"
                                                            onClick={() => {
                                                                setIsMenuOpen(false);
                                                                handleLogout();
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faSignOutAlt} className="h-4 w-4" />
                                                            <span>Logout</span>
                                                        </motion.button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </nav>
            </header>

            {/* Auth Modal */}
            <AuthModal
                isOpen={authOpen}
                onClose={handleAuthModalClose}
                activeTab={activeAuthTab}
                onTabChange={setActiveAuthTab}
                onAuthSuccess={checkAuthStatus} // Pass callback for successful auth
            />
        </>
    )
}