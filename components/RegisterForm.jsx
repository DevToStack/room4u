'use client';

import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faPaperPlane, faUser, faPhone, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';

export default function RegisterForm({ isModal = false }) {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState(Array(6).fill(''));
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [attemptsLeft, setAttemptsLeft] = useState(3);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();
    const [timer, setTimer] = useState(0);
    const otpRefs = useRef([]);

    // Countdown timer
    useEffect(() => {
        if (timer <= 0) return;
        const interval = setInterval(() => setTimer((t) => t - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    // Focus OTP input
    useEffect(() => {
        if (step === 2 && otpRefs.current[0]) otpRefs.current[0].focus();
    }, [step]);

    const handleOtpChange = (value, index) => {
        if (/^\d*$/.test(value)) {
            let newOtp = [...otp];
            if (value.length > 1) {
                value.split('').slice(0, 6).forEach((char, idx) => (newOtp[idx] = char));
                setOtp(newOtp);
                otpRefs.current[Math.min(value.length, 5)].focus();
            } else {
                newOtp[index] = value;
                setOtp(newOtp);
                if (value && index < 5) otpRefs.current[index + 1].focus();
            }
        }
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1].focus();
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();

        // Basic validation
        if (password !== confirmPassword) {
            return setMessage('Passwords do not match!');
        }

        if (password.length < 8) {
            return setMessage('Password must be at least 8 characters long!');
        }

        setLoading(true);
        setMessage('');
        setTimer(60);

        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, purpose: 'registration' }),
            });
            const data = await res.json();

            if (res.ok) {
                setMessage(`OTP sent to ${email}.`);
                setStep(2);
                setAttemptsLeft(3);
            } else {
                setMessage(data.error || 'Failed to send OTP.');
            }
        } catch (error) {
            setMessage('Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (otp.join('').length !== 6) {
            return setMessage('Please enter complete OTP');
        }

        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    password,
                    otp: otp.join("")
                }),
            });
            const data = await res.json();

            if (res.ok) {
                setMessage('Registration successful! Redirecting to login...');
                setTimeout(() => {
                    router.push('/signin');
                }, 2000);
            } else {
                setMessage(data.message || 'Registration failed.');
                // If OTP is invalid, allow retry
                if (data.message?.includes('OTP')) {
                    setAttemptsLeft(prev => prev - 1);
                }
            }
        } catch (error) {
            setMessage('Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div className={`min-h-full flex flex-col ${isModal ? '' : 'items-center justify-center'} text-gray-200`}>
            <h2 className="text-2xl font-bold text-center text-teal-400 mb-6">
                {step === 1 ? 'Register Account' : 'Verify OTP'}
            </h2>

            {step === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                    {[
                        { icon: faUser, placeholder: "Full Name", value: name, setter: setName },
                        { icon: faEnvelope, placeholder: "Email", value: email, setter: setEmail },
                        { icon: faPhone, placeholder: "Phone", value: phone, setter: setPhone },
                    ].map((f, i) => (
                        <div key={i} className="flex items-center border rounded-lg px-3 py-2 bg-neutral-800">
                            <FontAwesomeIcon icon={f.icon} className="text-teal-400 mr-2" />
                            <input
                                type={f.type || 'text'}
                                placeholder={f.placeholder}
                                className="flex-1 bg-neutral-800 outline-none text-gray-100"
                                value={f.value}
                                onChange={e => f.setter(e.target.value)}
                                required
                            />
                        </div>
                    ))}

                    {/* Password field with eye icon */}
                    <div className="flex items-center border rounded-lg px-3 py-2 bg-neutral-800">
                        <FontAwesomeIcon icon={faLock} className="text-teal-400 mr-2" />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="flex-1 bg-neutral-800 outline-none text-gray-100"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="text-teal-400 hover:text-teal-300 focus:outline-none"
                        >
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                        </button>
                    </div>

                    {/* Confirm Password field with eye icon */}
                    <div className="flex items-center border rounded-lg px-3 py-2 bg-neutral-800">
                        <FontAwesomeIcon icon={faLock} className="text-teal-400 mr-2" />
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            className="flex-1 bg-neutral-800 outline-none text-gray-100"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={toggleConfirmPasswordVisibility}
                            className="text-teal-400 hover:text-teal-300 focus:outline-none"
                        >
                            <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-teal-400 text-neutral-900 py-2 rounded-lg flex items-center justify-center hover:bg-teal-500 disabled:opacity-50"
                    >
                        {loading ? 'Sending...' : <><FontAwesomeIcon icon={faPaperPlane} className="mr-2" /> Send OTP</>}
                    </button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="text-center mb-4">
                        <p className="text-sm text-gray-400">Enter OTP sent to {email}</p>
                        {timer > 0 && (
                            <p className="text-sm text-teal-400">Resend OTP in {timer}s</p>
                        )}
                    </div>

                    <div className="flex justify-between gap-2">
                        {otp.map((d, i) => (
                            <input
                                key={i}
                                ref={el => otpRefs.current[i] = el}
                                type="text"
                                maxLength="1"
                                className="w-12 h-12 text-center font-bold rounded-lg outline-none bg-neutral-800 text-gray-100 focus:border-teal-400 border"
                                value={d}
                                onChange={e => handleOtpChange(e.target.value, i)}
                                onKeyDown={e => handleOtpKeyDown(e, i)}
                            />
                        ))}
                    </div>

                    {attemptsLeft > 0 && <p className="text-sm text-gray-400">Attempts left: {attemptsLeft}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-teal-400 text-neutral-900 py-2 rounded-lg hover:bg-teal-500 disabled:opacity-50"
                    >
                        {loading ? 'Registering...' : 'Verify & Register'}
                    </button>

                    <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-full text-teal-400 py-2 rounded-lg border border-teal-400 hover:bg-teal-400 hover:text-neutral-900"
                    >
                        Back to Registration
                    </button>
                </form>
            )}

            {message && (
                <p className={`mt-4 text-center text-sm ${message.includes('successful') ? 'text-green-500' : 'text-red-500'
                    }`}>
                    {message}
                </p>
            )}
        </div>
    );
}