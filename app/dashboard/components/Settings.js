// app/dashboard/components/Settings.js
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEdit,
    faSave,
    faTimes,
    faBell,
    faEnvelope,
    faTrash,
    faUserSlash,
    faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import Card from './Card';
import UserActivity from './UserActivity';

// Input validation utilities
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePhone = (phone) => {
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    return phoneRegex.test(phone);
};

const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    return nameRegex.test(name.trim());
};

const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

export default function Settings({ data }) {
    const router = useRouter();
    const [editingField, setEditingField] = useState(null);
    const [formData, setFormData] = useState({});
    const [preferences, setPreferences] = useState({});
    const [validationErrors, setValidationErrors] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [csrfToken, setCsrfToken] = useState('');

    // Initialize CSRF token
    useEffect(() => {
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        setCsrfToken(token);
    }, []);

    // Secure data initialization with validation
    useEffect(() => {
        if (data) {
            try {
                // Validate incoming data structure
                if (!data.profile || !data.preferences || !data.activities) {
                    throw new Error('Invalid data structure');
                }

                // Sanitize and set form data
                const sanitizedProfile = {
                    name: sanitizeInput(data.profile.name || ''),
                    email: sanitizeInput(data.profile.email || ''),
                    altEmail: sanitizeInput(data.profile.altEmail || ''),
                    phone: sanitizeInput(data.profile.phone || ''),
                    altPhone: sanitizeInput(data.profile.altPhone || '')
                };

                const sanitizedPreferences = {
                    dateFormat: data.preferences.dateFormat || 'DD/MM/YYYY',
                    timezone: data.preferences.timezone || 'IST',
                    currency: data.preferences.currency || 'INR',
                    emailNotifications: !!data.preferences.emailNotifications,
                    smsNotifications: !!data.preferences.smsNotifications
                };

                setFormData(sanitizedProfile);
                setPreferences(sanitizedPreferences);
                setIsLoading(false);
            } catch (error) {
                console.error('Data initialization error:', error);
                router.push('/error');
            }
        }
    }, [data, router]);

    const validateField = (field, value) => {
        const errors = {};

        switch (field) {
            case 'name':
                if (!validateName(value)) {
                    errors.name = 'Name must be 2-50 characters and contain only letters and spaces';
                }
                break;
            case 'email':
                if (value && !validateEmail(value)) {
                    errors.email = 'Please enter a valid email address';
                }
                break;
            case 'altEmail':
                if (value && !validateEmail(value)) {
                    errors.altEmail = 'Please enter a valid alternate email address';
                }
                break;
            case 'phone':
                if (value && !validatePhone(value)) {
                    errors.phone = 'Please enter a valid phone number';
                }
                break;
            case 'altPhone':
                if (value && !validatePhone(value)) {
                    errors.altPhone = 'Please enter a valid alternate phone number';
                }
                break;
            default:
                break;
        }

        return errors;
    };

    const handleEdit = (field) => {
        setEditingField(field);
        setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    };

    const handleSave = async (field) => {
        const value = formData[field];
        const fieldErrors = validateField(field, value);

        if (Object.keys(fieldErrors).length > 0) {
            setValidationErrors(fieldErrors);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken,
                },
                body: JSON.stringify({ [field]: value }),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const result = await response.json();

            if (result.success) {
                setEditingField(null);
                setValidationErrors({});
                // Optional: Show success message
            } else {
                throw new Error(result.message || 'Update failed');
            }
        } catch (error) {
            console.error('Update error:', error);
            setValidationErrors({
                submit: 'Failed to update. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: sanitizeInput(data.profile.name || ''),
            email: sanitizeInput(data.profile.email || ''),
            altEmail: sanitizeInput(data.profile.altEmail || ''),
            phone: sanitizeInput(data.profile.phone || ''),
            altPhone: sanitizeInput(data.profile.altPhone || '')
        });
        setEditingField(null);
        setValidationErrors({});
    };

    const handlePreferenceUpdate = async (updates) => {
        try {
            const response = await fetch('/api/user/preferences', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken,
                },
                body: JSON.stringify(updates),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to update preferences');
            }
        } catch (error) {
            console.error('Preference update error:', error);
        }
    };

    const handleDangerousAction = async (action, confirmationMessage) => {
        if (!window.confirm(confirmationMessage)) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/user/${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken,
                },
                credentials: 'include'
            });

            if (response.ok) {
                if (action === 'delete-account') {
                    router.push('/goodbye');
                } else {
                    window.location.reload();
                }
            } else {
                throw new Error(`Failed to ${action}`);
            }
        } catch (error) {
            console.error(`${action} error:`, error);
            alert(`Failed to ${action}. Please try again.`);
        } finally {
            setIsLoading(false);
        }
    };

    const ProfileField = ({ label, value, field, type = 'text' }) => (
        <div className="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0">
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
                {editingField === field ? (
                    <div>
                        <input
                            type={type}
                            value={formData[field]}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                [field]: sanitizeInput(e.target.value)
                            }))}
                            className={`w-full px-3 py-2 border rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-700 text-white placeholder-gray-400 ${validationErrors[field]
                                    ? 'border-red-500'
                                    : 'border-gray-600'
                                }`}
                            disabled={isLoading}
                            maxLength={type === 'email' ? 254 : 50}
                        />
                        {validationErrors[field] && (
                            <p className="text-red-400 text-xs mt-1 flex items-center">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                                {validationErrors[field]}
                            </p>
                        )}
                    </div>
                ) : (
                    <p className="text-white break-words">{value || 'Not set'}</p>
                )}
            </div>
            <div className="ml-4">
                {editingField === field ? (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleSave(field)}
                            disabled={isLoading}
                            className="p-2 text-green-400 hover:bg-green-900/30 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            <FontAwesomeIcon icon={faSave} />
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={isLoading}
                            className="p-2 text-red-400 hover:bg-red-900/30 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => handleEdit(field)}
                        disabled={isLoading}
                        className="p-2 text-gray-400 hover:text-teal-400 hover:bg-gray-700 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        <FontAwesomeIcon icon={faEdit} />
                    </button>
                )}
            </div>
        </div>
    );

    if (isLoading && !formData.name) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Settings</h1>

            {validationErrors.submit && (
                <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-2xl">
                    {validationErrors.submit}
                </div>
            )}

            {/* Profile Information */}
            <Card className="p-6 bg-gray-800 border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
                <div className="space-y-1">
                    <ProfileField label="Full Name" value={formData.name} field="name" />
                    <ProfileField label="Email" value={formData.email} field="email" type="email" />
                    <ProfileField label="Alternate Email" value={formData.altEmail} field="altEmail" type="email" />
                    <ProfileField label="Phone" value={formData.phone} field="phone" type="tel" />
                    <ProfileField label="Alternate Phone" value={formData.altPhone} field="altPhone" type="tel" />
                </div>
            </Card>

            {/* Preferences */}
            <Card className="p-6 bg-gray-800 border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-6">Preferences</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Date Format</label>
                        <select
                            value={preferences.dateFormat}
                            onChange={(e) => {
                                const newPreferences = { ...preferences, dateFormat: e.target.value };
                                setPreferences(newPreferences);
                                handlePreferenceUpdate({ dateFormat: e.target.value });
                            }}
                            disabled={isLoading}
                            className="w-full px-3 py-2 border border-gray-600 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-700 text-white disabled:opacity-50"
                        >
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
                        <select
                            value={preferences.timezone}
                            onChange={(e) => {
                                const newPreferences = { ...preferences, timezone: e.target.value };
                                setPreferences(newPreferences);
                                handlePreferenceUpdate({ timezone: e.target.value });
                            }}
                            disabled={isLoading}
                            className="w-full px-3 py-2 border border-gray-600 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-700 text-white disabled:opacity-50"
                        >
                            <option value="IST">India Standard Time (IST)</option>
                            <option value="UTC">UTC</option>
                            <option value="EST">Eastern Standard Time (EST)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
                        <select
                            value={preferences.currency}
                            onChange={(e) => {
                                const newPreferences = { ...preferences, currency: e.target.value };
                                setPreferences(newPreferences);
                                handlePreferenceUpdate({ currency: e.target.value });
                            }}
                            disabled={isLoading}
                            className="w-full px-3 py-2 border border-gray-600 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-700 text-white disabled:opacity-50"
                        >
                            <option value="INR">Indian Rupee (₹)</option>
                            <option value="USD">US Dollar ($)</option>
                            <option value="EUR">Euro (€)</option>
                        </select>
                    </div>
                </div>

                {/* Notification Toggles */}
                <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-medium text-white">Notifications</h3>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <FontAwesomeIcon icon={faEnvelope} className="text-teal-400 mr-3" />
                            <span className="text-gray-300">Email Notifications</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={preferences.emailNotifications}
                                onChange={(e) => {
                                    const newPreferences = { ...preferences, emailNotifications: e.target.checked };
                                    setPreferences(newPreferences);
                                    handlePreferenceUpdate({ emailNotifications: e.target.checked });
                                }}
                                disabled={isLoading}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600 disabled:opacity-50"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <FontAwesomeIcon icon={faBell} className="text-teal-400 mr-3" />
                            <span className="text-gray-300">SMS Notifications</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={preferences.smsNotifications}
                                onChange={(e) => {
                                    const newPreferences = { ...preferences, smsNotifications: e.target.checked };
                                    setPreferences(newPreferences);
                                    handlePreferenceUpdate({ smsNotifications: e.target.checked });
                                }}
                                disabled={isLoading}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600 disabled:opacity-50"></div>
                        </label>
                    </div>
                </div>
            </Card>

            {/* User Activity */}
            <UserActivity activities={data.activities} />

            {/* Danger Zone */}
            <Card className="p-6 border-2 border-red-900/50 bg-red-900/10">
                <h2 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-red-400">Deactivate Host Mode</h3>
                            <p className="text-red-500 text-sm">Temporarily disable your host account</p>
                        </div>
                        <button
                            onClick={() => handleDangerousAction(
                                'deactivate-host',
                                'Are you sure you want to deactivate host mode?'
                            )}
                            disabled={isLoading}
                            className="flex items-center px-4 py-2 border border-red-700 text-red-400 rounded-2xl hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            <FontAwesomeIcon icon={faUserSlash} className="mr-2" />
                            Deactivate
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-red-400">Delete Account</h3>
                            <p className="text-red-500 text-sm">Permanently delete your account and all data</p>
                        </div>
                        <button
                            onClick={() => handleDangerousAction(
                                'delete-account',
                                'This will permanently delete your account and all data. This action cannot be undone. Are you sure?'
                            )}
                            disabled={isLoading}
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            <FontAwesomeIcon icon={faTrash} className="mr-2" />
                            Delete Account
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
}