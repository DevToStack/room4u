// app/dashboard/components/SettingsIndividual.js
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEdit,
    faSave,
    faTimes,
    faTrash,
    faExclamationTriangle,
    faLock
} from '@fortawesome/free-solid-svg-icons';
import Card from './Card';
import UserActivity from './UserActivity';

// Validation utilities
const validateEmail = (email) => {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePhone = (phone) => {
    if (!phone) return true;
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    return phoneRegex.test(phone);
};

const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    return nameRegex.test(name.trim());
};

export default function Settings() {
    const router = useRouter();
    const [editingField, setEditingField] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        altEmail: '',
        phone: '',
        altPhone: ''
    });
    const [originalData, setOriginalData] = useState({});
    const [activities, setActivities] = useState([]);
    const [validationErrors, setValidationErrors] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch user data
    useEffect(() => {
        const fetchSettingsData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/dashboard/settings', {
                    credentials: 'include'
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        router.push('/login');
                        return;
                    }
                    throw new Error('Failed to fetch settings data');
                }

                const settingsData = await response.json();
                const profileData = {
                    name: settingsData.profile?.name || '',
                    email: settingsData.profile?.email || '',
                    altEmail: settingsData.profile?.altEmail || '',
                    phone: settingsData.profile?.phone || '',
                    altPhone: settingsData.profile?.altPhone || ''
                };

                setFormData(profileData);
                setOriginalData(profileData);
                setActivities(settingsData.activities || []);
            } catch (error) {
                console.error('Settings data fetch error:', error);
                setValidationErrors({
                    fetch: 'Failed to load settings data. Please refresh the page.'
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettingsData();
    }, [router]);

    const validateField = (field, value) => {
        switch (field) {
            case 'name':
                return validateName(value) ? '' : 'Name must be 2-50 characters and contain only letters and spaces';
            case 'altEmail':
                return !value || validateEmail(value) ? '' : 'Please enter a valid alternate email address';
            case 'altPhone':
                return !value || validatePhone(value) ? '' : 'Please enter a valid alternate phone number';
            default:
                return '';
        }
    };

    const handleEdit = (field) => {
        // Only allow editing for editable fields
        const editableFields = ['name', 'altEmail', 'altPhone'];
        if (editableFields.includes(field)) {
            setEditingField(field);
            setValidationErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleSave = async (field) => {
        const value = formData[field];
        const error = validateField(field, value);

        if (error) {
            setValidationErrors(prev => ({ ...prev, [field]: error }));
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch('/api/dashboard/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify({ [field]: value }),
                credentials: 'include'
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to update profile');
            }

            // Update original data and exit edit mode
            setOriginalData(prev => ({ ...prev, [field]: value }));
            setEditingField(null);
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });

            // Refresh activities
            const settingsResponse = await fetch('/api/dashboard/settings', {
                credentials: 'include'
            });
            if (settingsResponse.ok) {
                const settingsData = await settingsResponse.json();
                setActivities(settingsData.activities || []);
            }
        } catch (error) {
            console.error('Update error:', error);
            setValidationErrors(prev => ({
                ...prev,
                submit: error.message || 'Failed to update. Please try again.'
            }));
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = (field) => {
        setFormData(prev => ({ ...prev, [field]: originalData[field] }));
        setEditingField(null);
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear field error when user starts typing
        if (validationErrors[field]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleDangerousAction = async (action, confirmationMessage) => {
        if (!window.confirm(confirmationMessage)) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/dashboard/user/${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
                credentials: 'include'
            });

            const result = await response.json();

            if (result.success) {
                if (action === 'delete-account') {
                    router.push('/goodbye');
                } else {
                    window.location.reload();
                }
            } else {
                throw new Error(result.message || `Failed to ${action}`);
            }
        } catch (error) {
            console.error(`${action} error:`, error);
            alert(error.message || `Failed to ${action}. Please try again.`);
        } finally {
            setIsLoading(false);
        }
    };

    const ProfileField = ({ label, field, type = 'text', editable = true }) => (
        <div className="flex flex-col items-center justify-left py-3 border-b border-gray-700 last:border-b-0">

            <div className="flex justify-between items-center w-full">
                <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
                {editingField === field && editable ? (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleSave(field)}
                            disabled={isSaving}
                            className="px-3 py-2 text-green-400 bg-green-900/30 rounded-xl disabled:opacity-50 transition-colors duration-200 space-x-1"
                        >
                            <FontAwesomeIcon icon={faSave} />
                            <span>Save</span>
                        </button>
                        <button
                            onClick={() => handleCancel(field)}
                            disabled={isSaving}
                            className="px-3 py-2 text-red-400 bg-red-900/30 rounded-xl disabled:opacity-50 transition-colors duration-200 space-x-1"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                            <span>Cancel</span>
                        </button>
                    </div>
                ) : (
                    editable && (
                        <button
                            onClick={() => handleEdit(field)}
                            disabled={isLoading || isSaving}
                            className="px-3 py-2 text-neutral-200 bg-gray-700 rounded-xl disabled:opacity-50 transition-colors duration-200 space-x-1"
                        >
                            <FontAwesomeIcon icon={faEdit} />
                            <span>Edit</span>
                        </button>
                    )
                )}
            </div>
            <div className="w-full mt-1">
                
                {editingField === field && editable ? (
                    <div>
                        <input
                            type={type}
                            value={formData[field]}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                            className={`w-full px-3 py-2 border rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-700 text-white placeholder-gray-400 ${validationErrors[field] ? 'border-red-500' : 'border-gray-600'
                                }`}
                            disabled={isSaving}
                            autoFocus
                        />
                        {validationErrors[field] && (
                            <p className="text-red-400 text-xs mt-1 flex items-center">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                                {validationErrors[field]}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center">
                        <p className="text-white break-words">{formData[field] || 'Not set'}</p>
                        {!editable && (
                            <FontAwesomeIcon
                                icon={faLock}
                                className="ml-2 text-gray-400 text-xs"
                                title="This field cannot be edited"
                            />
                        )}
                    </div>
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

            {validationErrors.fetch && (
                <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-2xl">
                    {validationErrors.fetch}
                </div>
            )}

            {validationErrors.submit && (
                <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-2xl">
                    {validationErrors.submit}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6 bg-gray-800 border-gray-700">
                        <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
                        <div className="space-y-1">
                            <ProfileField label="Full Name" field="name" editable={true} />
                            <ProfileField label="Email" field="email" type="email" editable={false} />
                            <ProfileField label="Alternate Email" field="altEmail" type="email" editable={true} />
                            <ProfileField label="Phone" field="phone" type="tel" editable={false} />
                            <ProfileField label="Alternate Phone" field="altPhone" type="tel" editable={true} />
                        </div>
                    </Card>

                    <Card className="p-6 border-2 border-red-900/50 bg-red-900/10">
                        <h2 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h2>
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="font-medium text-red-400">Delete Account</h3>
                                    <p className="text-red-500 text-sm">Permanently delete your account and all data</p>
                                </div>
                                <button
                                    onClick={() => handleDangerousAction(
                                        'delete-account',
                                        'This will permanently delete your account and all data. This action cannot be undone. Are you sure?'
                                    )}
                                    disabled={isLoading || isSaving}
                                    className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-500 disabled:opacity-50 transition-colors duration-200 w-full sm:w-auto"
                                >
                                    <FontAwesomeIcon icon={faTrash} className="mr-2" />
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <UserActivity activities={activities} />
                </div>
            </div>
        </div>
    );
}