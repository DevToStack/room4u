'use client';

import { useState } from 'react';
import { useSqlQuery } from '@/hooks/useSqlQuery';
import Toast from './toast';
import Editor from '@monaco-editor/react';

export default function SqlQueryRunner() {
    const [query, setQuery] = useState('');
    const [toast, setToast] = useState(null);
    const { executeQuery, loading, data, error, reset } = useSqlQuery();

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!query.trim()) {
            showToast('Please enter a SQL query', 'error');
            return;
        }

        try {
            await executeQuery(query);
            showToast('Query executed successfully!');
        } catch (err) {
            showToast(err.message || 'Failed to execute query', 'error');
        }
    };

    const handleClear = () => {
        setQuery('');
        reset();
    };

    const handleEditorChange = (value) => {
        setQuery(value || '');
    };

    const predefinedQueries = [
        { name: 'Select Users', query: 'SELECT * FROM users LIMIT 10' },
        { name: 'Select Apartments', query: 'SELECT * FROM apartments LIMIT 10' },
        { name: 'Select Bookings', query: 'SELECT * FROM bookings LIMIT 10' },
        { name: 'Count Users', query: 'SELECT COUNT(*) as user_count FROM users' },
        { name: 'Recent Bookings', query: 'SELECT b.*, u.name, a.title FROM bookings b JOIN users u ON b.user_id = u.id JOIN apartments a ON b.apartment_id = a.id ORDER BY b.created_at DESC LIMIT 5' }
    ];

    const editorOptions = {
        selectOnLineNumbers: true,
        roundedSelection: false,
        readOnly: false,
        cursorStyle: 'line',
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        lineHeight: 1.5,
        fontFamily: "'Fira Code', 'Courier New', monospace",
        wordWrap: 'on'
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Toast Notifications */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">SQL Query Runner</h1>

                {/* Predefined Queries */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-3">Quick Queries</h2>
                    <div className="flex flex-wrap gap-2">
                        {predefinedQueries.map((predefined, index) => (
                            <button
                                key={index}
                                onClick={() => setQuery(predefined.query)}
                                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                            >
                                {predefined.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Query Input Form */}
                <form onSubmit={handleSubmit} className="mb-6">
                    <div className="mb-4">
                        <label htmlFor="query" className="block text-sm font-medium text-black mb-2">
                            SQL Query
                        </label>
                        <div className="border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                            <Editor
                                height="200px"
                                defaultLanguage="sql"
                                value={query}
                                onChange={handleEditorChange}
                                options={editorOptions}
                                theme="vs-light"
                                loading={<div className="p-4 text-gray-500">Loading editor...</div>}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading || !query.trim()}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Executing...
                                </span>
                            ) : (
                                'Execute Query'
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleClear}
                            disabled={loading}
                            className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </form>

                {/* Rest of your component remains the same */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex items-center text-red-800 mb-2">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="font-semibold">SQL Error</span>
                        </div>
                        <p className="text-red-700 font-mono text-sm">{error.message}</p>
                        {error.code && (
                            <p className="text-red-600 text-sm mt-1">Error Code: {error.code}</p>
                        )}
                    </div>
                )}

                {data && (
                    <div className="bg-gray-50 rounded-lg p-4">
                        {/* Results display remains the same */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-black">Results</h3>
                            <div className="text-sm text-black">
                                {data.rowCount} {data.rowCount === 1 ? 'row' : 'rows'} returned
                            </div>
                        </div>

                        {data.fields && data.fields.length > 0 && (
                            <div className="mb-4">
                                <h4 className="text-sm font-medium text-black mb-2">Table Schema</h4>
                                <div className="bg-white rounded-md border border-gray-200 p-3">
                                    <div className="grid grid-cols-4 gap-4 text-xs font-mono">
                                        {data.fields.map((field, index) => (
                                            <div key={index} className="break-words">
                                                <div className="font-semibold text-black">{field.name}</div>
                                                <div className="text-black">{field.type}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {data.data && data.data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border border-gray-200 rounded-md">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            {Object.keys(data.data[0]).map((key) => (
                                                <th key={key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                                    {key}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {data.data.map((row, rowIndex) => (
                                            <tr key={rowIndex} className="hover:bg-gray-50">
                                                {Object.values(row).map((value, cellIndex) => (
                                                    <td key={cellIndex} className="px-4 py-2 text-sm text-gray-900 border-b">
                                                        {value === null ? (
                                                            <span className="text-gray-400 italic">NULL</span>
                                                        ) : typeof value === 'object' ? (
                                                            JSON.stringify(value)
                                                        ) : (
                                                            String(value)
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No data returned from query
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}