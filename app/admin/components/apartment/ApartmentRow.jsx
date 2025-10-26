import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const ApartmentRow = ({ apartment, onEdit, onDelete, loadingAction, getImageUrl }) => {
    const truncateText = (text, maxLength = 80) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <tr className="border-b border-neutral-700 hover:bg-neutral-800 transition duration-150">
            <td className="p-4">{apartment.id}</td>
            <td className="p-4">
                <div className="flex items-center space-x-3">
                    <img
                        src={getImageUrl(apartment)}
                        alt={apartment.title}
                        className="w-12 h-12 rounded object-cover border border-neutral-700"
                    />
                    <div className="min-w-0 flex-1">
                        <div className="font-medium truncate text-neutral-50">{apartment.title}</div>
                        <div className="text-sm text-neutral-400">
                            {truncateText(apartment.description, 80)}
                        </div>
                    </div>
                </div>
            </td>
            <td className="p-4 text-neutral-50">{apartment.location}</td>
            <td className="p-4 text-neutral-50">{apartment.max_guests}</td>
            <td className="p-4 text-neutral-50">₹{apartment.price_per_night?.toLocaleString()}</td>
            <td className="p-4">
                <span
                    className={`px-2 py-1 rounded text-xs ${apartment.available
                            ? 'bg-neutral-700 text-green-400'
                            : 'bg-neutral-700 text-red-400'
                        }`}
                >
                    {apartment.available ? 'Yes' : 'No'}
                </span>
            </td>
            <td className="p-4">
                <div className="flex space-x-2">
                    <button
                        onClick={() => onEdit(apartment)}
                        disabled={loadingAction}
                        className="bg-neutral-700 hover:bg-neutral-600 px-3 py-1 rounded text-sm flex items-center space-x-1 text-yellow-400 disabled:opacity-50"
                    >
                        <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
                        <span>Edit</span>
                    </button>
                    <button
                        onClick={() => onDelete(apartment)}
                        disabled={loadingAction}
                        className="bg-neutral-700 hover:bg-neutral-600 px-3 py-1 rounded text-sm flex items-center space-x-1 text-red-400 disabled:opacity-50"
                    >
                        <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                        <span>Delete</span>
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default ApartmentRow;
