'use client';

import { motion, AnimatePresence } from 'framer-motion';
import RegisterForm from './RegisterForm';
import LoginForm from './Login';

export default function AuthModal({ isOpen, onClose, activeTab }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-neutral-900 rounded-2xl p-6 sm:p-8 w-full max-w-md relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-4 right-4 text-gray-300 hover:text-teal-400 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-800 transition-colors"
                            onClick={onClose}
                        >
                            ✕
                        </button>

                        {/* Tabs */}
                        <div className="flex border-b border-neutral-700 mb-6">
                            <button
                                className={`flex-1 py-3 font-semibold text-sm transition-colors ${activeTab === 'login'
                                    ? 'text-teal-400 border-b-2 border-teal-400'
                                    : 'text-gray-400 hover:text-gray-200'
                                    }`}
                                onClick={() => setActiveTab('login')}
                            >
                                Login
                            </button>
                            <button
                                className={`flex-1 py-3 font-semibold text-sm transition-colors ${activeTab === 'register'
                                    ? 'text-teal-400 border-b-2 border-teal-400'
                                    : 'text-gray-400 hover:text-gray-200'
                                    }`}
                                onClick={() => setActiveTab('register')}
                            >
                                Register
                            </button>
                        </div>

                        {/* Tab Content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'login' ? (
                                    <LoginForm isModal />
                                ) : (
                                    <RegisterForm isModal />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}