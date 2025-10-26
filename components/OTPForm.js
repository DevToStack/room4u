'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function OtpVerificationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const purpose = searchParams.get('purpose') || '';

    const [otp, setOtp] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const sentOnce = useRef(false);

    // Send OTP automatically on first load
    useEffect(() => {
        if (email && purpose && !sentOnce.current) {
            sendOtp();
            sentOnce.current = true;
        }
    }, [email, purpose, sendOtp]);

    // Countdown for resend
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const sendOtp = useCallback(async () => {
        setMessage('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, purpose }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('OTP sent to your email.');
                setResendTimer(30);
            } else {
                setMessage(data.error || 'Failed to send OTP.');
            }
        } catch {
            setMessage('Server error while sending OTP.');
        }
        setLoading(false);
    }, [email, purpose]);

    const verifyOtp = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, purpose }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('OTP verified successfully.');
                if (purpose === 'registration') router.push('/');
                else if (purpose === 'login') router.push('/signin');
                else if (purpose === 'forgot-password') router.push(`/reset-password?email=${email}`);
                else router.push('/');
            } else {
                setMessage(data.error || 'Invalid OTP.');
            }
        } catch {
            setMessage('Server error while verifying OTP.');
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen justify-top sm:justify-center bg-white/10 sm:bg-black sm:p-4">
            <div className="sm:bg-white/10 text-gray-100 p-8 rounded-2xl sm:shadow-xl w-full border-0 border-white/10 sm:max-w-md sm:border">
                <h2 className="text-2xl font-bold mb-4 text-center">Verify OTP</h2>
                <p className="text-center text-gray-600 mb-4">
                    Enter the OTP sent to <strong>{email}</strong>
                </p>

                {message && (
                    <div className="mb-4 p-3 text-sm rounded bg-gray-100 text-gray-800">
                        {message}
                    </div>
                )}

                <form onSubmit={verifyOtp} className="space-y-4">
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter OTP"
                        maxLength={6}
                        className="w-full border border-white/10 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <button
                        onClick={sendOtp}
                        disabled={resendTimer > 0 || loading}
                        className="text-blue-600 hover:underline disabled:opacity-50"
                    >
                        {resendTimer > 0
                            ? `Resend OTP in ${resendTimer}s`
                            : 'Resend OTP'}
                    </button>
                </div>
            </div>
        </div>
    );
}
