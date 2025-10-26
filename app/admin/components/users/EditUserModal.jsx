import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import Modal from './Modal';
import RoleDropdown from './RoleDropdown';

export default function EditUserModal({ formData, onInputChange, onSubmit, onClose }) {
    return (
        <Modal title="Edit User" onClose={onClose}>
            <form
                onSubmit={onSubmit}
                className="space-y-6 text-sm text-gray-300"
            >
                {/* Name */}
                <div>
                    <label className="block mb-2 text-gray-400 font-medium flex items-center gap-2">
                        <FontAwesomeIcon icon={faUser} className="text-gray-500" />
                        <span>Name</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={onInputChange}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent
                       transition-all placeholder-gray-500"
                        placeholder="Enter user name"
                        required
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block mb-2 text-gray-400 font-medium flex items-center gap-2">
                        <FontAwesomeIcon icon={faEnvelope} className="text-gray-500" />
                        <span>Email</span>
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={onInputChange}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg 
                       focus:outline-none focus:ring-2 focus:white focus:border-transparent
                       transition-all placeholder-gray-500"
                        placeholder="user@example.com"
                        required
                    />
                </div>

                {/* Role */}
                <RoleDropdown value={formData.role} onChange={onInputChange} />

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-400 hover:text-white hover:bg-neutral-800 
                       rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 
                       hover:from-blue-500 hover:to-purple-500 rounded-lg 
                       text-white font-medium shadow-md transition-all"
                    >
                        Update User
                    </button>
                </div>
            </form>
        </Modal>
    );
}