'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Menu({ open, onClose, links = [] }) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (open) setShow(true);
    }, [open]);

    const handleTransitionEnd = () => {
        if (!open) setShow(false);
    };

    if (!show) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'
                    }`}
                onClick={onClose}
            />

            {/* Menu */}
            <div
                onTransitionEnd={handleTransitionEnd}
                className={`fixed top-14 right-4 z-50 w-56 bg-neutral-900 border border-white/20
          text-neutral-400 backdrop-blur-md rounded-xl shadow-xl overflow-hidden
          transform transition-all duration-200 origin-top-right
          ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            >
                {links.map((link, idx) => (
                    <Link
                        key={idx}
                        href={link.href}
                        onClick={onClose}
                        className="group flex items-center gap-3 px-4 py-3 text-sm border-b border-white/20 last:border-b-0 hover:bg-white/10 transition-colors"
                    >
                        <FontAwesomeIcon
                            icon={link.icon}
                            className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors"
                        />
                        <span className="text-neutral-400 group-hover:text-white transition-colors">
                            {link.label}
                        </span>
                    </Link>
                  
                ))}
            </div>
        </>
    );
}
