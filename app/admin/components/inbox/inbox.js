'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEnvelope,
    faSpinner,
    faSearch,
    faRefresh,
    faRightLeft,
    faTrash,
    faEllipsisV,
    faUser,
    faCalendar,
    faPaperclip,
    faMessage,
    faFilter,
    faTimes,
    faCheck
} from '@fortawesome/free-solid-svg-icons';

export default function Inbox() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [contextMenu, setContextMenu] = useState(null);
    const [filters, setFilters] = useState({
        dateRange: { start: '', end: '' },
        subjects: [],
        status: 'all'
    });

    // Available subjects for filtering
    const availableSubjects = ['Booking', 'Payment', 'New User', 'Support', 'General'];

    const fetchMessages = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/inbox', { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch messages');
            const data = await res.json();
            setUsers(data.users || []);
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
        let filtered = users;

        if (statusFilter === 'unread') {
            filtered = filtered.filter(user => user.unreadCount > 0);
        } else if (statusFilter === 'read') {
            filtered = filtered.filter(user => user.unreadCount === 0 && user.totalMessages > 0);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(user =>
                user.userInfo.name?.toLowerCase().includes(term) ||
                user.userInfo.email?.toLowerCase().includes(term) ||
                user.latestSubject?.toLowerCase().includes(term) ||
                user.latestMessage?.toLowerCase().includes(term)
            );
        }

        setFilteredUsers(filtered);
    }, [users, statusFilter, searchTerm]);

    // Mark as read function
    const markAsRead = async (messageId, userId = null) => {
        try {
            const response = await fetch('/api/admin/inbox', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    messageId: messageId,
                    userId: userId,
                    markAs: 'read'
                }),
            });

            if (response.ok) {
                setUsers(prev => prev.map(user => {
                    if (userId && user.userInfo.id === userId) {
                        const updatedMessages = user.messages.map(msg =>
                            msg.direction !== 'outgoing' ? { ...msg, read: true } : msg
                        );
                        return {
                            ...user,
                            messages: updatedMessages,
                            unreadCount: 0
                        };
                    } else if (messageId) {
                        const updatedMessages = user.messages.map(msg =>
                            msg.id === messageId ? { ...msg, read: true } : msg
                        );
                        return {
                            ...user,
                            messages: updatedMessages,
                            unreadCount: updatedMessages.filter(msg => !msg.read && msg.direction !== 'outgoing').length
                        };
                    }
                    return user;
                }));

                if (selectedMessage?.id === messageId) {
                    setSelectedMessage(prev => ({ ...prev, read: true }));
                }

                if (userId && selectedUser?.userInfo.id === userId) {
                    setSelectedUser(prev => prev ? {
                        ...prev,
                        unreadCount: 0,
                        messages: prev.messages.map(msg =>
                            msg.direction !== 'outgoing' ? { ...msg, read: true } : msg
                        )
                    } : null);
                }
            }
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    };

    const deleteMessage = async (messageId, userId = null) => {
        try {
            const url = userId
                ? `/api/admin/inbox?userId=${userId}`
                : `/api/admin/inbox?id=${messageId}`;

            const res = await fetch(url, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (res.ok) {
                if (userId) {
                    setUsers(prev => prev.filter(user => user.userInfo.id !== userId));
                    if (selectedUser?.userInfo.id === userId) {
                        setSelectedUser(null);
                        setSelectedMessage(null);
                    }
                } else {
                    setUsers(prev => prev.map(user => ({
                        ...user,
                        messages: user.messages.filter(msg => msg.id !== messageId),
                        totalMessages: user.messages.length - 1,
                        unreadCount: user.messages.filter(msg =>
                            msg.id !== messageId && !msg.read && msg.direction !== 'outgoing'
                        ).length
                    })));

                    if (selectedMessage?.id === messageId) {
                        setSelectedMessage(null);
                    }
                }
                setConfirmDelete(null);
                setContextMenu(null);
            }
        } catch (err) {
            console.error('Error deleting message:', err);
        }
    };

    // Auto-mark as read when message is displayed
    const handleMessageSelection = async (message) => {
        setSelectedMessage(message);
        if (message && !message.read && message.direction !== 'outgoing') {
            await markAsRead(message.id);
        }
    };

    // Auto-mark all as read when user is selected
    const handleUserSelection = async (user) => {
        setSelectedUser(user);
        if (user.unreadCount > 0) {
            await markAsRead(null, user.userInfo.id);
        }
        if (Array.isArray(user.messages) && user.messages.length > 0) {
            handleMessageSelection(user.messages[0]);
        } else {
            setSelectedMessage(null);
        }
    };

    const getTotalUnreadCount = () => users.reduce((total, user) => total + user.unreadCount, 0);

    const formatDate = (dateString) => {
        if (!dateString) return 'No date';
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

    // Generate consistent color based on subject
    const getSubjectColor = (subject) => {
        const colors = {
            'Booking': 'bg-blue-500',
            'Payment': 'bg-green-500',
            'New User': 'bg-purple-500',
            'Support': 'bg-orange-500',
            'General': 'bg-gray-500'
        };
        return colors[subject] || 'bg-gray-500';
    };

    // Context menu handlers
    const handleContextMenu = (e, type, data) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            type,
            data
        });
    };

    const closeContextMenu = () => {
        setContextMenu(null);
    };

    // Apply filters
    const applyFilters = () => {
        // Implement your filter logic here
        console.log('Applying filters:', filters);
        setShowFilterModal(false);
    };

    // Clear filters
    const clearFilters = () => {
        setFilters({
            dateRange: { start: '', end: '' },
            subjects: [],
            status: 'all'
        });
    };

    // Toggle subject in filter
    const toggleSubject = (subject) => {
        setFilters(prev => ({
            ...prev,
            subjects: prev.subjects.includes(subject)
                ? prev.subjects.filter(s => s !== subject)
                : [...prev.subjects, subject]
        }));
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
        <div className="flex h-screen bg-gray-900 overflow-hidden" onClick={closeContextMenu}>
            {/* Left Sidebar - Users List */}
            <div className={`w-full md:w-96 flex flex-col border-r border-gray-700 ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
                {/* Header */}
                <div className="p-4 bg-gray-800 border-b border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <FontAwesomeIcon icon={faEnvelope} className="w-6 h-6" />
                            Inbox
                            {getTotalUnreadCount() > 0 && (
                                <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                                    {getTotalUnreadCount()}
                                </span>
                            )}
                        </h1>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowFilterModal(true)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                title="Filter"
                            >
                                <FontAwesomeIcon icon={faFilter} className="w-4 h-4" />
                            </button>
                            <button
                                onClick={fetchMessages}
                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
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
                            placeholder="Search users or messages..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Quick Filters */}
                    <div className="flex gap-1 bg-gray-700 rounded-lg p-1">
                        {[
                            { key: 'all', label: 'All', count: users.length },
                            { key: 'unread', label: 'Unread', count: users.filter(user => user.unreadCount > 0).length }
                        ].map(filter => (
                            <button
                                key={filter.key}
                                onClick={() => setStatusFilter(filter.key)}
                                className={`flex-1 px-2 py-2 rounded-md text-sm font-medium transition-colors ${statusFilter === filter.key
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:text-white hover:bg-gray-600'
                                    }`}
                            >
                                {filter.label} ({filter.count})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Users List */}
                <div className="flex-1 overflow-y-auto">
                    {!filteredUsers.length ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                            <FontAwesomeIcon icon={faUser} className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-lg font-medium">No conversations found</p>
                        </div>
                    ) : (
                        <div className="">
                            {filteredUsers.map(user => (
                                <div
                                    key={user.userInfo.id}
                                    onClick={() => handleUserSelection(user)}
                                    onContextMenu={(e) => handleContextMenu(e, 'user', user)}
                                    className={`p-4 cursor-pointer transition-colors relative border-b border-gray-700 ${selectedUser?.userInfo.id === user.userInfo.id
                                        ? 'bg-blue-600/20 border-r-2 border-blue-500'
                                        : 'bg-gray-800 hover:bg-gray-700'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* User Avatar */}
                                        <div className="relative">
                                            <div
                                                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                                                style={{ backgroundColor: user.userInfo.color }}
                                            >
                                                <img
                                                    src={user.userInfo.logo}
                                                    alt={user.userInfo.name}
                                                    className="w-12 h-12 rounded-full"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                                <div
                                                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                                                    style={{ backgroundColor: user.userInfo.color, display: 'none' }}
                                                >
                                                    {user.userInfo.name?.charAt(0).toUpperCase()}
                                                </div>
                                            </div>
                                            {user.unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                    {user.unreadCount}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-semibold text-white truncate">
                                                    {user.userInfo.name}
                                                </h3>
                                                <span className="text-xs text-gray-400">
                                                    {formatDate(user.latestCreatedAt)}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-1 rounded-full text-xs ${getSubjectColor(user.latestSubject)} text-white`}>
                                                    {user.latestSubject}
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-400 truncate">
                                                {user.latestMessage?.substring(0, 80)}...
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side - Messages for Selected User */}
            {selectedUser && (
                <div className={`flex-1 flex flex-col bg-gray-100 ${selectedUser ? 'flex' : 'hidden md:flex'}`}>
                    {/* Messages Header */}
                    <div className="p-4 bg-green-600 text-white">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => {
                                    setSelectedUser(null);
                                    setSelectedMessage(null);
                                }}
                                className="flex items-center gap-2 p-2 text-white/80 hover:text-white hover:bg-green-700 rounded-lg transition-colors md:hidden"
                            >
                                <FontAwesomeIcon icon={faRightLeft} className="w-4 h-4" />
                                <span>Back</span>
                            </button>
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                                    style={{ backgroundColor: selectedUser.userInfo.color }}
                                >
                                    {selectedUser.userInfo.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="font-semibold">{selectedUser.userInfo.name}</h2>
                                    <p className="text-sm text-white/80">Online</p>
                                </div>
                            </div>
                            <div className="w-8"></div>
                        </div>
                    </div>

                    {/* Messages List - WhatsApp Style */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-100 bg-chat-pattern">
                        <div className="space-y-2">
                            {selectedUser.messages.map((message) => (
                                <div
                                    key={message.id}
                                    onContextMenu={(e) => handleContextMenu(e, 'message', message)}
                                    className={`flex ${message.isAdmin ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-2 ${message.isAdmin
                                            ? 'bg-green-500 text-white rounded-br-none'
                                            : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                                            }`}
                                    >
                                        {/* Message Header with Subject Color */}
                                        <div className={`${getSubjectColor(message.subject)} text-white px-2 py-1 rounded-t-lg -mx-2 -mt-2 mb-1 text-xs font-medium`}>
                                            {message.subject}
                                        </div>

                                        <p className="text-sm whitespace-pre-wrap">{message.body}</p>

                                        <div className={`flex items-center justify-between mt-1 text-xs ${message.isAdmin ? 'text-green-100' : 'text-gray-500'}`}>
                                            <span>{formatDate(message.createdAt)}</span>
                                            {message.isAdmin && (
                                                <span>{message.read ? '✓✓' : '✓'}</span>
                                            )}
                                        </div>

                                        {message.attachments && message.attachments.length > 0 && (
                                            <div className="flex items-center gap-1 mt-2 text-xs text-blue-300">
                                                <FontAwesomeIcon icon={faPaperclip} className="w-3 h-3" />
                                                <span>{message.attachments.length} attachment(s)</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="fixed bg-white border border-gray-300 rounded-lg shadow-lg z-50 py-1 min-w-32"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                >
                    {contextMenu.type === 'user' && (
                        <>
                            <button
                                onClick={() => {
                                    markAsRead(null, contextMenu.data.userInfo.id);
                                    setContextMenu(null);
                                }}
                                className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                                <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                                Mark All Read
                            </button>
                            <button
                                onClick={() => {
                                    setConfirmDelete({ type: 'user', id: contextMenu.data.userInfo.id });
                                    setContextMenu(null);
                                }}
                                className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                                <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                                Delete All
                            </button>
                        </>
                    )}
                    {contextMenu.type === 'message' && (
                        <button
                            onClick={() => {
                                setConfirmDelete({ type: 'message', id: contextMenu.data.id });
                                setContextMenu(null);
                            }}
                            className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                            Delete Message
                        </button>
                    )}
                </div>
            )}

            {/* Filter Modal */}
            {showFilterModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Filter Messages</h3>
                            <button
                                onClick={() => setShowFilterModal(false)}
                                className="p-1 text-gray-400 hover:text-white"
                            >
                                <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Date Range */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="date"
                                    value={filters.dateRange.start}
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        dateRange: { ...prev.dateRange, start: e.target.value }
                                    }))}
                                    className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                                />
                                <input
                                    type="date"
                                    value={filters.dateRange.end}
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        dateRange: { ...prev.dateRange, end: e.target.value }
                                    }))}
                                    className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                                />
                            </div>
                        </div>

                        {/* Subjects */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Subjects</label>
                            <div className="space-y-2">
                                {availableSubjects.map(subject => (
                                    <label key={subject} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={filters.subjects.includes(subject)}
                                            onChange={() => toggleSubject(subject)}
                                            className="mr-2 bg-gray-700 border-gray-600"
                                        />
                                        <span className="text-gray-300 text-sm">{subject}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Status */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                            >
                                <option value="all">All Messages</option>
                                <option value="unread">Unread Only</option>
                                <option value="read">Read Only</option>
                            </select>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 text-gray-300 hover:text-white border border-gray-600 rounded-lg transition-colors text-sm"
                            >
                                Clear
                            </button>
                            <button
                                onClick={applyFilters}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                            <FontAwesomeIcon icon={faTrash} className="w-5 h-5 text-red-400" />
                            <h3 className="text-lg font-semibold text-white">
                                {confirmDelete.type === 'user' ? 'Delete All Messages' : 'Delete Message'}
                            </h3>
                        </div>
                        <p className="text-gray-300 mb-6">
                            {confirmDelete.type === 'user'
                                ? `Are you sure you want to delete all messages from ${selectedUser?.userInfo.name}? This action cannot be undone.`
                                : 'Are you sure you want to delete this message? This action cannot be undone.'
                            }
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="px-4 py-2 text-gray-300 hover:text-white border border-gray-600 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (confirmDelete.type === 'user') {
                                        deleteMessage(null, confirmDelete.id);
                                    } else {
                                        deleteMessage(confirmDelete.id);
                                    }
                                }}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}