'use client';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCouch,
    faWifi,
    faUtensils,
    faCar,
    faFan,
    faClock,
} from "@fortawesome/free-solid-svg-icons";

const features = [
    {
        title: "Fully Furnished",
        description: "Enjoy modern furniture, cozy beds, and stylish interiors for a home-like stay.",
        icon: faCouch,
    },
    {
        title: "High-Speed Wi-Fi",
        description: "Stay connected with fast and reliable internet in every corner of your apartment.",
        icon: faWifi,
    },
    {
        title: "Equipped Kitchen",
        description: "Cook meals your way with access to a refrigerator, stove, microwave, and utensils.",
        icon: faUtensils,
    },
    {
        title: "Private Parking",
        description: "Secure, hassle-free parking spaces available for all our guests.",
        icon: faCar,
    },
    {
        title: "Air Conditioning",
        description: "All rooms are air-conditioned for your comfort in any season.",
        icon: faFan,
    },
    {
        title: "24/7 Access",
        description: "Flexible check-in/check-out with round-the-clock property access.",
        icon: faClock,
    },
];

const ApartmentFeatures = () => {
    return (
        <section
            className="py-16 bg-gray-100"
            aria-labelledby="features-heading"
            role="region"
        >
            <div className="max-w-7xl mx-auto px-4 text-center">
                <h2
                    id="features-heading"
                    className="text-3xl sm:text-4xl font-extrabold mb-4 text-gray-800"
                >
                    Why Stay in Our Apartments?
                </h2>
                <p className="text-gray-600 mb-12 text-base sm:text-lg max-w-2xl mx-auto">
                    Designed for comfort, convenience, and flexibility — explore the features that make our apartments feel like home.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                    {features.map((feature, index) => (
                        <article
                            key={index}
                            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-300"
                            aria-label={feature.title}
                        >
                            <div className="text-blue-600 text-4xl mb-4">
                                <FontAwesomeIcon icon={feature.icon} aria-hidden="true" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ApartmentFeatures;
