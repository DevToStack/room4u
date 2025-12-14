'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faXmark, faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { useState, useEffect } from 'react'
import { getUser } from '@/lib/get-user'   // <-- use our custom authentication

export default function FeedbackModal({ isOpen, onClose }) {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [feedback, setFeedback] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [user, setUser] = useState(null)       // <-- replaces session
    const [authLoading, setAuthLoading] = useState(true)

    // Fetch user from /api/auth/me
    useEffect(() => {
        setIsMounted(true)

        async function loadUser() {
            setAuthLoading(true)
            const u = await getUser()
            setUser(u)
            setAuthLoading(false)
        }

        if (isOpen) loadUser()
    }, [isOpen])

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!user) {
            setError('Please log in to submit feedback')
            return
        }

        if (!feedback.trim() && rating === 0) {
            setError('Please provide either a rating or feedback message')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    message: feedback.trim(),
                    rating: rating || null,
                    feedback_type: rating > 0 ? 'rating' : 'general'
                }),
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Failed to submit feedback')

            setSubmitted(true)
            setTimeout(() => {
                setSubmitted(false)
                setRating(0)
                setFeedback('')
                onClose()
            }, 2000)

        } catch (error) {
            console.error('Feedback submission error:', error)
            setError(error.message || 'Failed to submit feedback.')
        } finally {
            setIsLoading(false)
        }
    }

    // Prevent body scroll
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'unset'
        return () => (document.body.style.overflow = 'unset')
    }, [isOpen])

    // Escape close
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [onClose])

    if (!isMounted) return null

    const loggedIn = !!user && !authLoading

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                    onClick={onClose}
                />
            )}

            <div
                className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isOpen
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-95 pointer-events-none'
                    }`}
            >
                <div
                    className="relative w-full max-w-md bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl p-6"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white p-2"
                    >
                        <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
                    </button>

                    {/* User info */}
                    {loggedIn && (
                        <div className="flex items-center gap-3 mb-6 p-3 bg-neutral-800/50 rounded-xl">
                            <div>
                                <p className="text-white font-medium text-sm">
                                    {user.name}
                                </p>
                                <p className="text-gray-400 text-xs">
                                    Logged in • Feedback will be linked to your account
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Unauthenticated message */}
                    {!loggedIn && !authLoading && (
                        <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                            <p className="text-amber-400 text-sm text-center">
                                You need to be logged in to submit feedback.
                            </p>
                            <button
                                onClick={() => {
                                    onClose()
                                    window.location.href = '/login'
                                }}
                                className="w-full mt-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
                            >
                                Go to Login
                            </button>
                        </div>
                    )}

                    {/* Success UI */}
                    {submitted ? (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">✓</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Thank You!</h3>
                            <p className="text-gray-400">
                                Your feedback has been submitted successfully.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Rating */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-3 text-center">
                                    How would you rate your experience?
                                    <span className="text-gray-500 ml-1">(Optional)</span>
                                </label>

                                <div className="flex justify-center space-x-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            disabled={!loggedIn || isLoading}
                                            className="text-3xl"
                                        >
                                            <FontAwesomeIcon
                                                icon={faStar}
                                                className={`${star <= (hoverRating || rating)
                                                    ? 'text-yellow-400'
                                                    : 'text-neutral-700'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Textarea */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-3">
                                    Your Feedback <span className="text-gray-500">(Optional)</span>
                                </label>

                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    disabled={!loggedIn || isLoading}
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white h-32"
                                />
                                <div className="text-xs text-gray-500 mt-2 text-right">
                                    {feedback.length}/500
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={
                                    !loggedIn ||
                                    isLoading ||
                                    (!feedback.trim() && rating === 0)
                                }
                                className={`w-full py-3.5 px-4 rounded-xl font-semibold ${loggedIn &&
                                    (feedback.trim() || rating > 0) &&
                                    !isLoading
                                    ? 'bg-teal-600 text-white hover:bg-teal-700'
                                    : 'bg-neutral-800 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {isLoading ? 'Submitting...' : 'Submit Feedback'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </>
    )
}
