"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTrash,
    faCheckCircle,
    faInbox,
    faBell,
    faMoneyBill,
    faMessage,
    faStar,
    faInfoCircle
} from "@fortawesome/free-solid-svg-icons";

export default function NotificationItem({ item, refresh }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const iconMap = {
        booking: faBell,
        payment: faMoneyBill,
        feedback: faStar,
        message: faMessage,
        system: faInfoCircle,
        default: faInbox,
    };

    const markAsRead = async () => {
        await fetch(`/api/admin/notifications/read?id=${item.id}`, {
            method: "PUT",
            cache: "no-store",
        });
        refresh();
    };

    const handleDelete = async () => {
        await fetch(`/api/admin/notifications/delete?id=${item.id}`, {
            method: "DELETE",
            cache: "no-store",
        });

        setShowDeleteModal(false);
        refresh();
    };

    return (
        <>
            {/* Vercel-style Delete Modal */}
            <DeleteModal
                open={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
            />

            <div
                className={`flex items-start justify-between p-4 rounded-xl 
                border backdrop-blur-xl shadow-md transition-all duration-200
                ${item.is_read
                        ? "border-neutral-700 bg-[#111111]/50"
                    : "border-neutral-500 bg-neutral-900/10 shadow-neutral-200/10"
                    }
                hover:scale-[1.01]
            `}
            >
                <div className="flex gap-4 justify-start items-center">
                    {/* Icon */}
                    <div className={`
                        w-11 h-11 flex items-center justify-center rounded-full 
                        ${item.is_read ? "bg-neutral-800" : "bg-neutral-500/20"}
                    `}>
                        <FontAwesomeIcon
                            icon={iconMap[item.type] || iconMap.default}
                            className="text-neutral-400 text-xl"
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <h3 className="font-semibold text-white text-md flex items-center gap-2">
                            {item.title}
                            {!item.is_read && (
                                <span className="text-blue-400 text-xs px-2 py-0.5 rounded-full border border-blue-400">
                                    NEW
                                </span>
                            )}
                        </h3>

                        <p className="text-neutral-300 mt-1 leading-relaxed text-sm">
                            {item.content}
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col">
                    <div className="flex gap-2 justify-end">
                        {!item.is_read && (
                            <button
                                onClick={markAsRead}
                                className="
                                flex items-center gap-2 px-3 py-1.5 rounded-lg
                                bg-green-600/20 border border-green-700 text-green-400
                                text-sm
                                hover:bg-green-600/30 transition-all duration-150
                            "
                            >
                                <FontAwesomeIcon icon={faCheckCircle} />
                                Mark Read
                            </button>
                        )}
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="
                            flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
                            bg-red-600/20 border border-red-700 text-red-400
                            hover:bg-red-600/30 transition-all duration-150
                        "
                        >
                            <FontAwesomeIcon icon={faTrash} />
                            Delete
                        </button>
                    </div>
                    
                    <div className="text-xs text-neutral-500 mt-1">
                        {item.type.toUpperCase()} •{" "}
                        {new Date(item.created_at).toLocaleString()}
                    </div>
                </div>
            </div>
        </>
    );
}

/* Modal Component */
function DeleteModal({ open, onClose, onConfirm }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#111111] border border-gray-800 rounded-xl p-6 w-[380px] shadow-2xl animate-scaleIn">
                <h2 className="text-white font-semibold text-lg mb-2">Delete Notification?</h2>

                <p className="text-gray-400 text-sm mb-5">
                    Are you sure you want to delete this notification? This action cannot be undone.
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
