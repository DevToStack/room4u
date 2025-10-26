// app/dashboard/components/FilterPills.js
export default function FilterPills({ filters, activeFilter, onFilterChange }) {
    return (
        <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
                <button
                    key={filter.id}
                    onClick={() => onFilterChange(filter.id)}
                    className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${activeFilter === filter.id
                        ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                        : 'bg-neutral-800 text-gray-300 border border-neutral-600 hover:bg-neutral-700 hover:text-gray-200 hover:border-neutral-500'
                        }`}
                >
                    {filter.label}
                </button>
            ))}
        </div>
    );
}