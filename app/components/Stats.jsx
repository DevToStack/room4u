'use client'

const stats = [
    { number: '10,000+', label: 'Apartments Listed' },
    { number: '50,000+', label: 'Happy Guests' },
    { number: '500+', label: 'Cities Available' },
    { number: '4.9/5', label: 'Average Rating' }
]

export default function Stats() {
    return (
        <section className="py-20 bg-neutral-900 relative overflow-hidden">
            {/* Subtle floating decorative circles */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-teal-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-teal-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-center">
                    {stats.map((stat, index) => (
                        <div key={index} className="p-6 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 hover:scale-105 hover:shadow-2xl transition-transform duration-300">
                            <div className="text-3xl md:text-4xl font-bold text-teal-400 mb-2">
                                {stat.number}
                            </div>
                            <div className="text-gray-300 text-sm md:text-base">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
