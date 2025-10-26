// components/FeedbackPage.jsx
'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faStar,
    faMessage,
    faUser,
    faHome,
    faThumbsUp,
    faThumbsDown,
    faPaperPlane,
    faCalendar,
    faMapMarkerAlt,
    faCheckCircle,
    faSmile,
    faFrown,
    faMeh
} from '@fortawesome/free-solid-svg-icons'

export default function FeedbackPage() {
    const [activeTab, setActiveTab] = useState('general')
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        bookingReference: '',
        apartment: '',
        category: 'general',
        message: '',
        recommend: '',
        issues: [],
        improvements: ''
    })

    const feedbackCategories = [
        { id: 'general', name: 'General Feedback', icon: faMessage, description: 'Share your overall experience' },
        { id: 'booking', name: 'Booking Process', icon: faCalendar, description: 'Feedback on the reservation process' },
        { id: 'property', name: 'Property Experience', icon: faHome, description: 'Review your stay and apartment' },
        { id: 'host', name: 'Host Feedback', icon: faUser, description: 'Comments about your host' },
        { id: 'support', name: 'Customer Support', icon: faThumbsUp, description: 'Feedback on our support team' }
    ]

    const commonIssues = [
        'Cleanliness concerns',
        'Accuracy of listing',
        'Check-in process',
        'Amenities not working',
        'Wi-Fi issues',
        'Noise problems',
        'Safety concerns',
        'Host communication',
        'Location accuracy',
        'Value for money'
    ]

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                issues: checked
                    ? [...prev.issues, value]
                    : prev.issues.filter(issue => issue !== value)
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }))
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // Here you would typically send the feedback to your backend
        console.log('Feedback submitted:', { ...formData, rating })
        setIsSubmitted(true)

        // Reset form after submission
        setTimeout(() => {
            setFormData({
                name: '',
                email: '',
                bookingReference: '',
                apartment: '',
                category: 'general',
                message: '',
                recommend: '',
                issues: [],
                improvements: ''
            })
            setRating(0)
            setIsSubmitted(false)
        }, 5000)
    }

    const getRatingText = (rating) => {
        const ratings = {
            1: 'Poor',
            2: 'Fair',
            3: 'Good',
            4: 'Very Good',
            5: 'Excellent'
        }
        return ratings[rating] || 'Rate your experience'
    }

    const getEmoji = (rating) => {
        const emojis = {
            1: faFrown,
            2: faFrown,
            3: faMeh,
            4: faSmile,
            5: faSmile
        }
        return emojis[rating] || faMeh
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-neutral-900 pt-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <div className="w-24 h-24 bg-teal-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-teal-400 text-4xl" />
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-4">Thank You!</h1>
                        <p className="text-gray-300 text-lg mb-8 max-w-md mx-auto">
                            Your feedback has been received. We appreciate you helping us improve our service.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => setIsSubmitted(false)}
                                className="bg-teal-400 text-neutral-900 font-bold py-3 px-8 rounded-xl hover:bg-teal-500 transition-all duration-300"
                            >
                                Submit Another Feedback
                            </button>
                            <button className="border-2 border-gray-600 text-white font-bold py-3 px-8 rounded-xl hover:border-teal-400 transition-all duration-300">
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-900 pt-20">
            {/* Header Section */}
            <section className="relative bg-neutral-800 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <FontAwesomeIcon icon={faMessage} className="text-teal-400 text-2xl" />
                        <h1 className="text-4xl font-bold text-white">Share Your Feedback</h1>
                    </div>
                    <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                        Your experience helps us improve and ensures better stays for everyone
                    </p>
                </div>
            </section>

            {/* Main Feedback Form */}
            <section className="py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-neutral-800 rounded-2xl p-8">
                        {/* Category Tabs */}
                        <div className="mb-8">
                            <h3 className="text-white font-bold text-lg mb-4">What would you like to provide feedback on?</h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {feedbackCategories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => {
                                            setActiveTab(category.id)
                                            setFormData(prev => ({ ...prev, category: category.id }))
                                        }}
                                        className={`flex flex-col items-center p-4 rounded-xl border transition-all duration-200 ${activeTab === category.id
                                                ? 'bg-teal-400/20 border-teal-400 text-teal-400'
                                                : 'bg-neutral-700/50 border-neutral-600 text-gray-300 hover:border-teal-400/30'
                                            }`}
                                    >
                                        <FontAwesomeIcon icon={category.icon} className="text-lg mb-2" />
                                        <span className="text-xs font-medium text-center">{category.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Rating Section */}
                        <div className="mb-8 p-6 bg-neutral-700/30 rounded-xl border border-neutral-600">
                            <h3 className="text-white font-bold text-lg mb-4 text-center">
                                How would you rate your overall experience?
                            </h3>
                            <div className="text-center mb-4">
                                <div className="flex items-center justify-center gap-1 mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="transform transition-all duration-200 hover:scale-110"
                                        >
                                            <FontAwesomeIcon
                                                icon={faStar}
                                                className={`text-4xl ${star <= (hoverRating || rating)
                                                        ? 'text-teal-400'
                                                        : 'text-gray-500'
                                                    } ${star === (hoverRating || rating) ? 'scale-110' : ''}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center justify-center gap-2 mt-2">
                                    <FontAwesomeIcon
                                        icon={getEmoji(hoverRating || rating)}
                                        className={`text-2xl ${(hoverRating || rating) >= 4 ? 'text-green-400' :
                                                (hoverRating || rating) >= 3 ? 'text-yellow-400' : 'text-red-400'
                                            }`}
                                    />
                                    <span className="text-white font-medium">
                                        {getRatingText(hoverRating || rating)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Feedback Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-white font-medium mb-2">
                                        Your Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-white font-medium mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-white font-medium mb-2">
                                        Booking Reference
                                    </label>
                                    <input
                                        type="text"
                                        name="bookingReference"
                                        value={formData.bookingReference}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                                        placeholder="e.g., LST123456"
                                    />
                                </div>
                                <div>
                                    <label className="block text-white font-medium mb-2">
                                        Apartment Name/ID
                                    </label>
                                    <input
                                        type="text"
                                        name="apartment"
                                        value={formData.apartment}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                                        placeholder="Which apartment did you stay in?"
                                    />
                                </div>
                            </div>

                            {/* Issues Section */}
                            {activeTab === 'property' && (
                                <div>
                                    <label className="block text-white font-medium mb-3">
                                        Did you encounter any issues during your stay? (Select all that apply)
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {commonIssues.map((issue) => (
                                            <label key={issue} className="flex items-center space-x-3 p-3 bg-neutral-700/30 rounded-lg border border-neutral-600 hover:border-teal-400/30 transition-colors duration-200 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    value={issue}
                                                    checked={formData.issues.includes(issue)}
                                                    onChange={handleInputChange}
                                                    className="w-4 h-4 text-teal-400 bg-neutral-600 border-neutral-500 rounded focus:ring-teal-400 focus:ring-2"
                                                />
                                                <span className="text-gray-300 text-sm">{issue}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recommendation Section */}
                            <div>
                                <label className="block text-white font-medium mb-3">
                                    Would you recommend LuxStay to friends and family?
                                </label>
                                <div className="flex flex-wrap gap-4">
                                    {[
                                        { value: 'definitely', label: 'Definitely', icon: faThumbsUp },
                                        { value: 'probably', label: 'Probably', icon: faThumbsUp },
                                        { value: 'unsure', label: 'Not Sure', icon: faMeh },
                                        { value: 'no', label: 'Probably Not', icon: faThumbsDown }
                                    ].map((option) => (
                                        <label key={option.value} className="flex items-center space-x-2 p-4 bg-neutral-700/30 rounded-xl border border-neutral-600 hover:border-teal-400/30 transition-all duration-200 cursor-pointer flex-1 min-w-[140px]">
                                            <input
                                                type="radio"
                                                name="recommend"
                                                value={option.value}
                                                checked={formData.recommend === option.value}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 text-teal-400 bg-neutral-600 border-neutral-500 focus:ring-teal-400 focus:ring-2"
                                            />
                                            <FontAwesomeIcon icon={option.icon} className="text-teal-400" />
                                            <span className="text-gray-300 font-medium">{option.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Improvements Section */}
                            <div>
                                <label className="block text-white font-medium mb-2">
                                    What could we improve to make your experience better?
                                </label>
                                <textarea
                                    name="improvements"
                                    value={formData.improvements}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none"
                                    placeholder="Share your suggestions for improvement..."
                                />
                            </div>

                            {/* Detailed Feedback */}
                            <div>
                                <label className="block text-white font-medium mb-2">
                                    Your Detailed Feedback *
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    required
                                    rows={5}
                                    className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none"
                                    placeholder={`Please share your detailed experience with the ${feedbackCategories.find(c => c.id === activeTab)?.name.toLowerCase()}...`}
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="flex items-center justify-between pt-6 border-t border-neutral-700">
                                <div className="text-gray-400 text-sm">
                                    * Required fields
                                </div>
                                <button
                                    type="submit"
                                    disabled={!formData.name || !formData.email || !formData.message}
                                    className="flex items-center gap-3 bg-teal-400 text-neutral-900 font-bold py-4 px-8 rounded-xl hover:bg-teal-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                                >
                                    <FontAwesomeIcon icon={faPaperPlane} />
                                    Submit Feedback
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* Additional Information */}
            <section className="py-12 bg-neutral-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-4">Why Your Feedback Matters</h2>
                        <p className="text-gray-300 text-lg">We're committed to continuous improvement</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-teal-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FontAwesomeIcon icon={faUser} className="text-teal-400 text-2xl" />
                            </div>
                            <h3 className="text-white font-bold text-lg mb-2">Improve Guest Experience</h3>
                            <p className="text-gray-300 text-sm">
                                Your feedback helps us enhance the experience for all future guests
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-teal-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FontAwesomeIcon icon={faHome} className="text-teal-400 text-2xl" />
                            </div>
                            <h3 className="text-white font-bold text-lg mb-2">Better Properties</h3>
                            <p className="text-gray-300 text-sm">
                                Hosts use your feedback to improve their properties and services
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-teal-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FontAwesomeIcon icon={faThumbsUp} className="text-teal-400 text-2xl" />
                            </div>
                            <h3 className="text-white font-bold text-lg mb-2">Trust & Transparency</h3>
                            <p className="text-gray-300 text-sm">
                                Honest reviews help other travelers make informed decisions
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}