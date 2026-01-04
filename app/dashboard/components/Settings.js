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
    faLock,
    faSpinner
} from '@fortawesome/free-solid-svg-icons';
import Card from './Card';
import UserActivity from './UserActivity';

/* Validation utilities */
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
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    /* Fetch user data */
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
        if (validationErrors[field]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    /* Performs account deletion */
    const performAccountDeletion = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch('/api/dashboard/user/delete-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
                credentials: 'include'
            });

            const result = await response.json();

            if (result.success) {
                router.push('/goodbye');
            } else {
                throw new Error(result.message || 'Failed to delete account');
            }
        } catch (error) {
            console.error('Delete account error:', error);
            alert(error.message || 'Failed to delete account.');
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    /* Fallback dangerous action (kept for other actions) */
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

    /* Reusable profile field row */
    const ProfileField = ({ label, field, type = 'text', editable = true }) => {
        const isEditing = editingField === field && editable;
        const value = formData[field];

        return (
            <div className="flex flex-col w-full py-4 border-b border-neutral-700 last:border-b-0">
                <div className="flex flex-col gap-2 w-full">
                    <div className="flex justify-between flex items-center gap-2">
                        <label className="block text-sm font-medium text-neutral-300 w-full">{label}</label>
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => handleSave(field)}
                                    disabled={isSaving}
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-sm text-neutral-100 hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-neutral-600"
                                    aria-label={`Save ${label}`}
                                >
                                    <FontAwesomeIcon icon={faSave} />
                                    <span>Save</span>
                                </button>

                                <button
                                    onClick={() => handleCancel(field)}
                                    disabled={isSaving}
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-transparent border border-neutral-700 text-sm text-neutral-300 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-600"
                                    aria-label={`Cancel editing ${label}`}
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                    <span>Cancel</span>
                                </button>
                            </>
                        ) : (
                            editable ? (
                                <button
                                    onClick={() => handleEdit(field)}
                                    disabled={isLoading || isSaving}
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-transparent border border-neutral-700 text-sm text-neutral-200 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-600"
                                    aria-label={`Edit ${label}`}
                                >
                                    <FontAwesomeIcon icon={faEdit} />
                                    <span>Edit</span>
                                </button>
                            ) : (
                                <div className="text-neutral-400" title="Not editable">
                                    <FontAwesomeIcon icon={faLock} />
                                </div>
                            )
                        )}
                    </div>
                    <div className="flex-1 min-w-0">


                        {isEditing ? (
                            <div>
                                <input
                                    type={type}
                                    value={value}
                                    onChange={(e) => handleInputChange(field, e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-2xl bg-neutral-800 text-white placeholder-neutral-400 border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-neutral-500`}
                                    disabled={isSaving}
                                    aria-invalid={!!validationErrors[field]}
                                    aria-describedby={validationErrors[field] ? `${field}-error` : undefined}
                                    autoFocus
                                />
                                {validationErrors[field] && (
                                    <p id={`${field}-error`} className="text-xs mt-2 text-red-400 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faExclamationTriangle} />
                                        <span>{validationErrors[field]}</span>
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-neutral-200 truncate">{value || 'Not set'}</p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    /* Loading skeleton */
    if (isLoading && !formData.name) {
        return (
            <div className="h-screen text-white p-6 flex items-center justify-center"
                style={{ maxHeight: 'calc(100vh - 96px)' }}
            >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between gap-4 max-sm:hidden">
                <h1 className="text-2xl font-semibold text-neutral-100">Settings</h1>
            </div>

            {validationErrors.fetch && (
                <div className="rounded-2xl border border-red-800 bg-neutral-900/60 px-4 py-3 text-red-400">
                    {validationErrors.fetch}
                </div>
            )}

            {validationErrors.submit && (
                <div className="rounded-2xl border border-red-800 bg-neutral-900/60 px-4 py-3 text-red-400">
                    {validationErrors.submit}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main column */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6 bg-neutral-800 border border-neutral-700 shadow-sm">
                        <div className="flex flex-col">
                            <h2 className="text-lg font-semibold text-neutral-100">Profile Information</h2>
                            <p className="text-sm text-neutral-400">Manage your profile details</p>
                        </div>

                        <div className="mt-6">
                            <ProfileField label="Full Name" field="name" editable={true} />
                            <ProfileField label="Email" field="email" type="email" editable={false} />
                            <ProfileField label="Alternate Email" field="altEmail" type="email" editable={true} />
                            <ProfileField label="Phone" field="phone" type="tel" editable={false} />
                            <ProfileField label="Alternate Phone" field="altPhone" type="tel" editable={true} />
                        </div>
                    </Card>

                    {/* Additional card area (future) */}
                    <Card className="p-6 bg-neutral-800 border border-neutral-700 shadow-sm">
                        <h3 className="text-sm text-neutral-300 mb-2">Account Preferences</h3>
                        <p className="text-sm text-neutral-400">Manage additional settings and preferences here.</p>
                        {/* Placeholder area — keep lightweight */}
                    </Card>
                </div>

                {/* Sidebar */}
                <aside className="flex flex-col gap-6 lg:col-span-1">
                    <UserActivity activities={activities} className="bg-neutral-800 border border-neutral-700" />

                    <Card className="p-6 bg-neutral-900 border border-red-600/40">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
                                    <p className="text-sm text-red-300">Permanently delete your account and all data</p>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    disabled={isLoading || isSaving}
                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-red-500 text-red-400 bg-transparent hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                    <span>Delete Account</span>
                                </button>
                            </div>
                        </div>
                    </Card>
                </aside>
            </div>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-modal-title"
                    className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6"
                >
                    {/* overlay */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
                        aria-hidden="true"
                    />

                    <div className="relative w-full max-w-lg mx-auto">
                        <div className="bg-neutral-800 border border-neutral-700 rounded-2xl p-6 shadow-2xl z-10">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 text-red-400 mt-1">
                                    <FontAwesomeIcon icon={faExclamationTriangle} size="lg" />
                                </div>

                                <div className="min-w-0">
                                    <h3 id="delete-modal-title" className="text-lg font-semibold text-neutral-100">
                                        Confirm Account Deletion
                                    </h3>
                                    <p className="text-sm text-neutral-300 mt-2">
                                        This action is <span className="font-medium text-red-400">permanent</span> and cannot be undone.
                                        Your profile, bookings and payments will be removed.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    disabled={isDeleting}
                                    className="px-4 py-2 rounded-xl bg-transparent border border-neutral-700 text-neutral-200 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-600"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={performAccountDeletion}
                                    disabled={isDeleting}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500 text-red-400 bg-transparent hover:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                                >
                                    {isDeleting ? (
                                        <FontAwesomeIcon icon={faSpinner} spin />
                                    ) : (
                                        <FontAwesomeIcon icon={faTrash} />
                                    )}
                                    <span>Delete Permanently</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
