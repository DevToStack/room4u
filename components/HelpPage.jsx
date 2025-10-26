// components/HelpPage.jsx
'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faSearch,
    faQuestionCircle,
    faCreditCard,
    faKey,
    faUser,
    faHome,
    faStar,
    faCalendar,
    faShield,
    faPhone,
    faEnvelope,
    faMessage,
    faChevronDown,
    faChevronUp
} from '@fortawesome/free-solid-svg-icons'

export default function HelpPage() {
    const [activeCategory, setActiveCategory] = useState('booking')
    const [openFaqs, setOpenFaqs] = useState([])
    const [searchTerm, setSearchTerm] = useState('')

    const categories = [
        { id: 'booking', name: 'Booking', icon: faCalendar, color: 'text-teal-400' },
        { id: 'payments', name: 'Payments', icon: faCreditCard, color: 'text-blue-400' },
        { id: 'account', name: 'Account', icon: faUser, color: 'text-purple-400' },
        { id: 'hosting', name: 'Hosting', icon: faHome, color: 'text-amber-400' },
        { id: 'safety', name: 'Safety', icon: faShield, color: 'text-green-400' },
        { id: 'cancellation', name: 'Cancellation', icon: faKey, color: 'text-red-400' }
    ]

    const faqs = {
        booking: [
            {
                question: "How do I book an apartment?",
                answer: "To book an apartment: 1) Search for your destination and dates, 2) Browse available properties, 3) Select your preferred apartment, 4) Review the details and house rules, 5) Click 'Book Now' and complete your payment."
            },
            {
                question: "Can I book for someone else?",
                answer: "Yes, you can book for someone else. During the booking process, you'll have the option to specify that you're booking for a guest. Make sure to provide the guest's information and ensure they understand the house rules."
            },
            {
                question: "What is the minimum stay requirement?",
                answer: "Minimum stay requirements vary by property. Most apartments require a 2-night minimum stay, but some may allow single-night bookings while others might require longer stays during peak seasons."
            },
            {
                question: "How do I contact the host before booking?",
                answer: "You can message hosts directly through our platform before booking. Click on the 'Contact Host' button on the property listing page to ask any questions about the apartment."
            }
        ],
        payments: [
            {
                question: "What payment methods do you accept?",
                answer: "We accept major credit cards (Visa, MasterCard, American Express), debit cards, PayPal, and in some regions, bank transfers. All payments are securely processed through our encrypted payment system."
            },
            {
                question: "When is my payment processed?",
                answer: "For instant bookings, payment is processed immediately. For reservation requests, payment is processed once the host accepts your booking. Some hosts may offer pay-later options for bookings made well in advance."
            },
            {
                question: "Are there any hidden fees?",
                answer: "We display all fees upfront during the booking process. The total price includes the nightly rate, cleaning fee (if applicable), service fee, and taxes. No hidden charges are added after booking."
            },
            {
                question: "Can I get a receipt for my booking?",
                answer: "Yes, a detailed receipt is automatically generated and sent to your email after completing the booking. You can also access all your receipts in the 'Trips' section of your account."
            }
        ],
        account: [
            {
                question: "How do I create an account?",
                answer: "Click 'Sign Up' in the top right corner and provide your email address, create a password, and fill in your personal details. You can also sign up using your Google or Facebook account for faster registration."
            },
            {
                question: "How do I verify my account?",
                answer: "Account verification helps build trust in our community. We may ask for a government-issued ID, email verification, or phone number confirmation. This process is secure and your information is protected."
            },
            {
                question: "Can I change my account email?",
                answer: "Yes, you can change your email address in the 'Account Settings' section. You'll need to verify the new email address before it becomes active on your account."
            },
            {
                question: "How do I delete my account?",
                answer: "You can request account deletion in the 'Privacy Settings' section of your account. Note that this action is permanent and will cancel any upcoming bookings."
            }
        ],
        hosting: [
            {
                question: "How do I become a host?",
                answer: "Click 'Become a Host' in the main navigation and follow the step-by-step process. You'll need to provide property details, set your availability, and verify your identity before listing your space."
            },
            {
                question: "What are the hosting requirements?",
                answer: "Hosts must provide accurate property information, maintain high cleanliness standards, respond to guest inquiries promptly, and comply with local laws and regulations. Specific requirements may vary by location."
            },
            {
                question: "How much can I earn as a host?",
                answer: "Earnings depend on your location, property type, amenities, and pricing strategy. Our hosting dashboard provides insights and suggestions to help you maximize your earnings potential."
            },
            {
                question: "What support do you provide to hosts?",
                answer: "We offer 24/7 host support, hosting resources, pricing tools, and a community forum. Hosts also benefit from our $1 million host guarantee for property damage protection."
            }
        ],
        safety: [
            {
                question: "What safety measures are in place?",
                answer: "We verify user identities, offer secure messaging, provide emergency support 24/7, and have a dedicated trust and safety team. All payments are processed securely through encrypted systems."
            },
            {
                question: "What is your cancellation policy?",
                answer: "Cancellation policies vary by property. Common options include Flexible (full refund 24 hours before check-in), Moderate (full refund 5 days before), and Strict (50% refund up to 1 week before). Check individual listings for specific policies."
            },
            {
                question: "What happens if there's an issue with my booking?",
                answer: "Contact the host first to resolve any issues. If unresolved, contact our 24/7 support team immediately. We offer rebooking assistance or refunds for significant issues that make the property uninhabitable."
            },
            {
                question: "Are the apartments professionally cleaned?",
                answer: "All hosts are required to maintain high cleanliness standards. Many properties are professionally cleaned between guests, and enhanced cleaning protocols are encouraged. You can see cleaning information in each listing."
            }
        ],
        cancellation: [
            {
                question: "How do I cancel a booking?",
                answer: "Go to 'My Trips' in your account, select the booking you want to cancel, and click 'Cancel Booking'. The refund amount will depend on the host's cancellation policy and timing of your cancellation."
            },
            {
                question: "What is your refund policy?",
                answer: "Refunds are based on the host's cancellation policy. Service fees are refundable if cancelled within 48 hours of booking, and for cancellations made at least 14 days before check-in."
            },
            {
                question: "Can I get a full refund?",
                answer: "Full refunds are typically available for cancellations made within 48 hours of booking, or according to the host's flexible cancellation policy. Extenuating circumstances may also qualify for full refunds."
            },
            {
                question: "What if I need to cancel due to an emergency?",
                answer: "Contact our support team immediately if you need to cancel due to qualified emergencies (serious illness, natural disasters, etc.). We review these cases individually under our Extenuating Circumstances Policy."
            }
        ]
    }

    const toggleFaq = (index) => {
        setOpenFaqs(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        )
    }

    const filteredFaqs = faqs[activeCategory].filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const contactMethods = [
        {
            icon: faMessage,
            title: "Live Chat",
            description: "24/7 instant support",
            action: "Start Chat",
            color: "bg-teal-500"
        },
        {
            icon: faPhone,
            title: "Phone Support",
            description: "Call us anytime",
            action: "+1 (555) 123-4567",
            color: "bg-blue-500"
        },
        {
            icon: faEnvelope,
            title: "Email Support",
            description: "Response within 2 hours",
            action: "support@luxstay.com",
            color: "bg-purple-500"
        }
    ]

return (
    <div className="min-h-screen bg-neutral-900 pt-20">
        {/* Header Section */}
        <section className="relative bg-neutral-800 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <FontAwesomeIcon icon={faQuestionCircle} className="text-teal-400 text-2xl" />
                    <h1 className="text-4xl font-bold text-white">How can we help you?</h1>
                </div>
                <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                    Find answers to common questions or get in touch with our support team
                </p>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto relative">
                    <div className="relative">
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Search for answers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-neutral-700 border border-neutral-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>
        </section>

        {/* Main Content */}
        <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Categories Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-neutral-800 rounded-2xl p-6 sticky top-24">
                            <h3 className="text-white font-bold text-lg mb-4">Categories</h3>
                            <div className="space-y-2">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => {
                                            setActiveCategory(category.id)
                                            setSearchTerm('')
                                            setOpenFaqs([])
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeCategory === category.id
                                                ? 'bg-teal-400/20 text-teal-400 border border-teal-400/30'
                                                : 'text-gray-300 hover:bg-neutral-700 hover:text-white'
                                            }`}
                                    >
                                        <FontAwesomeIcon icon={category.icon} className={category.color} />
                                        <span className="font-medium">{category.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* FAQ Content */}
                    <div className="lg:col-span-2">
                        <div className="bg-neutral-800 rounded-2xl p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <FontAwesomeIcon
                                    icon={categories.find(c => c.id === activeCategory)?.icon}
                                    className="text-teal-400 text-xl"
                                />
                                <h2 className="text-2xl font-bold text-white">
                                    {categories.find(c => c.id === activeCategory)?.name} Questions
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {filteredFaqs.map((faq, index) => (
                                    <div
                                        key={index}
                                        className="bg-neutral-700/50 rounded-xl border border-neutral-600 overflow-hidden"
                                    >
                                        <button
                                            onClick={() => toggleFaq(index)}
                                            className="w-full flex items-center justify-between p-6 text-left hover:bg-neutral-700/30 transition-colors duration-200"
                                        >
                                            <span className="text-white font-medium text-lg pr-4">
                                                {faq.question}
                                            </span>
                                            <FontAwesomeIcon
                                                icon={openFaqs.includes(index) ? faChevronUp : faChevronDown}
                                                className="text-teal-400 flex-shrink-0"
                                            />
                                        </button>
                                        <div
                                            className={`transition-all duration-300 ${openFaqs.includes(index)
                                                    ? 'max-h-96 opacity-100'
                                                    : 'max-h-0 opacity-0'
                                                } overflow-hidden`}
                                        >
                                            <div className="p-6 pt-0">
                                                <p className="text-gray-300 leading-relaxed">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredFaqs.length === 0 && (
                                <div className="text-center py-12">
                                    <FontAwesomeIcon icon={faSearch} className="text-gray-400 text-4xl mb-4" />
                                    <p className="text-gray-400 text-lg">No results found for "{searchTerm}"</p>
                                    <p className="text-gray-500">Try searching with different keywords</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact Methods */}
                    <div className="lg:col-span-1">
                        <div className="bg-neutral-800 rounded-2xl p-6 sticky top-24">
                            <h3 className="text-white font-bold text-lg mb-6">Still need help?</h3>
                            <div className="space-y-4">
                                {contactMethods.map((method, index) => (
                                    <div
                                        key={index}
                                        className="bg-neutral-700/30 rounded-xl p-6 border border-neutral-600 hover:border-teal-400/30 transition-all duration-200 group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className={`w-12 h-12 ${method.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                                                <FontAwesomeIcon icon={method.icon} className="text-white text-lg" />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold">{method.title}</h4>
                                                <p className="text-gray-400 text-sm">{method.description}</p>
                                            </div>
                                        </div>
                                        <button className="w-full bg-teal-400/10 text-teal-400 py-2 rounded-lg font-medium hover:bg-teal-400/20 transition-colors duration-200">
                                            {method.action}
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Quick Stats */}
                            <div className="mt-8 pt-6 border-t border-neutral-700">
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div>
                                        <div className="text-2xl font-bold text-teal-400">24/7</div>
                                        <div className="text-gray-400 text-sm">Support</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-teal-400">2min</div>
                                        <div className="text-gray-400 text-sm">Avg. Response</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Additional Help Section */}
        <section className="py-12 bg-neutral-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-white mb-4">Other Ways We Can Help</h2>
                    <p className="text-gray-300 text-lg">Explore our additional resources</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-neutral-700/30 rounded-2xl p-8 text-center border border-neutral-600 hover:border-teal-400/30 transition-all duration-200">
                        <FontAwesomeIcon icon={faUser} className="text-teal-400 text-3xl mb-4" />
                        <h3 className="text-white font-bold text-xl mb-3">Community Forum</h3>
                        <p className="text-gray-300 mb-4">
                            Connect with other travelers and hosts in our community
                        </p>
                        <button className="text-teal-400 font-medium hover:text-teal-300 transition-colors duration-200">
                            Join Discussion →
                        </button>
                    </div>

                    <div className="bg-neutral-700/30 rounded-2xl p-8 text-center border border-neutral-600 hover:border-teal-400/30 transition-all duration-200">
                        <FontAwesomeIcon icon={faStar} className="text-teal-400 text-3xl mb-4" />
                        <h3 className="text-white font-bold text-xl mb-3">Booking Guides</h3>
                        <p className="text-gray-300 mb-4">
                            Learn how to make the most of your LuxStay experience
                        </p>
                        <button className="text-teal-400 font-medium hover:text-teal-300 transition-colors duration-200">
                            Read Guides →
                        </button>
                    </div>

                    <div className="bg-neutral-700/30 rounded-2xl p-8 text-center border border-neutral-600 hover:border-teal-400/30 transition-all duration-200">
                        <FontAwesomeIcon icon={faShield} className="text-teal-400 text-3xl mb-4" />
                        <h3 className="text-white font-bold text-xl mb-3">Safety Center</h3>
                        <p className="text-gray-300 mb-4">
                            Learn about our safety measures and trust features
                        </p>
                        <button className="text-teal-400 font-medium hover:text-teal-300 transition-colors duration-200">
                            Learn More →
                        </button>
                    </div>
                </div>
            </div>
        </section>
    </div>
)
}