'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faMapMarkerAlt, faStar, faHeart, faCity } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'

export default function Hero() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Trigger animations after component mounts
        setIsVisible(true)
    }, [])

    return (
        <section className="relative w-full bg-neutral-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 min-h-screen overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-12 sm:-top-16 lg:-top-24 -right-12 sm:-right-16 lg:-right-24 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-teal-400/10 rounded-full blur-2xl sm:blur-3xl opacity-100"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px] bg-teal-400/5 rounded-full blur-2xl sm:blur-3xl opacity-100"></div>
                <div className="absolute -bottom-16 sm:-bottom-24 lg:-bottom-32 -left-16 sm:-left-24 lg:-left-32 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-teal-400/5 rounded-full blur-2xl sm:blur-3xl opacity-100"></div>

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:40px_40px] sm:bg-[size:50px_50px] lg:bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
            </div>

            <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center relative z-10 max-sm:mt-20">
                {/* Left Column: Text Content */}
                <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
                    {/* Main Heading */}
                    <div className="space-y-3 sm:space-y-4">
                        <div className="overflow-hidden">
                            <h1 className={`text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight sm:leading-tight transition-all duration-1000 ease-out ${isVisible
                                    ? 'opacity-100 translate-y-0'
                                    : 'opacity-0 translate-y-10'
                                }`}>
                                Find Your{' '}
                                <span className="text-teal-400 relative inline-block">
                                    Dream Apartment
                                    <div className={`absolute -bottom-1 sm:-bottom-2 left-0 w-full h-0.5 bg-teal-400/30 transition-all duration-1000 ease-out delay-700 ${isVisible ? 'scale-x-100' : 'scale-x-0'
                                        }`}></div>
                                </span>
                            </h1>
                        </div>

                        <div className="overflow-hidden">
                            <p className={`text-xl sm:text-2xl lg:text-3xl text-gray-300 font-light transition-all duration-1000 ease-out delay-300 ${isVisible
                                    ? 'opacity-100 translate-x-0'
                                    : 'opacity-0 -translate-x-10'
                                }`}>
                                Anywhere, Anytime
                            </p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="overflow-hidden">
                        <p className={`text-gray-400 text-base sm:text-lg lg:text-xl max-w-lg mx-auto lg:mx-0 leading-relaxed transition-all duration-1000 ease-out delay-500 ${isVisible
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-8'
                            }`}>
                            Discover thousands of carefully curated apartments for short or long stays.
                            Experience comfort and style, all in one place.
                        </p>
                    </div>

                    {/* Stats Section */}
                    <div className="flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6 lg:gap-8 pt-2 sm:pt-4">
                        {[
                            { icon: faHome, value: "10K+", label: "Premium Properties", delay: 600 },
                            { icon: faCity, value: "50+", label: "Cities Worldwide", delay: 800 },
                            { icon: faStar, value: "4.9★", label: "Guest Rating", delay: 1000 }
                        ].map((stat, index) => (
                            <div
                                key={stat.label}
                                className={`transition-all duration-700 ease-out ${isVisible
                                        ? 'opacity-100 translate-y-0'
                                        : 'opacity-0 translate-y-12'
                                    }`}
                                style={{ transitionDelay: `${stat.delay}ms` }}
                            >
                                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                                    {/* Responsive icon container */}
                                    <div className="w-10 h-10 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-teal-400/10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                                        <FontAwesomeIcon
                                            icon={stat.icon}
                                            className="text-teal-400 text-sm sm:text-base lg:text-lg w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5"
                                            fixedWidth
                                        />
                                    </div>
                                    <div>
                                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{stat.value}</div>
                                        <div className="text-gray-400 text-xs sm:text-sm">{stat.label}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start pt-4 sm:pt-6 transition-all duration-1000 ease-out delay-1200 ${isVisible
                            ? 'opacity-100 translate-x-0'
                            : 'opacity-0 translate-x-10'
                        }`}>
                        <button className="group relative bg-teal-400 hover:bg-teal-500 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 lg:px-10 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl text-sm sm:text-base">
                            <div className="absolute inset-0 bg-white/10 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <FontAwesomeIcon
                                icon={faMapMarkerAlt}
                                className="relative z-10 w-3 h-3 sm:w-4 sm:h-4"
                                fixedWidth
                            />
                            <a href='/apartments' className="relative z-10">Explore Apartments</a>
                        </button>
                    </div>
                </div>

                {/* Right Column: Feature Cards */}
                <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                    {[
                        {
                            icon: faHome,
                            title: "Luxury Apartments",
                            desc: "Premium comfort & style",
                            animation: 'translate-x-8'
                        },
                        {
                            icon: faMapMarkerAlt,
                            title: "Prime Locations",
                            desc: "Best neighborhoods",
                            animation: '-translate-x-8'
                        },
                        {
                            icon: faStar,
                            title: "Top Rated",
                            desc: "Verified reviews",
                            animation: 'translate-y-8'
                        },
                        {
                            icon: faHeart,
                            title: "Favorite Picks",
                            desc: "Most loved",
                            animation: '-translate-y-8'
                        }
                    ].map((feature, index) => (
                        <div
                            key={feature.title}
                            className={`bg-neutral-800/30 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-700/50 hover:border-teal-400/50 transition-all duration-700 ease-out transform hover:scale-105 cursor-pointer group relative overflow-hidden ${isVisible
                                    ? 'opacity-100 translate-x-0 translate-y-0'
                                    : `opacity-0 ${feature.animation}`
                                }`}
                            style={{ transitionDelay: `${800 + (index * 200)}ms` }}
                        >
                            {/* Teal Background Effect on Hover */}
                            <div className="absolute inset-0 bg-teal-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <div className="relative z-10 text-center">
                                {/* Responsive icon container */}
                                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white/5 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-teal-400/10 transition-all duration-300 border border-white/10 flex-shrink-0">
                                    <FontAwesomeIcon
                                        icon={feature.icon}
                                        className="text-teal-400 text-lg sm:text-xl lg:text-2xl w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 transform group-hover:scale-110 transition-transform duration-300"
                                        fixedWidth
                                    />
                                </div>
                                <h3 className="text-white font-bold text-sm sm:text-lg lg:text-xl mb-2 sm:mb-3">{feature.title}</h3>
                                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 text-xs sm:text-sm">{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}