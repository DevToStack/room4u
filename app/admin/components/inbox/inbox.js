'use client';

import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEnvelope,
    faSpinner,
    faEye,
    faEyeSlash,
    faFilter,
    faCheckCircle,
    faCircle,
    faSearch,
    faRefresh,
    faRightLeft,
    faCheck,
    faTrash,
    faReply,
    faArchive,
    faEllipsisV,
    faUser,
    faCalendar,
    faPaperclip
} from '@fortawesome/free-solid-svg-icons';

export default function Inbox() {
    const [messages, setMessages] = useState([]);
    const [filteredMessages, setFilteredMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [showMessageMenu, setShowMessageMenu] = useState(null);

    const fetchMessages = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/inbox', { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch messages');
            const data = await res.json();
            setMessages(data.messages || []);
        } catch (err) {
            console.error('Inbox fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    useEffect(() => {
        let filtered = messages;

        if (statusFilter === 'read') filtered = filtered.filter(msg => msg.read);
        if (statusFilter === 'unread') filtered = filtered.filter(msg => !msg.read);

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(msg =>
                msg.senderName?.toLowerCase().includes(term) ||
                msg.subject?.toLowerCase().includes(term) ||
                msg.body?.toLowerCase().includes(term)
            );
        }

        setFilteredMessages(filtered);
    }, [messages, statusFilter, searchTerm]);

    const markAsRead = async (messageId) => {
        try {
            const response = await fetch('/api/admin/inbox', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ messageId }),
            });

            if (response.ok) {
                setMessages(prev => prev.map(msg =>
                    msg.id === messageId ? { ...msg, read: true } : msg
                ));
                if (selectedMessage?.id === messageId) {
                    setSelectedMessage(prev => ({ ...prev, read: true }));
                }
            }
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    };

    const markAsUnread = async (messageId) => {
        try {
            const res = await fetch(`/api/admin/inbox/${messageId}`, { method: 'PUT', credentials: 'include' });
            if (res.ok) {
                setMessages(prev => prev.map(msg =>
                    msg.id === messageId ? { ...msg, read: false } : msg
                ));
                if (selectedMessage?.id === messageId) {
                    setSelectedMessage(prev => ({ ...prev, read: false }));
                }
            }
        } catch (err) { console.error(err); }
    };

    const deleteMessage = async (messageId) => {
        try {
            const res = await fetch(`/api/admin/inbox/${messageId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                setMessages(prev => prev.filter(msg => msg.id !== messageId));
                setSelectedMessage(null);
                setConfirmDelete(null);
                setShowMessageMenu(null);
            }
        } catch (err) {
            console.error('Error deleting message:', err);
        }
    };

    const toggleReadStatus = async (messageId, currentStatus) => {
        if (currentStatus) {
            await markAsUnread(messageId);
        } else {
            await markAsRead(messageId);
        }
    };

    const getUnreadCount = () => messages.filter(msg => !msg.read).length;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString();
        }
    };

    if (loading) {
        return (
            <div className="h-screen text-white p-6 flex items-center justify-center"
                style={{ maxHeight: 'calc(100vh - 96px)' }}
            >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-neutral-900 overflow-hidden">
            {/* Sidebar - Messages List */}
            <div className={`w-full md:w-96 flex flex-col border-r border-gray-700 ${selectedMessage ? 'hidden md:flex' : 'flex'}`}>
                {/* Header */}
                <div className="p-4 bg-neutral-800 border-b border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <FontAwesomeIcon icon={faEnvelope} className="w-6 h-6" />
                            Messages
                        </h1>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setStatusFilter(prev => prev === 'all' ? 'unread' : 'all')}
                                className="p-2 text-gray-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors"
                                title="Toggle Filter"
                            >
                                <FontAwesomeIcon icon={faFilter} className="w-4 h-4" />
                            </button>
                            <button
                                onClick={fetchMessages}
                                className="p-2 text-gray-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors"
                                title="Refresh"
                            >
                                <FontAwesomeIcon icon={faRefresh} className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative mb-4">
                        <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-neutral-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex gap-1 bg-neutral-700 rounded-lg p-1">
                        {[
                            { key: 'all', label: 'All', count: messages.length },
                            { key: 'unread', label: 'Unread', count: getUnreadCount() },
                            { key: 'read', label: 'Read', count: messages.length - getUnreadCount() }
                        ].map(filter => (
                            <button
                                key={filter.key}
                                onClick={() => setStatusFilter(filter.key)}
                                className={`flex-1 px-2 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1 ${statusFilter === filter.key
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:text-white hover:bg-neutral-600'
                                    }`}
                            >
                                {filter.key === 'unread' && <FontAwesomeIcon icon={faCircle} className="w-2 h-2 text-blue-400" />}
                                {filter.key === 'read' && <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3 text-green-400" />}
                                {filter.label} ({filter.count})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto">
                    {!filteredMessages.length ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                            <FontAwesomeIcon icon={faEnvelope} className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-lg font-medium">No messages found</p>
                            <p className="text-sm mt-2 text-center">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Try adjusting your filters or search term'
                                    : 'Your inbox is empty'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="">
                            {filteredMessages.map(msg => (
                                <div
                                    key={msg.id}
                                    onClick={() => {
                                        setSelectedMessage(msg);
                                        if (!msg.read) markAsRead(msg.id);
                                    }}
                                    className={`p-4 cursor-pointer transition-colors relative ${selectedMessage?.id === msg.id
                                        ? 'bg-neutral-300/20 border-r-2 border-neutral-500'
                                        : msg.read
                                            ? 'bg-neutral-800 hover:bg-neutral-700'
                                            : 'bg-neutral-800 hover:bg-neutral-700 border-r-2 border-yellow-500'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className={`font-semibold truncate flex items-center gap-2 ${msg.read ? 'text-gray-300' : 'text-white'
                                                    }`}>
                                                    <FontAwesomeIcon icon={faUser} className="w-3 h-3 text-gray-400" />
                                                    {msg.senderName}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    {msg.hasAttachments && (
                                                        <FontAwesomeIcon icon={faPaperclip} className="w-3 h-3 text-gray-400" />
                                                    )}
                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                        <FontAwesomeIcon icon={faCalendar} className="w-3 h-3" />
                                                        {formatDate(msg.createdAt)}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className={`text-sm font-medium mb-1 truncate ${msg.read ? 'text-gray-400' : 'text-white'
                                                }`}>
                                                {msg.subject}
                                            </p>

                                            <p className="text-sm text-gray-400 truncate flex items-center gap-1">
                                                {msg.body?.substring(0, 60)}...
                                            </p>
                                        </div>

                                        {/* Message Actions Menu */}
                                        <div className="relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowMessageMenu(showMessageMenu === msg.id ? null : msg.id);
                                                }}
                                                className="p-1 text-gray-400 hover:text-white rounded transition-colors"
                                            >
                                                <FontAwesomeIcon icon={faEllipsisV} className="w-4 h-4" />
                                            </button>

                                            {showMessageMenu === msg.id && (
                                                <div className="absolute right-0 top-6 bg-neutral-700 border border-gray-600 rounded-lg shadow-lg z-10 min-w-32">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleReadStatus(msg.id, msg.read);
                                                            setShowMessageMenu(null);
                                                        }}
                                                        className="w-full px-3 py-2 text-sm text-left text-gray-300 hover:bg-neutral-600 hover:text-white flex items-center gap-2"
                                                    >
                                                        <FontAwesomeIcon icon={msg.read ? faEyeSlash : faCheck} className="w-3 h-3" />
                                                        {msg.read ? 'Mark Unread' : 'Mark Read'}
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setConfirmDelete(msg.id);
                                                            setShowMessageMenu(null);
                                                        }}
                                                        className="w-full px-3 py-2 text-sm text-left text-red-400 hover:bg-red-400/10 flex items-center gap-2"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Message Detail View */}
            {selectedMessage && (
                <div className={`flex-1 flex flex-col ${selectedMessage ? 'flex' : 'hidden md:flex'}`}>
                    {/* Message Header */}
                    <div className="p-6 bg-neutral-800 border-b border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedMessage(null)}
                                    className="flex items-center gap-2 p-2 text-gray-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors"
                                >
                                    <FontAwesomeIcon icon={faRightLeft} className="w-4 h-4" />
                                    <span className="md:hidden">Back to List</span>
                                </button>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => toggleReadStatus(selectedMessage.id, selectedMessage.read)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${selectedMessage.read
                                        ? 'text-yellow-400 hover:bg-yellow-400/10'
                                        : 'text-green-400 hover:bg-green-400/10'
                                        }`}
                                >
                                    <FontAwesomeIcon icon={selectedMessage.read ? faEyeSlash : faCheck} className="w-4 h-4" />
                                    {selectedMessage.read ? 'Mark Unread' : 'Mark Read'}
                                </button>

                                <button
                                    onClick={() => setConfirmDelete(selectedMessage.id)}
                                    className="flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                >
                                    <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                                    Delete
                                </button>

                                <button className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:bg-neutral-700 rounded-lg transition-colors">
                                    <FontAwesomeIcon icon={faEllipsisV} className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                            {selectedMessage.hasAttachments && (
                                <FontAwesomeIcon icon={faPaperclip} className="w-5 h-5 text-gray-400" />
                            )}
                            {selectedMessage.subject}
                        </h1>

                        <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
                                <span className="text-white font-medium">{selectedMessage.senderName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faCalendar} className="w-4 h-4" />
                                <span>{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon
                                    icon={selectedMessage.read ? faCheckCircle : faCircle}
                                    className={`w-4 h-4 ${selectedMessage.read ? 'text-green-400' : 'text-yellow-400'}`}
                                />
                                <span>{selectedMessage.read ? 'Read' : 'Unread'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Message Body */}
                    <div className="flex-1 p-6 bg-neutral-800 overflow-y-auto">
                        <div className="prose prose-invert max-w-none">
                            <div className="bg-neutral-700 rounded-lg p-6">
                                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                                    {selectedMessage.body}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Message Actions */}
                    <div className="p-6 bg-neutral-800 border-t border-gray-700">
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                                <FontAwesomeIcon icon={faReply} className="w-4 h-4" />
                                Reply
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors">
                                <FontAwesomeIcon icon={faArchive} className="w-4 h-4" />
                                Archive
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors">
                                <FontAwesomeIcon icon={faRightLeft} className="w-4 h-4" />
                                Forward
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-neutral-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                            <FontAwesomeIcon icon={faTrash} className="w-5 h-5 text-red-400" />
                            <h3 className="text-lg font-semibold text-white">Delete Message</h3>
                        </div>
                        <p className="text-gray-300 mb-6">
                            Are you sure you want to delete this message? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white border border-gray-600 rounded-lg transition-colors"
                            >
                                <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
                                Cancel
                            </button>
                            <button
                                onClick={() => deleteMessage(confirmDelete)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                                <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}