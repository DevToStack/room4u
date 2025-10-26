"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBed, faBath, faUsers, faUtensils, faWifi,
    faTv, faParking, faBroom, faUmbrellaBeach
} from "@fortawesome/free-solid-svg-icons";

const apartmentPlans = [
    {
        id: 1,
        title: "1 BHK Comfort",
        price: "₹3,000",
        features: [
            { icon: faBed, text: "1 Bedroom" },
            { icon: faBath, text: "1 Bathroom" },
            { icon: faUsers, text: "Up to 2 guests" },
            { icon: faUtensils, text: "Kitchen Access" },
            { icon: faWifi, text: "Free Wi-Fi" },
        ],
    },
    {
        id: 2,
        title: "2 BHK Deluxe",
        price: "₹6,500",
        features: [
            { icon: faBed, text: "2 Bedrooms" },
            { icon: faBath, text: "2 Bathrooms" },
            { icon: faUsers, text: "Up to 4 guests" },
            { icon: faUtensils, text: "Full Kitchen" },
            { icon: faTv, text: "Smart TV + Wi-Fi" },
            { icon: faParking, text: "Free Parking" },
        ],
    },
    {
        id: 3,
        title: "3 BHK Premium",
        price: "₹10,000",
        features: [
            { icon: faBed, text: "3 Bedrooms" },
            { icon: faBath, text: "3 Bathrooms" },
            { icon: faUsers, text: "Up to 6 guests" },
            { icon: faUmbrellaBeach, text: "Balcony View" },
            { icon: faBroom, text: "Daily Cleaning" },
            { icon: faWifi, text: "High-Speed Wi-Fi" },
            { icon: faParking, text: "Private Parking" },
        ],
    },
];

// Dark, bold themes for cards
const glassStyles = [
    {
        // Blue glass
        bg: "bg-white/10 backdrop-blur-lg",
        border: "border border-blue-400/20",
        shadow: "shadow-xl shadow-blue-900/40",
        button: "bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600",
    },
    {
        // Pink/Fuchsia glass
        bg: "bg-white/10 backdrop-blur-md",
        border: "border border-pink-400/20",
        shadow: "shadow-xl shadow-pink-900/40",
        button: "bg-gradient-to-r from-fuchsia-900 to-pink-700 hover:from-fuchsia-800 hover:to-pink-600",
    },
    {
        // Teal/Green glass
        bg: "bg-white/10 backdrop-blur-xl",
        border: "border border-teal-400/20",
        shadow: "shadow-xl shadow-teal-900/40",
        button: "bg-gradient-to-r from-emerald-900 to-teal-700 hover:from-emerald-800 hover:to-teal-600",
    },
];
  

export default function PricingSection() {
    const router = useRouter();

    const handleBook = (plan) => {
        router.push(`/booking/${plan.id}`);
    };

    return (
        <section className="py-16" id="pricing">
            <div className="max-w-6xl mx-auto px-4 text-center">
                <h2 className="text-4xl font-bold text-white mb-4">Apartment Plans</h2>
                <p className="text-gray-400 mb-12">
                    Choose the perfect apartment for your stay.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {apartmentPlans.map((plan, idx) => (
                        <div
                            key={plan.id}
                            className={`rounded-2xl p-6 transition-all transform hover:scale-[1.02] flex flex-col justify-between text-white ${glassStyles[idx].bg} ${glassStyles[idx].border} ${glassStyles[idx].shadow}`}
                        >
                            <div>
                                <h3 className="text-2xl font-bold mb-1">{plan.title}</h3>
                                <p className="text-3xl font-extrabold mb-4">{plan.price}</p>
                                <ul className="space-y-3 text-left font-medium mb-6">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3">
                                            <FontAwesomeIcon icon={feature.icon} className="w-5 h-5 text-white" />
                                            <span>{feature.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <button
                                onClick={() => handleBook(plan)}
                                className={`mt-auto w-full text-white font-semibold py-2.5 rounded-xl transition duration-200 ${glassStyles[idx].button}`}
                            >
                                Book Now
                            </button>
                        </div>
                      
                    ))}
                </div>
            </div>
        </section>
    );
}
