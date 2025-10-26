import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUserShield, faChevronDown } from '@fortawesome/free-solid-svg-icons';

const roleOptions = [
    { label: "Guest", value: "guest", icon: faUser },
    { label: "Admin", value: "admin", icon: faUserShield },
];

export default function RoleDropdown({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selected = roleOptions.find((r) => r.value === value);

    return (
        <div className="relative" ref={ref}>
            <label className="block mb-2 text-gray-400 font-medium">Role</label>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex justify-between items-center px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-white transition-colors"
            >
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={selected.icon} className="w-4 h-4 text-gray-400" />
                    <span>{selected.label}</span>
                </div>
                <FontAwesomeIcon icon={faChevronDown} className="w-3 h-3 text-gray-400" />
            </button>

            {open && (
                <ul className="absolute mt-1 w-full bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg z-10">
                    {roleOptions.map((role) => (
                        <li
                            key={role.value}
                            onClick={() => {
                                onChange({ target: { name: "role", value: role.value } });
                                setOpen(false);
                            }}
                            className={`cursor-pointer flex items-center gap-2 px-3 py-2 text-gray-300 hover:bg-neutral-800 transition-colors ${role.value === value ? "bg-neutral-800 text-blue-400" : ""
                                }`}
                        >
                            <FontAwesomeIcon icon={role.icon} className="w-4 h-4" />
                            <span>{role.label}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}