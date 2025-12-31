import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarXmark, faFilter } from '@fortawesome/free-solid-svg-icons'

export default function NoBookingsEmptyState() {
    return (
        <div className="bg-neutral-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-10 text-center border border-neutral-800/50">
            <div className="flex flex-col items-center justify-center space-y-6">
                {/* Icon with gradient background */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 blur-xl rounded-full"></div>
                    <div className="relative bg-neutral-800 p-6 rounded-full border border-neutral-700/50">
                        <FontAwesomeIcon
                            icon={faCalendarXmark}
                            className="w-12 h-12 text-neutral-400 text-4xl"
                        />
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-3">
                    <h3 className="text-2xl font-semibold text-white">No Bookings Found</h3>
                    <p className="text-neutral-400 max-w-md mx-auto">
                        We couldn't find any bookings matching your current filters.
                    </p>
                </div>

                {/* Suggestion */}
                <div className="flex items-center justify-center gap-2 text-sm text-neutral-500 bg-neutral-800/50 px-4 py-2 rounded-lg border border-neutral-700/50">
                    <FontAwesomeIcon icon={faFilter} className="w-4 h-4" />
                    <span>Try adjusting your search filters</span>
                </div>
            </div>
        </div>
    )
}