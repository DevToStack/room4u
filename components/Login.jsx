'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginForm({ isModal = false, onSuccess }) {


    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('Login successful!');

                if (res.ok) {
                    setMessage('Login successful!');

                    // CLOSE MODAL
                    if (onSuccess) onSuccess();

                    // OPTIONAL: refresh user data
                    

                    // Redirect based on role
                    setTimeout(() => {
                        if (data.role === 'admin' || data.role === 'staff') {
                            router.push('/admin');
                        } else {
                            router.refresh(); // refresh user session in UI

                        }
                    }, 100);
                }
                
            } else {
                setMessage(data.error || 'Login failed. Please try again.');
            }
        } catch (error) {
            setMessage('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className={`min-h-full flex flex-col ${isModal ? '' : 'items-center justify-center'} text-gray-200`}>
            <h2 className="text-2xl font-bold text-center text-teal-400 mb-6">
                Login to Your Account
            </h2>

            <form onSubmit={handleLogin} className="space-y-4 w-full max-w-md">
                {/* Email Field */}
                <div className="flex items-center border rounded-lg px-3 py-2 bg-neutral-800">
                    <FontAwesomeIcon icon={faEnvelope} className="text-teal-400 mr-2" />
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="flex-1 bg-neutral-800 outline-none text-gray-100 placeholder-gray-400"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                {/* Password Field with Eye Icon */}
                <div className="flex items-center border rounded-lg px-3 py-2 bg-neutral-800">
                    <FontAwesomeIcon icon={faLock} className="text-teal-400 mr-2" />
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="flex-1 bg-neutral-800 outline-none text-gray-100 placeholder-gray-400"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="text-teal-400 hover:text-teal-300 focus:outline-none transition-colors"
                    >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                    <Link
                        href="/forgot-password"
                        className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
                    >
                        Forgot Password?
                    </Link>
                </div>

                {/* Login Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-teal-400 text-neutral-900 py-3 rounded-lg flex items-center justify-center hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                    {loading ? (
                        'Logging in...'
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                            Login
                        </>
                    )}
                </button>

                {/* Register Link */}
                <div className="text-center mt-4">
                    <p className="text-sm text-gray-400">
                        Don't have an account?{' '}
                        <Link
                            href="/register"
                            className="text-teal-400 hover:text-teal-300 transition-colors font-semibold"
                        >
                            Register here
                        </Link>
                    </p>
                </div>
            </form>

            {/* Message Display */}
            {message && (
                <div className={`mt-4 text-center text-sm ${message.includes('successful') ? 'text-green-500' : 'text-red-500'
                    }`}>
                    {message}
                </div>
            )}
        </div>
    );
}