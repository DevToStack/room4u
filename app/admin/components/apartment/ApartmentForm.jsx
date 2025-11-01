'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faPlus, faTrash, faSearch, faCircleCheck, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect, useCallback, useMemo } from 'react';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';

const ApartmentForm = ({ editingApartment, formData, setFormData, loading, onSubmit, onCancel }) => {
    const [activeTab, setActiveTab] = useState('basic');

    const [iconPickerOpen, setIconPickerOpen] = useState(false);
    const [currentIconField, setCurrentIconField] = useState(null);
    const [currentIconIndex, setCurrentIconIndex] = useState(null);
    const [iconSearch, setIconSearch] = useState('');
    const [allTabsFilled, setAllTabsFilled] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [iconsPerPage] = useState(48); // 6 rows × 8 columns

    const suggestions = {
        features: [
            { icon: 'faWifi', text: 'Free WiFi' },
            { icon: 'faSnowflake', text: 'Air Conditioning' },
            { icon: 'faTv', text: 'Smart TV' },
            { icon: 'faUtensils', text: 'Full Kitchen' },
            { icon: 'faCar', text: 'Free Parking' },
            { icon: 'faDumbbell', text: 'Gym Access' },
            { icon: 'faSwimmer', text: 'Swimming Pool' },
            { icon: 'faHotTub', text: 'Hot Tub' },
            { icon: 'faUmbrella', text: 'Beach Access' },
            { icon: 'faMountain', text: 'Mountain View' }
        ],
        inclusions: [
            { icon: 'faCoffee', text: 'Coffee & Tea' },
            { icon: 'faShower', text: 'Toiletries' },
            { icon: 'faDroplet', text: 'Fresh Towels' },
            { icon: 'faBed', text: 'Linen & Bedding' },
            { icon: 'faUtensils', text: 'Kitchen Utensils' },
            { icon: 'faSoap', text: 'Cleaning Supplies' },
            { icon: 'faKey', text: 'Self Check-in' },
            { icon: 'faUserShield', text: '24/7 Support' }
        ],
        rules: [
            { icon: 'faSmokingBan', text: 'No Smoking' },
            { icon: 'faPaw', text: 'No Pets Allowed' },
            { icon: 'faUsers', text: 'No Parties/Events' },
            { icon: 'faClock', text: 'Quiet Hours 10PM-7AM' },
            { icon: 'faDoorOpen', text: 'Check-in After 3PM' },
            { icon: 'faDoorClosed', text: 'Check-out Before 11AM' },
            { icon: 'faUserFriends', text: 'Registered Guests Only' },
            { icon: 'faShoePrints', text: 'No Shoes Inside' }
        ],
        whyBook: [
            { icon: 'faStar', text: '5-Star Reviews' },
            { icon: 'faAward', text: 'Premium Quality' },
            { icon: 'faMapMarkerAlt', text: 'Prime Location' },
            { icon: 'faShieldAlt', text: 'Secure Booking' },
            { icon: 'faHeart', text: 'Exceptional Service' },
            { icon: 'faGem', text: 'Luxury Experience' },
            { icon: 'faRocket', text: 'Instant Confirmation' },
            { icon: 'faPhoneAlt', text: '24/7 Customer Support' }
        ]
    };

    // Memoized icon list to prevent recalculations
    const allIcons = useMemo(() =>
        Object.keys(solidIcons)
            .filter(key => key.startsWith('fa') && key !== 'fas' && key !== 'prefix')
            .map(key => ({ name: key, icon: solidIcons[key] }))
        , []);

    // Filter icons based on search
    const filteredIcons = useMemo(() =>
        allIcons.filter(icon =>
            icon.name.toLowerCase().includes(iconSearch.toLowerCase())
        )
        , [allIcons, iconSearch]);

    // Paginate filtered icons
    const paginatedIcons = useMemo(() => {
        const startIndex = (currentPage - 1) * iconsPerPage;
        const endIndex = startIndex + iconsPerPage;
        return filteredIcons.slice(startIndex, endIndex);
    }, [filteredIcons, currentPage, iconsPerPage]);

    // Calculate total pages
    const totalPages = useMemo(() =>
        Math.ceil(filteredIcons.length / iconsPerPage)
        , [filteredIcons.length, iconsPerPage]);

    // Reset to first page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [iconSearch]);

    // Initialize form data structure if not present
    useEffect(() => {
        const initialData = {
            title: '',
            description: '',
            address1: '',
            city: '',
            district: '',
            state: '',
            pincode: '',
            country: '',
            price_per_night: '',
            max_guests: '',
            available: true,
            features: [],
            inclusions: [],
            rules: [],
            whyBook: [],
            policies: {
                cancellation: '',
                booking: ''
            },
            ...formData
        };

        if (Object.keys(initialData).some(key => formData[key] === undefined)) {
            setFormData(initialData);
        }
    }, [setFormData]);

    // --- Validation Functions ---
    const validateBasicTab = useCallback(() => {
        return formData.title &&
            formData.description &&
            formData.price_per_night &&
            formData.max_guests;
    }, [formData]);

    const validateAddressTab = useCallback(() => {
        return formData.address1 &&
            formData.city &&
            formData.district &&
            formData.state &&
            formData.pincode &&
            formData.country;
    }, [formData]);

    const validateArrayTab = useCallback((field) => {
        const items = formData[field] || [];
        return items.length > 0 && items.every(item => item.text && item.text.trim());
    }, [formData]);

    const validatePoliciesTab = useCallback(() => {
        return formData.policies?.cancellation && formData.policies?.booking;
    }, [formData]);

    const validateTab = useCallback((tabId) => {
        switch (tabId) {
            case 'basic': return validateBasicTab();
            case 'address': return validateAddressTab();
            case 'features': return validateArrayTab('features');
            case 'inclusions': return validateArrayTab('inclusions');
            case 'rules': return validateArrayTab('rules');
            case 'whyBook': return validateArrayTab('whyBook');
            case 'policies': return validatePoliciesTab();
            default: return false;
        }
    }, [validateBasicTab, validateAddressTab, validateArrayTab, validatePoliciesTab]);

    const validateAllTabs = useCallback(() => {
        const tabs = ['basic', 'address', 'features', 'inclusions', 'rules', 'whyBook', 'policies'];
        const allValid = tabs.every(tab => validateTab(tab));
        setAllTabsFilled(allValid);
        return allValid;
    }, [validateTab]);

    useEffect(() => {
        const timeoutId = setTimeout(() => validateAllTabs(), 100);
        return () => clearTimeout(timeoutId);
    }, [formData, activeTab, validateAllTabs]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePolicyChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            policies: {
                ...prev.policies,
                [field]: value
            }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateAllTabs()) {
            alert('Please fill all required fields in all tabs before submitting.');
            return;
        }

        const submitData = {
            ...formData,
            price_per_night: parseFloat(formData.price_per_night),
            max_guests: parseInt(formData.max_guests),
            available: formData.available !== undefined ? formData.available : true
        };

        console.log('Submitting data:', submitData);
        onSubmit(submitData);
    };

    // --- Array Fields (Features, Rules, etc.) ---
    const addArrayItem = (field) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...(prev[field] || []), { icon: '', text: '' }]
        }));
    };

    const addSuggestion = (field, suggestion) => {
        const existingItems = formData[field] || [];
        const alreadyExists = existingItems.some(item =>
            item.text.toLowerCase() === suggestion.text.toLowerCase()
        );

        if (!alreadyExists) {
            setFormData(prev => ({
                ...prev,
                [field]: [...existingItems, { ...suggestion }]
            }));
        }
    };

    const updateArrayItem = (field, index, key, value) => {
        const updatedArray = [...(formData[field] || [])];
        updatedArray[index][key] = value;
        setFormData(prev => ({ ...prev, [field]: updatedArray }));
    };

    const removeArrayItem = (field, index) => {
        const updatedArray = [...(formData[field] || [])];
        updatedArray.splice(index, 1);
        setFormData(prev => ({ ...prev, [field]: updatedArray }));
    };

    const openIconPicker = (field, index) => {
        setCurrentIconField(field);
        setCurrentIconIndex(index);
        setIconPickerOpen(true);
        setIconSearch('');
        setCurrentPage(1);
    };

    const closeIconPicker = () => setIconPickerOpen(false);

    const selectIcon = (iconName) => {
        if (currentIconField && currentIconIndex !== null) {
            updateArrayItem(currentIconField, currentIconIndex, 'icon', iconName);
        }
        closeIconPicker();
    };

    // Pagination handlers
    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    // --- Render Suggestion Buttons ---
    const renderSuggestions = (field) => (
        <div className="mb-4">
            <h4 className="text-sm font-semibold text-neutral-400 mb-2">Quick Add Suggestions:</h4>
            <div className="flex flex-wrap gap-2">
                {suggestions[field].map((suggestion, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => addSuggestion(field, suggestion)}
                        className="flex items-center space-x-2 bg-neutral-800 hover:bg-neutral-700 px-3 py-2 rounded-lg border border-neutral-700 transition-colors"
                    >
                        {suggestion.icon && (
                            <FontAwesomeIcon
                                icon={solidIcons[suggestion.icon]}
                                className="w-4 h-4 text-emerald-400"
                            />
                        )}
                        <span className="text-sm text-neutral-300">{suggestion.text}</span>
                        <FontAwesomeIcon icon={faPlus} className="w-3 h-3 text-neutral-400" />
                    </button>
                ))}
            </div>
        </div>
    );

    const renderArrayField = (field, title, placeholderIcon, placeholderText) => (
        <div className="space-y-4">
            {renderSuggestions(field)}

            <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-neutral-50">{title}</h4>
                <button
                    type="button"
                    onClick={() => addArrayItem(field)}
                    className="flex items-center space-x-2 bg-neutral-700 hover:bg-neutral-600 px-3 py-2 rounded-lg text-sm text-neutral-50 transition-colors"
                >
                    <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                    <span>Add Custom</span>
                </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
                {(formData[field] || []).map((item, index) => (
                    <div key={index} className="flex space-x-3 items-start p-4 border border-neutral-700 rounded-lg bg-neutral-800/50">
                        <div className="flex w-full gap-2">
                            <button
                                type="button"
                                onClick={() => openIconPicker(field, index)}
                                className="w-14 h-10 bg-neutral-700 hover:bg-neutral-600 rounded text-neutral-50 transition-colors"
                            >
                                {item.icon ? (
                                    <FontAwesomeIcon icon={solidIcons[item.icon]} className="w-4 h-4" />
                                ) : (
                                    <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                                )}
                            </button>
                            <input
                                type="text"
                                placeholder={placeholderText}
                                value={item.text || ''}
                                onChange={(e) => updateArrayItem(field, index, 'text', e.target.value)}
                                className="w-full p-2 rounded border border-neutral-700 bg-neutral-800 text-neutral-50 text-sm placeholder-neutral-500"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => removeArrayItem(field, index)}
                            className="text-red-400 hover:text-red-300 p-2 transition-colors"
                        >
                            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                {(formData[field] || []).length === 0 && (
                    <div className="text-center py-8 text-neutral-500 border-2 border-dashed border-neutral-700 rounded-lg">
                        <FontAwesomeIcon icon={faPlus} className="w-8 h-8 mb-2 opacity-50" />
                        <p>No {title.toLowerCase()} added yet. Use suggestions above or add custom ones.</p>
                    </div>
                )}
            </div>
        </div>
    );

    // --- Optimized Icon Picker with Pagination ---
    const renderIconPicker = () => iconPickerOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 p-6 rounded-xl border border-white/10 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-neutral-50">Choose an Icon</h3>
                    <button onClick={closeIconPicker} className="text-neutral-400 hover:text-neutral-50">
                        <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
                    </button>
                </div>

                <div className="relative">
                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search icons..."
                        value={iconSearch}
                        onChange={(e) => setIconSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-50"
                    />
                </div>
                <div className='w-full flex justify-center items-center p-2'>
                    {iconSearch && ` (${filteredIcons.length} results)`}
                </div>
                
                {/* Icon Grid */}
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-8 max-sm:grid-cols-4 gap-3">
                        {paginatedIcons.map(({ name, icon }) => (
                            <button
                                key={name}
                                type="button"
                                onClick={() => selectIcon(name)}
                                className="flex flex-col items-center p-2 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 transition-colors group"
                            >
                                <FontAwesomeIcon
                                    icon={icon}
                                    className="text-neutral-300 group-hover:text-white w-5 h-5 mb-1"
                                />
                                <span className="text-[10px] text-neutral-400 truncate w-full text-center">
                                    {name.replace('fa', '')}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-neutral-700">
                        <button
                            type="button"
                            onClick={prevPage}
                            disabled={currentPage === 1}
                            className="flex items-center space-x-2 px-2 py-2 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-700 transition-colors"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
                            <span>Previous</span>
                        </button>

                        <span className="text-sm text-neutral-400">
                            {currentPage} of {totalPages}
                        </span>

                        <button
                            type="button"
                            onClick={nextPage}
                            disabled={currentPage === totalPages}
                            className="flex items-center space-x-2 px-2 py-2 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-700 transition-colors"
                        >
                            <span>Next</span>
                            <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    // ... rest of your component remains the same (renderBasicTab, renderAddressTab, etc.)

    const renderBasicTab = () => (
        <div className="space-y-4 p-2">
            <input
                name="title"
                placeholder="Apartment Title *"
                value={formData.title || ''}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-neutral-700 bg-neutral-800 text-gray-200 placeholder-neutral-500"
                required
            />
            <textarea
                name="description"
                placeholder="Description *"
                value={formData.description || ''}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-neutral-700 bg-neutral-800 text-gray-200 min-h-32 placeholder-neutral-500"
                required
            />
            <div className="grid grid-cols-2 gap-4">
                <input
                    type="number"
                    name="price_per_night"
                    placeholder="Price per Night *"
                    value={formData.price_per_night || ''}
                    onChange={handleInputChange}
                    className="p-3 rounded-lg border border-neutral-700 bg-neutral-800 text-gray-200 placeholder-neutral-500"
                    required
                    min="0"
                    step="0.01"
                />
                <input
                    type="number"
                    name="max_guests"
                    placeholder="Max Guests *"
                    value={formData.max_guests || ''}
                    onChange={handleInputChange}
                    className="p-3 rounded-lg border border-neutral-700 bg-neutral-800 text-gray-200 placeholder-neutral-500"
                    required
                    min="1"
                />
            </div>
            <div className="flex items-center space-x-3">
                <input
                    type="checkbox"
                    id="available"
                    name="available"
                    checked={formData.available !== undefined ? formData.available : true}
                    onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
                    className="rounded border-neutral-700 bg-neutral-800 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="available" className="text-neutral-300 text-sm">
                    Available for booking
                </label>
            </div>
        </div>
    );

    const renderAddressTab = () => (
        <div className="space-y-4 p-2">
            <input
                name="address1"
                placeholder="Street Address * (e.g., 123 Main Street)"
                value={formData.address1 || ''}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-neutral-700 bg-neutral-800 text-gray-200 placeholder-neutral-500"
                required
            />
            <div className="grid grid-cols-2 gap-4">
                <input
                    name="city"
                    placeholder="City *"
                    value={formData.city || ''}
                    onChange={handleInputChange}
                    className="p-3 rounded-lg border border-neutral-700 bg-neutral-800 text-gray-200 placeholder-neutral-500"
                    required
                />
                <input
                    name="district"
                    placeholder="District *"
                    value={formData.district || ''}
                    onChange={handleInputChange}
                    className="p-3 rounded-lg border border-neutral-700 bg-neutral-800 text-gray-200 placeholder-neutral-500"
                    required
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <input
                    name="state"
                    placeholder="State *"
                    value={formData.state || ''}
                    onChange={handleInputChange}
                    className="p-3 rounded-lg border border-neutral-700 bg-neutral-800 text-gray-200 placeholder-neutral-500"
                    required
                />
                <input
                    name="pincode"
                    placeholder="PIN Code *"
                    value={formData.pincode || ''}
                    onChange={handleInputChange}
                    className="p-3 rounded-lg border border-neutral-700 bg-neutral-800 text-gray-200 placeholder-neutral-500"
                    required
                />
            </div>
            <input
                name="country"
                placeholder="Country *"
                value={formData.country || ''}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg border border-neutral-700 bg-neutral-800 text-gray-200 placeholder-neutral-500"
                required
            />
        </div>
    );

    return (
        <>
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
                <div className="bg-neutral-900 p-6 rounded-xl border border-white/10 w-full max-w-4xl max-h-[80vh] flex flex-col shadow-lg">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-neutral-50">
                            {editingApartment ? 'Edit Apartment' : 'Add New Apartment'}
                        </h3>
                        <button onClick={onCancel} className="text-neutral-400 hover:text-neutral-50 transition-colors">
                            <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-neutral-700 mb-6">
                        <div className="flex space-x-1 overflow-x-auto">
                            {['basic', 'address', 'features', 'inclusions', 'rules', 'whyBook', 'policies'].map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${activeTab === tab
                                        ? 'bg-neutral-800 text-neutral-50 border-b-2 border-emerald-500'
                                        : 'text-neutral-400 hover:text-neutral-300 hover:bg-neutral-800'
                                        }`}>
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 overflow-y-auto">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {activeTab === 'basic' && renderBasicTab()}
                            {activeTab === 'address' && renderAddressTab()}
                            {activeTab === 'features' && renderArrayField('features', 'Features', 'Feature icon', 'Feature description')}
                            {activeTab === 'inclusions' && renderArrayField('inclusions', 'Inclusions', 'Inclusion icon', 'Inclusion description')}
                            {activeTab === 'rules' && renderArrayField('rules', 'Rules', 'Rule icon', 'Rule description')}
                            {activeTab === 'whyBook' && renderArrayField('whyBook', 'Why Book With Us', 'Reason icon', 'Reason description')}
                            {activeTab === 'policies' && (
                                <div className="space-y-4 p-2">
                                    <textarea
                                        name="cancellation_policy"
                                        placeholder="Cancellation Policy *"
                                        value={formData.policies?.cancellation || ''}
                                        onChange={(e) => handlePolicyChange('cancellation', e.target.value)}
                                        className="w-full p-3 rounded-lg border border-neutral-700 bg-neutral-800 text-gray-200 min-h-32 placeholder-neutral-500"
                                        required
                                    />
                                    <textarea
                                        name="booking_policy"
                                        placeholder="Booking Policy *"
                                        value={formData.policies?.booking || ''}
                                        onChange={(e) => handlePolicyChange('booking', e.target.value)}
                                        className="w-full p-3 rounded-lg border border-neutral-700 bg-neutral-800 text-gray-200 min-h-32 placeholder-neutral-500"
                                        required
                                    />
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="flex space-x-3 pt-6 border-t border-neutral-700 mt-6">
                        <button
                            type="submit"
                            disabled={loading || !allTabsFilled}
                            onClick={handleSubmit}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-lg text-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors font-medium"
                        >
                            {loading ? (
                                'Saving...'
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faCircleCheck} className="w-4 h-4 mr-2" />
                                    {editingApartment ? 'Update' : 'Create'}
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 bg-neutral-700 hover:bg-neutral-600 px-6 py-3 rounded-lg text-neutral-50 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                    </div>

                    {/* Validation Status */}
                    <div className="mt-3 text-sm text-center">
                        {allTabsFilled ? (
                            <span className="text-emerald-400 flex items-center justify-center">
                                <FontAwesomeIcon icon={faCircleCheck} className="w-4 h-4 mr-1" />
                                All required fields are filled
                            </span>
                        ) : (
                            <span className="text-amber-400">Please fill all required fields in all tabs</span>
                        )}
                    </div>
                </div>
            </div>

            {renderIconPicker()}
        </>
    );
};

export default ApartmentForm;