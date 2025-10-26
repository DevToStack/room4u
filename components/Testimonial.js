'use client';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as solidStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";
import NextImage from 'next/image';

const testimonials = [
    {
        name: "Ravi Kumar",
        role: "Family Traveller",
        rating: 5,
        message:
            "This apartment truly felt like home! Clean, cozy, and in a perfect location. My family loved the peaceful environment and nearby attractions.",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
        name: "Anjali Sharma",
        role: "Business Traveler",
        rating: 4,
        message:
            "Ideal for a short work trip. High-speed Wi-Fi, comfortable bed, and easy access to everything. Highly recommended for solo professionals.",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
        name: "Mohit Sinha",
        role: "Vacation Guest",
        rating: 5,
        message:
            "Booked for a weekend getaway and loved every bit of it. Clean rooms, great service, and seamless self check-in. Will definitely return!",
        image: "https://randomuser.me/api/portraits/men/53.jpg",
    },
];

const renderStars = (rating) => (
    <div className="text-yellow-500 mb-2" aria-label={`${rating} out of 5 stars`}>
        {[...Array(5)].map((_, i) => (
            <FontAwesomeIcon
                key={i}
                icon={i < rating ? solidStar : regularStar}
                className="w-4 h-4 inline"
            />
        ))}
    </div>
);

const TestimonialSection = () => {
    return (
        <section
            className="py-16 bg-gray-50"
            aria-labelledby="testimonial-heading"
            role="region"
        >
            <div className="max-w-7xl mx-auto px-4 text-center">
                <h2
                    id="testimonial-heading"
                    className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-4"
                >
                    What Our Guests Are Saying
                </h2>
                <p className="text-gray-600 mb-12 text-base sm:text-lg max-w-2xl mx-auto">
                    Real experiences from real guests who booked our apartments for family stays, business, or relaxation.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((t, idx) => (
                        <figure
                            key={idx}
                            className="bg-white rounded-xl shadow-md p-6 text-left hover:shadow-lg transition duration-300"
                        >
                            <figcaption className="flex items-center mb-4">
                                <NextImage
                                    src={t.image}
                                    alt={`Photo of ${t.name}`}
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 rounded-full object-cover mr-4"
                                />
                                <div>
                                    <h3 className="font-semibold text-gray-800">{t.name}</h3>
                                    <span className="text-sm text-gray-500">{t.role}</span>
                                </div>
                            </figcaption>
                            {renderStars(t.rating)}
                            <blockquote className="text-gray-600 text-sm sm:text-base leading-relaxed">
                                “{t.message}”
                            </blockquote>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialSection;
