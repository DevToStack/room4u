'use client';
import { motion } from 'framer-motion';
import { Building2, Users, ShieldCheck, CalendarDays } from 'lucide-react';
import Footer from '../components/Footer';
import Header from '@/components/Header';

export default function AboutPage() {
    const teamMembers = [
        {
            name: 'Ravi Sharma',
            role: 'Founder & CEO',
            image: '/images/team1.jpg',
            bio: 'Leads the vision and strategy for seamless apartment booking experiences.',
        },
        {
            name: 'Mohammed Rabi',
            role: 'Lead Developer',
            image: '/images/team3.jpg',
            bio: 'Architects secure, high-performance systems for modern web applications.',
        }
    ];

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-800">
            <Header />

            {/* Header Section */}
            <section className="bg-teal-600 text-white rounded-b-4xl py-20 px-6 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-4xl md:text-5xl font-bold mb-4"
                >
                    About Our Apartment Booking Platform
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg md:text-xl max-w-2xl mx-auto text-neutral-100"
                >
                    We make finding and booking your next stay effortless — whether for a weekend getaway or a long-term apartment rental.
                </motion.p>
            </section>

            {/* Mission Section */}
            <section className="max-w-6xl mx-auto py-16 px-6 grid md:grid-cols-2 gap-12 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl font-bold text-teal-700 mb-4">Our Mission</h2>
                    <p className="text-neutral-700 leading-relaxed">
                        Our goal is to simplify apartment booking by connecting travelers and property owners through a transparent and secure platform.
                        We focus on user trust, verified listings, and a seamless booking experience so you can book confidently and live comfortably.
                    </p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="bg-white shadow-md rounded-2xl p-8 border border-neutral-200"
                >
                    <ul className="space-y-4">
                        <li className="flex items-center space-x-3">
                            <ShieldCheck className="text-teal-600 w-6 h-6" />
                            <span>Verified Apartments and Hosts</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <CalendarDays className="text-teal-600 w-6 h-6" />
                            <span>Flexible Bookings & Transparent Pricing</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <Users className="text-teal-600 w-6 h-6" />
                            <span>24/7 Support for Guests and Owners</span>
                        </li>
                    </ul>
                </motion.div>
            </section>

            {/* Why Choose Us */}
            <section className="bg-neutral-100 py-16 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-teal-700 mb-12">Why Choose Us?</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Building2 className="w-10 h-10 text-teal-600 mx-auto mb-4" />,
                                title: 'Curated Apartments',
                                desc: 'Every listing is checked for quality, comfort, and accuracy to ensure a smooth stay.',
                            },
                            {
                                icon: <ShieldCheck className="w-10 h-10 text-teal-600 mx-auto mb-4" />,
                                title: 'Secure Payments',
                                desc: 'Enjoy peace of mind with our encrypted and verified payment process.',
                            },
                            {
                                icon: <Users className="w-10 h-10 text-teal-600 mx-auto mb-4" />,
                                title: 'Trusted Community',
                                desc: 'Join thousands of satisfied guests and hosts who rely on our platform daily.',
                            },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.2 }}
                                viewport={{ once: true }}
                                className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200 hover:shadow-lg transition-shadow"
                            >
                                {item.icon}
                                <h3 className="text-xl font-semibold text-teal-700 mb-2">{item.title}</h3>
                                <p className="text-neutral-600">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Team Section */}
            <section className="py-20 px-6 bg-white border-t border-neutral-200">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-teal-700 mb-12">Meet Our Team</h2>
                    <div className="grid sm:grid-cols-2 gap-10">
                        {teamMembers.map((member, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.2 }}
                                viewport={{ once: true }}
                                className="bg-neutral-50 rounded-2xl shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden border-4 border-teal-600">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h3 className="text-lg font-semibold text-teal-700">{member.name}</h3>
                                <p className="text-sm text-neutral-600 mb-2">{member.role}</p>
                                <p className="text-neutral-500 text-sm">{member.bio}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
