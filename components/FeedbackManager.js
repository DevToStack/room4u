'use client'
import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faSearch,
    faTrash,
    faSort,
    faSortUp,
    faSortDown,
    faComments
} from '@fortawesome/free-solid-svg-icons'

export default function FeedbackManager() {
    const [feedback, setFeedback] = useState([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({})
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        search: '',
        rating: '',
        sortBy: 'created_at',
        sortOrder: 'DESC'
    })

    const fetchFeedback = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: filters.page,
                limit: filters.limit,
                ...(filters.search && { search: filters.search }),
                ...(filters.rating && { rating: filters.rating }),
                sortBy: filters.sortBy,
                sortOrder: filters.sortOrder
            })

            const response = await fetch(`/api/admin/feedback?${params}`)
            const data = await response.json()

            if (data.success) {
                setFeedback(data.data)
                setPagination(data.pagination)
            }
        } catch (error) {
            console.error('Error fetching feedback:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchFeedback()
    }, [filters])

    const deleteFeedback = async (id) => {
        if (!confirm('Are you sure you want to delete this feedback?')) return

        try {
            const response = await fetch('/api/admin/feedback', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            })

            const data = await response.json()

            if (data.success) {
                fetchFeedback()
            } else {
                alert('Failed to delete feedback')
            }
        } catch (error) {
            console.error('Error deleting feedback:', error)
            alert('Failed to delete feedback')
        }
    }

    const handleSort = (column) => {
        setFilters(prev => ({
            ...prev,
            sortBy: column,
            sortOrder: prev.sortBy === column && prev.sortOrder === 'ASC' ? 'DESC' : 'ASC'
        }))
    }

    const getSortIcon = (column) => {
        if (filters.sortBy !== column) return faSort
        return filters.sortOrder === 'ASC' ? faSortUp : faSortDown
    }

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span
                key={i}
                className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-neutral-600'
                    }`}
            >
                ★
            </span>
        ))
    }

    return (
        <div className="bg-neutral-800 rounded-lg shadow-lg">
            {/* Filters */}
            <div className="p-6 border-b border-neutral-700">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <FontAwesomeIcon
                                icon={faSearch}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
                            />
                            <input
                                type="text"
                                placeholder="Search feedback or users..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                                className="w-full pl-10 pr-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                            />
                        </div>
                    </div>
                    <select
                        value={filters.rating}
                        onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value, page: 1 }))}
                        className="px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neutral-500"
                    >
                        <option value="">All Ratings</option>
                        {[1, 2, 3, 4, 5].map(rating => (
                            <option key={rating} value={rating}>
                                {rating} Star{rating > 1 ? 's' : ''}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-neutral-700">
                        <tr>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('username')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>User</span>
                                    <FontAwesomeIcon icon={getSortIcon('username')} className="text-xs" />
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                                Message
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('rating')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Rating</span>
                                    <FontAwesomeIcon icon={getSortIcon('rating')} className="text-xs" />
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider cursor-pointer"
                                onClick={() => handleSort('created_at')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Date</span>
                                    <FontAwesomeIcon icon={getSortIcon('created_at')} className="text-xs" />
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-700">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center">
                                    <div className="flex justify-center">
                                        <div className="loading-spinner"></div>
                                    </div>
                                </td>
                            </tr>
                        ) : feedback.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-neutral-400">
                                    <FontAwesomeIcon icon={faComments} className="text-4xl mb-2 block" />
                                    No feedback found
                                </td>
                            </tr>
                        ) : (
                            feedback.map((item) => (
                                <tr key={item.id} className="hover:bg-neutral-750">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-white">{item.username || 'Anonymous'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-neutral-300 max-w-md truncate">
                                            {item.message}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-1">
                                            {renderStars(item.rating)}
                                            <span className="text-sm text-neutral-400 ml-2">({item.rating})</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => deleteFeedback(item.id)}
                                            className="text-red-400 hover:text-red-300 transition-colors"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {!loading && feedback.length > 0 && (
                <div className="px-6 py-4 border-t border-neutral-700 flex items-center justify-between">
                    <div className="text-sm text-neutral-400">
                        Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, pagination.totalItems)} of {pagination.totalItems} results
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                            disabled={filters.page === 1}
                            className="px-3 py-1 bg-neutral-700 border border-neutral-600 rounded text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-600 transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                            disabled={filters.page >= pagination.totalPages}
                            className="px-3 py-1 bg-neutral-700 border border-neutral-600 rounded text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-600 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}