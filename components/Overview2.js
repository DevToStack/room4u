'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMapMarkerAlt,
    faWifi,
    faUtensils,
    faConciergeBell,
    faFan,
    faShieldAlt,
    faBed,
    faBath,
    faCouch,
    faParking,
    faBuilding,
    faClock,
    faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';

export default function Overview() {
    return (
        <article
            className="w-full max-w-6xl mx-auto px-4 py-16 space-y-16 text-gray-800"
            role="region"
            aria-labelledby="overview-heading"
        >
            {/* Intro */}
            <header className="text-center" id="overview-heading">
                <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Welcome to Our Apartments</h1>
                <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                    Experience premium, stylish, and fully-furnished apartments designed for short and long stays alike.
                </p>
            </header>

            {/* Location */}
            <section aria-label="Location Information" className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-600" />
                    Prime Location
                </h2>
                <p className="text-gray-700 leading-relaxed">
                    Nestled in the heart of the city, our apartments offer direct access to restaurants, public transport,
                    shopping centers, tourist attractions, and more — all in a safe and welcoming neighborhood.
                </p>
            </section>

            {/* Apartment Features */}
            <section aria-label="Apartment Features">
                <h2 className="text-2xl font-semibold mb-6">What We Offer</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-gray-700">
                    {[
                        [faBed, 'Spacious Bedrooms', 'King/Queen size beds with clean linens and wardrobes.'],
                        [faBath, 'Modern Bathrooms', 'Equipped with hot water, towels, and toiletries.'],
                        [faCouch, 'Living Area', 'Cozy seating, flat-screen TV, and a work desk.'],
                        [faUtensils, 'Kitchen Access', 'Fridge, microwave, stove, cookware & utensils.'],
                        [faWifi, 'Free High-Speed Wi-Fi', 'Available in every room.'],
                        [faFan, 'AC & Ventilation', 'Fully air-conditioned with good airflow.'],
                        [faShieldAlt, 'Security', '24/7 CCTV, gated entry, and private access.'],
                        [faParking, 'Parking Facility', 'Ample on-site parking for all guests.'],
                        [faBuilding, 'Modern Infrastructure', 'Elevators, fire safety, and power backup.'],
                    ].map(([icon, title, description], idx) => (
                        <div key={idx} className="flex items-start gap-4">
                            <FontAwesomeIcon icon={icon} className="text-xl mt-1 text-indigo-600" />
                            <div>
                                <strong className="block">{title}</strong>
                                <span>{description}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Guest Services */}
            <section aria-label="Guest Services">
                <h2 className="text-2xl font-semibold mb-6">Guest Services</h2>
                <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-gray-700">
                    <li className="flex items-start gap-4">
                        <FontAwesomeIcon icon={faConciergeBell} className="text-xl mt-1 text-purple-500" />
                        <span>24/7 concierge and daily housekeeping available on request.</span>
                    </li>
                    <li className="flex items-start gap-4">
                        <FontAwesomeIcon icon={faClock} className="text-xl mt-1 text-teal-500" />
                        <span>Flexible check-in and check-out times to suit your plans.</span>
                    </li>
                    <li className="flex items-start gap-4">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-xl mt-1 text-green-600" />
                        <span>Hygienically cleaned and fully sanitized before each stay.</span>
                    </li>
                </ul>
            </section>

            {/* Final Note */}
            <footer className="text-center max-w-3xl mx-auto">
                <h2 className="text-2xl font-semibold mb-3">Make Yourself at Home</h2>
                <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                    Whether you’re traveling for business, family, or leisure — our apartments provide a perfect mix
                    of hospitality, privacy, and modern living. Book your stay and enjoy peace of mind with us.
                </p>
            </footer>
        </article>
    );
}
