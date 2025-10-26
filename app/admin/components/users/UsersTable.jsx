import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt, faFilter, faSearch, faTimes, faChevronDown, faChevronUp, faShieldAlt, faCalendar, faSort, faUsers, faTrash } from '@fortawesome/free-solid-svg-icons';
import CompactStatCard from './CompactStatCard';
import UserDetailsModal from './UserDetailsModal';
import EditUserModal from './EditUserModal';
import ConfirmationModal from './ConfirmationModal';
import MessageModal from './MessageModal';

export default function UsersTable() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserDetails, setShowUserDetails] = useState(false);
    const [userDetails, setUserDetails] = useState([]);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        alternate_email: '',
        phone_number: '',
        alternate_phone: '',
        role: 'guest'
    });

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState(new Set());

    // Modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch users
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/users');

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data.users);
        } catch (err) {
            showError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Filter and sort users
    const filteredUsers = users
        .filter(user => {
            const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter === 'all' || user.role === roleFilter;

            const now = new Date();
            const userDate = new Date(user.created_at);
            const timeDiff = now.getTime() - userDate.getTime();
            const daysDiff = timeDiff / (1000 * 3600 * 24);

            let matchesDate = true;
            switch (dateFilter) {
                case 'today':
                    matchesDate = daysDiff < 1;
                    break;
                case 'week':
                    matchesDate = daysDiff < 7;
                    break;
                case 'month':
                    matchesDate = daysDiff < 30;
                    break;
                case 'year':
                    matchesDate = daysDiff < 365;
                    break;
            }

            return matchesSearch && matchesRole && matchesDate;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.created_at) - new Date(a.created_at);
                case 'oldest':
                    return new Date(a.created_at) - new Date(b.created_at);
                case 'name_asc':
                    return a.name?.localeCompare(b.name);
                case 'name_desc':
                    return b.name?.localeCompare(a.name);
                case 'most_bookings':
                    return b.total_bookings - a.total_bookings;
                case 'most_spent':
                    return (b.statistics?.total_spent || 0) - (a.statistics?.total_spent || 0);
                default:
                    return 0;
            }
        });

    // Fetch user details
    const fetchUserDetails = async (userId) => {
        try {
            setDetailsLoading(true);
            const response = await fetch(`/api/admin/users/${userId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch user details');
            }

            const data = await response.json();
            setUserDetails(data);
            setSelectedUser(userId);
            setShowUserDetails(true);
        } catch (err) {
            showError(err.message);
        } finally {
            setDetailsLoading(false);
        }
    };

    // Show success modal
    const showSuccess = (message) => {
        setSuccessMessage(message);
        setShowSuccessModal(true);
    };

    // Show error modal
    const showError = (message) => {
        setErrorMessage(message);
        setShowErrorModal(true);
    };

    // Delete user confirmation
    const confirmDelete = (userId, userName) => {
        setUserToDelete({ id: userId, name: userName });
        setShowDeleteModal(true);
    };

    // Execute delete after confirmation
    const executeDelete = async () => {
        if (!userToDelete) return;

        try {
            const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete user');
            }

            setUsers(users.filter(user => user.id !== userToDelete.id));
            if (showUserDetails && selectedUser === userToDelete.id) {
                setShowUserDetails(false);
            }
            setShowDeleteModal(false);
            setUserToDelete(null);
            showSuccess(`User "${userToDelete.name}" deleted successfully`);
        } catch (err) {
            showError(err.message);
        }
    };

    // Edit user - open edit modal
    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name || '',
            email: user.email || '',
            alternate_email: user.alternate_email || '',
            phone_number: user.phone_number || '',
            alternate_phone: user.alternate_phone || '',
            role: user.role || 'guest'
        });
        setShowEditModal(true);
    };

    // Update user
    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/admin/users/${editingUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update user');
            }

            // Update user in local state
            setUsers(users.map(user =>
                user.id === editingUser.id
                    ? { ...user, ...formData }
                    : user
            ));

            // Refresh user details if open
            if (showUserDetails && selectedUser === editingUser.id) {
                fetchUserDetails(editingUser.id);
            }

            setShowEditModal(false);
            setEditingUser(null);
            showSuccess(`User "${formData.name}" updated successfully`);
        } catch (err) {
            showError(err.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Select all users
    const toggleSelectAll = () => {
        if (selectedUsers.size === filteredUsers.length) {
            setSelectedUsers(new Set());
        } else {
            setSelectedUsers(new Set(filteredUsers.map(user => user.id)));
        }
    };

    // Toggle single user selection
    const toggleUserSelection = (userId) => {
        const newSelected = new Set(selectedUsers);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedUsers(newSelected);
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchTerm('');
        setRoleFilter('all');
        setDateFilter('all');
        setSortBy('newest');
        setSelectedUsers(new Set());
    };

    // Get filter stats
    const getFilterStats = () => {
        const totalUsers = users.length;
        const filteredCount = filteredUsers.length;
        const selectedCount = selectedUsers.size;

        return { totalUsers, filteredCount, selectedCount };
    };

    const { totalUsers, filteredCount, selectedCount } = getFilterStats();

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
        <div className="h-full p-4 sm:p-6 max-sm:pb-16 text-white">
            <div className="mx-auto">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                    <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                        <button
                            onClick={fetchUsers}
                            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 
                     border border-neutral-800 rounded-lg transition-colors duration-200 text-sm text-gray-300"
                        >
                            <FontAwesomeIcon icon={faSyncAlt} className="w-4 h-4 text-gray-400" />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Compact Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                    <CompactStatCard
                        title="Total Users"
                        value={totalUsers}
                        icon="users"
                        color="blue"
                        description="All registered users"
                    />
                    <CompactStatCard
                        title="Admins"
                        value={users.filter(u => u.role === 'admin').length}
                        icon="userShield"
                        color="purple"
                        description="Administrative users"
                    />
                    <CompactStatCard
                        title="Active Today"
                        value={users.filter(u => {
                            const userDate = new Date(u.created_at);
                            const today = new Date();
                            return userDate.toDateString() === today.toDateString();
                        }).length}
                        icon="calendarCheck"
                        color="green"
                        description="Joined today"
                    />
                    <CompactStatCard
                        title="Filtered"
                        value={filteredCount}
                        icon="filter"
                        color="orange"
                        description="Current results"
                    />
                </div>

                {/* Filters Bar */}
                <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <FontAwesomeIcon
                                icon={faSearch}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4"
                            />
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-white text-gray-300 placeholder-gray-500"
                            />
                        </div>

                        {/* Filter Controls */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 
                       border border-neutral-800 rounded-lg text-sm text-gray-300 transition-colors"
                            >
                                <FontAwesomeIcon icon={faFilter} className="w-4 h-4 text-gray-400" />
                                <span>Filters</span>
                                <FontAwesomeIcon
                                    icon={showFilters ? faChevronUp : faChevronDown}
                                    className="w-3 h-3 text-gray-400"
                                />
                            </button>

                            {(searchTerm || roleFilter !== "all" || dateFilter !== "all") && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white 
                         hover:bg-neutral-800 rounded-lg transition-colors"
                                >
                                    <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                                    <span>Clear</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Expanded Filters */}
                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-neutral-800">
                            {/* Role Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    <FontAwesomeIcon icon={faShieldAlt} className="w-3 h-3 mr-1" />
                                    Role
                                </label>
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-300"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="guest">Guest</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            {/* Date Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    <FontAwesomeIcon icon={faCalendar} className="w-3 h-3 mr-1" />
                                    Join Date
                                </label>
                                <select
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-300"
                                >
                                    <option value="all">All Time</option>
                                    <option value="today">Today</option>
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                    <option value="year">This Year</option>
                                </select>
                            </div>

                            {/* Sort By */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    <FontAwesomeIcon icon={faSort} className="w-3 h-3 mr-1" />
                                    Sort By
                                </label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-300"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="name_asc">Name A-Z</option>
                                    <option value="name_desc">Name Z-A</option>
                                    <option value="most_bookings">Most Bookings</option>
                                    <option value="most_spent">Most Spent</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Users Table with Vertical Scroll */}
                <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
                    {/* Table Header */}
                    <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.size > 0 && selectedUsers.size === filteredUsers.length}
                                    onChange={toggleSelectAll}
                                    className="rounded border-neutral-700 bg-neutral-950"
                                />
                                <span className="text-sm text-gray-400">
                                    {selectedCount > 0 ? `${selectedCount} selected` : `${filteredCount} users`}
                                </span>
                            </div>
                        </div>

                        {selectedCount > 0 && (
                            <div className="flex items-center gap-2">
                                <button className="flex items-center gap-2 px-3 py-1 text-sm text-red-400 hover:text-red-300 transition-colors">
                                    <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                                    <span>Delete Selected</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Scrollable Table Container */}
                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                        <table className="w-full">
                            <thead className="sticky top-0 bg-neutral-900 z-10">
                                <tr className="border-b border-neutral-800">
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.size > 0 && selectedUsers.size === filteredUsers.length}
                                            onChange={toggleSelectAll}
                                            className="rounded border-neutral-700 bg-neutral-950"
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">User</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Role</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Bookings</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Spent</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Joined</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <UserTableRow
                                        key={user.id}
                                        user={user}
                                        isSelected={selectedUsers.has(user.id)}
                                        onSelect={() => toggleUserSelection(user.id)}
                                        onViewDetails={() => fetchUserDetails(user.id)}
                                        onEdit={() => handleEdit(user)}
                                        onDelete={() => confirmDelete(user.id, user.name)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty State */}
                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12">
                            <FontAwesomeIcon icon={faUsers} className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-400 mb-2">No users found</h3>
                            <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* User Details Modal */}
            {showUserDetails && userDetails && (
                <UserDetailsModal
                    userDetails={userDetails}
                    loading={detailsLoading}
                    onClose={() => setShowUserDetails(false)}
                    onEdit={handleEdit}
                />
            )}

            {/* Edit User Modal */}
            {showEditModal && (
                <EditUserModal
                    formData={formData}
                    onInputChange={handleInputChange}
                    onSubmit={handleUpdate}
                    onClose={() => setShowEditModal(false)}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <ConfirmationModal
                    title="Delete User"
                    message={`Are you sure you want to delete user "${userToDelete?.name}"? This action cannot be undone and will delete all associated data including bookings, payments, and reviews.`}
                    confirmText="Delete User"
                    cancelText="Cancel"
                    onConfirm={executeDelete}
                    onCancel={() => {
                        setShowDeleteModal(false);
                        setUserToDelete(null);
                    }}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setUserToDelete(null);
                    }}
                    type="danger"
                />
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <MessageModal
                    title="Success"
                    message={successMessage}
                    type="success"
                    onClose={() => setShowSuccessModal(false)}
                />
            )}

            {/* Error Modal */}
            {showErrorModal && (
                <MessageModal
                    title="Error"
                    message={errorMessage}
                    type="error"
                    onClose={() => setShowErrorModal(false)}
                />
            )}
        </div>
    );
}

// User Table Row Component
function UserTableRow({ user, isSelected, onSelect, onViewDetails, onEdit, onDelete }) {
    const { faUser, faUserShield, faClipboardList, faDollarSign, faCalendar, faEye, faEdit, faTrash } = require('@fortawesome/free-solid-svg-icons');
    const { FontAwesomeIcon } = require('@fortawesome/react-fontawesome');
    console.log(user)
    return (
        <tr className="border-b border-neutral-800/50 hover:bg-neutral-800/40 transition-colors">
            <td className="px-4 py-3">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={onSelect}
                    className="rounded border-neutral-700 bg-neutral-950"
                />
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3">
                <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === "admin"
                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                        : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                        }`}
                >
                    <FontAwesomeIcon
                        icon={user.role === "admin" ? faUserShield : faUser}
                        className="w-3 h-3 mr-1"
                    />
                    {user.role}
                </span>
            </td>
            <td className="px-4 py-3 text-gray-300">
                <div className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faClipboardList} className="w-3 h-3 text-gray-500" />
                    {user.total_bookings}
                </div>
            </td>
            <td className="px-4 py-3 text-gray-300">
                <div className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faDollarSign} className="w-3 h-3 text-gray-500" />
                    {user?.total_spent || 0}
                </div>
            </td>
            <td className="px-4 py-3 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faCalendar} className="w-3 h-3 text-gray-500" />
                    {new Date(user.created_at).toLocaleDateString()}
                </div>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onViewDetails}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="View Details"
                    >
                        <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onEdit}
                        className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
                        title="Edit User"
                    >
                        <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete User"
                    >
                        <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
}