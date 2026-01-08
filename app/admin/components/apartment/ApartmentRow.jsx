import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faEye, faUsers, faMapMarkerAlt, faBed, faRupeeSign } from '@fortawesome/free-solid-svg-icons';

const ApartmentRow = ({ apartment, onEdit, onDelete, onViewDetails, loadingAction, getImageUrl }) => {
    const truncateText = (text, maxLength = 80) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    // Generate consistent color based on apartment ID for fallback avatar
    const getAvatarColor = (id) => {
        const hue = (id * 137) % 360; // Golden ratio for better distribution
        return {
            background: `hsl(${hue}, 70%, 20%)`,
            color: `hsl(${hue}, 70%, 80%)`,
        };
    };

    const avatarStyle = getAvatarColor(apartment.id);

    return (
        <tr className="border-b border-neutral-700/50 hover:bg-neutral-800/30 transition-all duration-200 group">
            <td className="p-4">
                <div className="flex items-center">
                    <span className="font-mono text-sm text-neutral-400">#{apartment.id}</span>
                </div>
            </td>
            <td className="p-4">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        {getImageUrl(apartment) ? (
                            <img
                                src={getImageUrl(apartment)}
                                alt={apartment.title}
                                className="w-14 h-14 rounded-xl object-cover border border-neutral-700 shadow-sm"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.querySelector('.image-fallback').style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div
                            className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg uppercase border border-neutral-700 ${getImageUrl(apartment) ? 'image-fallback hidden' : ''}`}
                            style={avatarStyle}
                        >
                            {apartment?.title?.slice(0, 1) || "A"}
                        </div>
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-white truncate group-hover:text-blue-300 transition-colors">
                            {apartment.title}
                        </h3>
                        <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                            {truncateText(apartment.description, 70)}
                        </p>
                    </div>
                </div>
            </td>
            <td className="p-4">
                <div className="flex items-center space-x-2 text-neutral-300">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-xs text-neutral-500" />
                    <span className="text-sm truncate max-w-[120px]">{apartment.location}</span>
                </div>
            </td>
            <td className="p-4">
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <FontAwesomeIcon icon={faUsers} className="text-neutral-500" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full text-[10px] flex items-center justify-center">
                            {apartment.max_guests}
                        </span>
                    </div>
                    <span className="text-sm text-neutral-300">
                        {apartment.max_guests} guest{apartment.max_guests !== 1 ? 's' : ''}
                    </span>
                </div>
            </td>
            <td className="p-4">
                <div className="flex items-center space-x-2">
                    <FontAwesomeIcon icon={faRupeeSign} className="text-green-400" />
                    <span className="font-semibold text-white">
                        {apartment.price_per_night?.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-neutral-400">/night</span>
                </div>
            </td>
            <td className="p-4">
                <div className="flex items-center">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 ${apartment.available
                        ? 'bg-green-900/30 text-green-400 border border-green-800/50'
                        : 'bg-red-900/30 text-red-400 border border-red-800/50'
                        }`}
                    >
                        <div className={`w-2 h-2 rounded-full ${apartment.available ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span>{apartment.available ? 'Available' : 'Booked'}</span>
                    </span>
                </div>
            </td>
            <td className="p-4">
                <div className="flex items-center space-x-2">
                    {/* View Details Button */}
                    <button
                        onClick={() => onViewDetails(apartment)}
                        disabled={loadingAction}
                        className="group relative p-2 bg-neutral-900/50 hover:bg-blue-900/30 border border-neutral-700 hover:border-blue-500/50 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="View Details"
                    >
                        <FontAwesomeIcon
                            icon={faEye}
                            className="w-4 h-4 text-blue-400 group-hover:text-blue-300"
                        />
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="bg-neutral-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                View Details
                            </div>
                        </div>
                    </button>

                    {/* Edit Button */}
                    <button
                        onClick={() => onEdit(apartment)}
                        disabled={loadingAction}
                        className="group relative p-2 bg-neutral-900/50 hover:bg-yellow-900/30 border border-neutral-700 hover:border-yellow-500/50 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Edit Apartment"
                    >
                        <FontAwesomeIcon
                            icon={faEdit}
                            className="w-4 h-4 text-yellow-400 group-hover:text-yellow-300"
                        />
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="bg-neutral-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                Edit
                            </div>
                        </div>
                    </button>

                    {/* Delete Button */}
                    <button
                        onClick={() => onDelete(apartment)}
                        disabled={loadingAction}
                        className="group relative p-2 bg-neutral-900/50 hover:bg-red-900/30 border border-neutral-700 hover:border-red-500/50 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Delete Apartment"
                    >
                        <FontAwesomeIcon
                            icon={faTrash}
                            className="w-4 h-4 text-red-400 group-hover:text-red-300"
                        />
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="bg-neutral-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                Delete
                            </div>
                        </div>
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default ApartmentRow;