import { useState } from "react";
import { ChevronDown } from "lucide-react";

function CustomSelect({ value, onChange }) {
    const [open, setOpen] = useState(false);

    const options = [
        { value: "day", label: "Day" },
        { value: "week", label: "Week" },
        { value: "month", label: "Month" },
        { value: "year", label: "Year" },
    ];

    const selected = options.find((o) => o.value === value);

    return (
        <div className="relative inline-block text-left">
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex items-center justify-between w-28 px-3 py-2 rounded-md border border-gray-700 
                   bg-black text-gray-200 text-sm hover:border-gray-500 
                   focus:outline-none focus:ring-2 focus:ring-gray-600"
            >
                {selected?.label}
                <ChevronDown
                    className={`ml-2 h-4 w-4 transition-transform duration-150 ${open ? "rotate-180" : ""
                        }`}
                />
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 mt-2 w-28 origin-top-right rounded-lg border border-gray-700 bg-black shadow-lg z-10">
                    <ul className="py-1 text-sm text-gray-200">
                        {options.map((opt) => (
                            <li
                                key={opt.value}
                                onClick={() => {
                                    onChange(opt.value);
                                    setOpen(false);
                                }}
                                className={`px-3 py-2 cursor-pointer hover:bg-gray-800 ${opt.value === value ? "text-white font-semibold" : ""
                                    }`}
                            >
                                {opt.label}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default CustomSelect;
