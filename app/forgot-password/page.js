'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faPaperPlane, faEye, faEyeSlash, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1); // 1: Request OTP, 2: Verify OTP & Reset
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(Array(6).fill(''));
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [timer, setTimer] = useState(0);
    const otpRefs = useState([])[0];

    // Countdown timer for OTP resend
    useState(() => {
        if (timer <= 0) return;
        const interval = setInterval(() => setTimer(t => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const handleOtpChange = (value, index) => {
        if (/^\d*$/.test(value)) {
            let newOtp = [...otp];
            if (value.length > 1) {
                value.split('').slice(0, 6).forEach((char, idx) => (newOtp[idx] = char));
                setOtp(newOtp);
                otpRefs[Math.min(value.length, 5)]?.focus();
            } else {
                newOtp[index] = value;
                setOtp(newOtp);
                if (value && index < 5) otpRefs[index + 1]?.focus();
            }
        }
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs[index - 1]?.focus();
        }
    };

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/auth/send-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('OTP sent to your email!');
                setStep(2);
                setTimer(60); // 60 seconds timer
            } else {
                setMessage(data.error || 'Failed to send OTP.');
            }
        } catch (error) {
            setMessage('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            return setMessage('Passwords do not match!');
        }

        if (newPassword.length < 8) {
            return setMessage('Password must be at least 8 characters long!');
        }

        if (otp.join('').length !== 6) {
            return setMessage('Please enter complete OTP');
        }

        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    otp: otp.join(''),
                    newPassword
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('Password reset successfully! Redirecting to login...');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                setMessage(data.error || 'Failed to reset password.');
            }
        } catch (error) {
            setMessage('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (timer > 0) return;

        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/auth/request-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('OTP resent to your email!');
                setTimer(60);
                setOtp(Array(6).fill(''));
            } else {
                setMessage(data.error || 'Failed to resend OTP.');
            }
        } catch (error) {
            setMessage('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

    return (
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full space-y-8"
            >
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-teal-400 mb-2">Reset Password</h1>
                    <p className="text-gray-400">
                        {step === 1
                            ? "Enter your email to receive a reset OTP"
                            : "Enter the OTP and your new password"
                        }
                    </p>
                </div>

                {/* Back to Login */}
                <div className="text-center">
                    <Link
                        href="/login"
                        className="text-teal-400 hover:text-teal-300 transition-colors text-sm inline-flex items-center"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Back to Login
                    </Link>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-neutral-800 rounded-2xl p-6 shadow-xl"
                    >
                        {step === 1 ? (
                            <RequestOtpForm
                                email={email}
                                setEmail={setEmail}
                                loading={loading}
                                onSubmit={handleRequestOtp}
                            />
                        ) : (
                            <ResetPasswordForm
                                email={email}
                                otp={otp}
                                newPassword={newPassword}
                                confirmPassword={confirmPassword}
                                showPassword={showPassword}
                                showConfirmPassword={showConfirmPassword}
                                loading={loading}
                                timer={timer}
                                onOtpChange={handleOtpChange}
                                onOtpKeyDown={handleOtpKeyDown}
                                onPasswordChange={setNewPassword}
                                onConfirmPasswordChange={setConfirmPassword}
                                onTogglePassword={togglePasswordVisibility}
                                onToggleConfirmPassword={toggleConfirmPasswordVisibility}
                                onResendOtp={handleResendOtp}
                                onSubmit={handleResetPassword}
                                otpRefs={otpRefs}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Message Display */}
                {message && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`text-center text-sm p-3 rounded-lg ${message.includes('successfully') || message.includes('sent')
                                ? 'bg-green-900/50 text-green-400 border border-green-800'
                                : 'bg-red-900/50 text-red-400 border border-red-800'
                            }`}
                    >
                        {message}
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}

// Request OTP Form Component
function RequestOtpForm({ email, setEmail, loading, onSubmit }) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="flex items-center border border-neutral-700 rounded-lg px-3 py-2 bg-neutral-900">
                <FontAwesomeIcon icon={faEnvelope} className="text-teal-400 mr-2" />
                <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 bg-neutral-900 outline-none text-gray-100 placeholder-gray-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-400 text-neutral-900 py-3 rounded-lg flex items-center justify-center hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
                {loading ? (
                    'Sending OTP...'
                ) : (
                    <>
                        <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                        Send Reset OTP
                    </>
                )}
            </button>
        </form>
    );
}

// Reset Password Form Component
function ResetPasswordForm({
    email,
    otp,
    newPassword,
    confirmPassword,
    showPassword,
    showConfirmPassword,
    loading,
    timer,
    onOtpChange,
    onOtpKeyDown,
    onPasswordChange,
    onConfirmPasswordChange,
    onTogglePassword,
    onToggleConfirmPassword,
    onResendOtp,
    onSubmit,
    otpRefs
}) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {/* Email Display */}
            <div className="text-center mb-4">
                <p className="text-sm text-gray-400">Reset password for</p>
                <p className="text-teal-400 font-semibold">{email}</p>
            </div>

            {/* OTP Input */}
            <div className="space-y-3">
                <label className="text-sm text-gray-400">Enter OTP</label>
                <div className="flex justify-between gap-2">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={el => otpRefs[index] = el}
                            type="text"
                            maxLength="1"
                            className="w-12 h-12 text-center font-bold rounded-lg outline-none bg-neutral-900 text-gray-100 border border-neutral-700 focus:border-teal-400 transition-colors"
                            value={digit}
                            onChange={(e) => onOtpChange(e.target.value, index)}
                            onKeyDown={(e) => onOtpKeyDown(e, index)}
                        />
                    ))}
                </div>

                {/* Resend OTP */}
                <div className="text-center">
                    <button
                        type="button"
                        onClick={onResendOtp}
                        disabled={timer > 0}
                        className="text-sm text-teal-400 hover:text-teal-300 disabled:text-gray-600 transition-colors"
                    >
                        {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                    </button>
                </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
                <label className="text-sm text-gray-400">New Password</label>
                <div className="flex items-center border border-neutral-700 rounded-lg px-3 py-2 bg-neutral-900">
                    <FontAwesomeIcon icon={faLock} className="text-teal-400 mr-2" />
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        className="flex-1 bg-neutral-900 outline-none text-gray-100 placeholder-gray-400"
                        value={newPassword}
                        onChange={(e) => onPasswordChange(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        onClick={onTogglePassword}
                        className="text-teal-400 hover:text-teal-300 focus:outline-none transition-colors"
                    >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
                <label className="text-sm text-gray-400">Confirm Password</label>
                <div className="flex items-center border border-neutral-700 rounded-lg px-3 py-2 bg-neutral-900">
                    <FontAwesomeIcon icon={faLock} className="text-teal-400 mr-2" />
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        className="flex-1 bg-neutral-900 outline-none text-gray-100 placeholder-gray-400"
                        value={confirmPassword}
                        onChange={(e) => onConfirmPasswordChange(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        onClick={onToggleConfirmPassword}
                        className="text-teal-400 hover:text-teal-300 focus:outline-none transition-colors"
                    >
                        <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                    </button>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-400 text-neutral-900 py-3 rounded-lg flex items-center justify-center hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
                {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
        </form>
    );
}