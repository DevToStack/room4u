// app/dashboard/components/Payments.js
'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCreditCard,
    faReceipt,
    faDownload,
    faPaperPlane,
    faCheckCircle,
    faClock,
    faTimesCircle,
    faUndo,
    faSyncAlt,
    faBan,
    faUniversity,
    faWallet,
    faMoneyBill,
    faCalendarAlt,
    faMoneyBillWave,
    faCalendarCheck,
    faFingerprint,
    faBuilding,
    faEye,
    faCircle,
    faRedo
} from '@fortawesome/free-solid-svg-icons';
import {
    faPaypal,
    faStripe,
    faApple,
    faGoogle
} from '@fortawesome/free-brands-svg-icons';
import FilterPills from './FilterPills';
import Card from './Card';

// Default empty data structure
const DEFAULT_DATA = {
    payments: []
};

// Updated color scheme with dark colors and teal
const STATUS_COLORS = {
    paid: 'bg-green-900/20 text-green-400 border border-green-800/30',
    refunded: 'bg-blue-900/20 text-blue-400 border border-blue-800/30',
    cancelled: 'bg-red-900/20 text-red-400 border border-red-800/30',
    failed: 'bg-gray-700 text-gray-300 border border-gray-600'
};

const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'paid', label: 'Paid' },
    { id: 'refunded', label: 'Refunded' },
    { id: 'failed', label: 'Failed' }
];

const PAYMENT_METHODS = {
    credit_card: 'Credit Card',
    debit_card: 'Debit Card',
    upi: 'UPI',
    netbanking: 'Net Banking',
    wallet: 'Digital Wallet'
};

// Safe data access helper with validation
const getSafeData = (data) => {
    try {
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            return DEFAULT_DATA;
        }

        return {
            payments: Array.isArray(data.payments)
                ? data.payments.map(payment => ({
                    // Transform API snake_case to camelCase for component use
                    id: payment?.id,
                    bookingId: payment?.booking_id,
                    amount: payment?.amount,
                    method: payment?.method,
                    status: payment?.status,
                    paidAt: payment?.paid_at,
                    gatewayId: payment?.gatewayId,
                    refundId: payment?.refund_id,
                    refundTime: payment?.refund_time,
                    apartmentTitle: payment?.apartment_title,
                    startDate: payment?.start_date,
                    endDate: payment?.end_date
                })).filter(payment =>
                    payment &&
                    typeof payment === 'object' &&
                    !Array.isArray(payment) &&
                    // Ensure payment has basic required structure
                    (payment.id || payment.bookingId)
                )
                : DEFAULT_DATA.payments
        };
    } catch (error) {
        console.error('Error processing payment data:', error);
        return DEFAULT_DATA;
    }
};

// Safe string conversion with XSS protection
const safeToString = (value, defaultValue = '') => {
    if (value == null) return defaultValue;

    try {
        const stringValue = String(value).trim();
        // Basic XSS protection - remove script tags and dangerous attributes
        return stringValue
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+=["'][^"']*["']/g, '')
            .replace(/javascript:/gi, '')
            .substring(0, 500); // Limit length to prevent abuse
    } catch (error) {
        console.warn('Error converting to string:', error);
        return defaultValue;
    }
};

// Safe number formatting with validation
const safeFormatNumber = (value, defaultValue = 'N/A') => {
    if (value == null) return defaultValue;

    try {
        const num = Number(value);
        if (isNaN(num) || !isFinite(num)) return defaultValue;

        // Validate reasonable number ranges for payments
        if (num < 0 || num > 100000000) { // 100 million upper limit
            console.warn('Suspicious payment amount:', num);
            return 'Invalid';
        }

        return num.toLocaleString('en-IN');
    } catch (error) {
        console.warn('Error formatting number:', error);
        return defaultValue;
    }
};

// Safe currency formatting
const safeFormatCurrency = (value, currency = '₹', defaultValue = 'N/A') => {
    if (value == null) return defaultValue;

    try {
        const num = Number(value);
        if (isNaN(num) || !isFinite(num)) return defaultValue;

        // Additional security: validate amount range
        if (num < 0 || num > 100000000) {
            console.warn('Suspicious payment amount detected:', num);
            return `${currency}Invalid`;
        }

        return `${currency}${num.toLocaleString('en-IN')}`;
    } catch (error) {
        console.warn('Error formatting currency:', error);
        return defaultValue;
    }
};

// Safe date formatting
const safeFormatDate = (dateString, defaultValue = 'N/A') => {
    if (!dateString) return defaultValue;

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return defaultValue;

        // Validate date is not in the future (unless it's a scheduled payment)
        const now = new Date();
        if (date > new Date(now.getTime() + 86400000)) { // 1 day in future
            console.warn('Suspicious future date:', dateString);
            return 'Invalid Date';
        }

        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.warn('Error formatting date:', error);
        return defaultValue;
    }
};

// Safe payment method validation
const safePaymentMethod = (method) => {
    const safeMethod = safeToString(method).toLowerCase();
    return PAYMENT_METHODS[safeMethod] || safeToString(method, 'Unknown');
};

export default function Payments() {
    const [filter, setFilter] = useState('all');
    const [paymentsData, setPaymentsData] = useState(DEFAULT_DATA);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(10); // You can make this configurable
    const [receiptHTML, setReceiptHTML] = useState('');
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [receiptLoading, setReceiptLoading] = useState(false);
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [currentAction, setCurrentAction] = useState(''); // 'view' or 'download'
    const [currentPaymentId, setCurrentPaymentId] = useState('');

    // Fetch payments data
    const fetchPayments = useCallback(async (pageNum = page) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `/api/dashboard/payments?page=${pageNum}&limit=${limit}`,
                { cache: 'no-store' }
            ).then(res => res.json());

            if (response && typeof response === 'object') {
                setPaymentsData(response);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('Error fetching payments:', err);
            setError('Failed to load payments. Please try again.');
            setPaymentsData(DEFAULT_DATA);
        } finally {
            setLoading(false);
        }
    }, [page, limit]);

    // Initial data fetch
    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    // Refetch function that can be called manually
    const handleRefetch = useCallback(() => {
        fetchPayments();
    }, [fetchPayments]);

    // Safely process the data
    const safeData = useMemo(() => getSafeData(paymentsData), [paymentsData]);

    // Safe filter handler
    const handleFilterChange = useCallback((newFilter) => {
        try {
            if (typeof newFilter === 'string' && FILTERS.some(f => f.id === newFilter)) {
                setFilter(newFilter);
            }
        } catch (error) {
            console.warn('Error changing filter:', error);
        }
    }, []);

    // Memoized filtered payments for performance
    const filteredPayments = useMemo(() => {
        return safeData.payments.filter(payment => {
            if (!payment || typeof payment !== 'object') return false;

            try {
                if (filter === 'all') return true;

                const paymentStatus = safeToString(payment.status);
                return paymentStatus === filter;
            } catch (error) {
                console.warn('Error filtering payment:', error, payment);
                return false;
            }
        });
    }, [safeData.payments, filter]);

    const getStatusColor = useCallback((status) => {
        const safeStatus = safeToString(status);
        return STATUS_COLORS[safeStatus] || 'bg-gray-700 text-gray-300 border border-gray-600';
    }, []);

    // Safe payment property access
    const getPaymentProperty = useCallback((payment, property, defaultValue = '') => {
        if (!payment || typeof payment !== 'object') return defaultValue;

        try {
            const value = payment[property];
            return value != null ? value : defaultValue;
        } catch (error) {
            console.warn(`Error accessing payment property ${property}:`, error);
            return defaultValue;
        }
    }, []);

    // Safe payment ID generation
    const getSafePaymentId = useCallback((payment) => {
        try {
            const id = getPaymentProperty(payment, 'id');
            const bookingId = getPaymentProperty(payment, 'bookingId');

            if (id) return safeToString(id);
            if (bookingId) return `payment-${safeToString(bookingId)}`;

            return `payment-${Math.random().toString(36).substr(2, 9)}`;
        } catch (error) {
            return `payment-${Math.random().toString(36).substr(2, 9)}`;
        }
    }, [getPaymentProperty]);

    const handleReceiptAction = useCallback(async (paymentId, action) => {
        try {
            setCurrentAction(action);
            setCurrentPaymentId(paymentId);

            if (action === 'view') {
                setReceiptLoading(true);
            } else if (action === 'download') {
                setDownloadLoading(true);
            }

            const url = `/api/test-receipt/${paymentId}`;
            const res = await fetch(url);

            if (!res.ok) throw new Error('Failed to fetch receipt');

            const pdfBlob = await res.blob();

            if (action === 'view') {
                // Create blob URL and set it in an iframe
                const pdfUrl = URL.createObjectURL(pdfBlob);
                setReceiptHTML(`
                    <iframe 
                        src="${pdfUrl}" 
                        width="100%" 
                        height="100%" 
                        frameborder="0"
                        style="border: none;"
                    ></iframe>
                `);
                setShowReceiptModal(true);
                setReceiptLoading(false);

            } else if (action === 'download') {
                // Download logic
                const downloadUrl = URL.createObjectURL(pdfBlob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = `receipt-${paymentId}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(downloadUrl);
                setDownloadLoading(false);
            }

        } catch (error) {
            console.error('Receipt error:', error);
            alert('Failed to process receipt. Please try again.');
            setReceiptLoading(false);
            setDownloadLoading(false);
        } finally {
            setCurrentAction('');
            setCurrentPaymentId('');
        }
    }, []);

    const handleRefundAction = useCallback((paymentId) => {
        try {
            const safePaymentId = safeToString(paymentId);
        } catch (error) {
            console.error('Error processing refund:', error);
        }
    }, []);

    const renderPaymentCard = useCallback((payment, index) => {
        if (!payment || typeof payment !== 'object') return null;

        const paymentId = getSafePaymentId(payment);
        const bookingId = getPaymentProperty(payment, 'bookingId');
        const status = getPaymentProperty(payment, 'status');
        const amount = getPaymentProperty(payment, 'amount');
        const method = getPaymentProperty(payment, 'method');
        const paidAt = getPaymentProperty(payment, 'paidAt');
        const gatewayId = getPaymentProperty(payment, 'gatewayId');
        const refundId = getPaymentProperty(payment, 'refundId');
        const refundTime = getPaymentProperty(payment, 'refundTime');
        const apartmentTitle = getPaymentProperty(payment, 'apartmentTitle');

        const formattedAmount = safeFormatCurrency(amount);
        const formattedMethod = safePaymentMethod(method);
        const formattedDate = safeFormatDate(paidAt);
        const safeGatewayId = safeToString(gatewayId).substring(0, 20);

        // Status icons mapping
        const statusIcons = {
            paid: faCheckCircle,
            pending: faClock,
            failed: faTimesCircle,
            refunded: faUndo,
            processing: faSyncAlt,
            cancelled: faBan
        };

        // Payment method icons mapping
        const methodIcons = {
            credit_card: faCreditCard,
            debit_card: faCreditCard,
            paypal: faPaypal,
            bank_transfer: faUniversity,
            wallet: faWallet,
            cash: faMoneyBill,
            stripe: faStripe,
            apple_pay: faApple,
            google_pay: faGoogle
        };

        const StatusIcon = statusIcons[status?.toLowerCase()] || faCircle;
        const MethodIcon = methodIcons[method?.toLowerCase()] || faCreditCard;

        // Check if this payment is currently being processed
        const isViewLoading = receiptLoading && currentPaymentId === paymentId && currentAction === 'view';
        const isDownloadLoading = downloadLoading && currentPaymentId === paymentId && currentAction === 'download';

        return (
            <Card
                key={paymentId}
                className="group bg-neutral-800/50 border border-neutral-700/50 rounded-xl p-6 hover:border-neutral-600/50 hover:bg-neutral-800/70 hover:shadow-xl hover:shadow-black/10 backdrop-blur-sm transition-all duration-500 ease-out animate-fade-in-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
            >
                {/* Header */}
                <div className="relative flex items-start justify-between mb-6">
                    <div className="flex flex-col gap-1">
                        {apartmentTitle && (
                            <div className="flex items-center gap-2 group-hover:text-teal-300 transition-colors duration-500">
                                <FontAwesomeIcon icon={faBuilding} className="text-teal-400 text-sm" />
                                <h3 className="text-teal-400 font-semibold text-lg truncate w-[150px]">{apartmentTitle}</h3>
                            </div>
                        )}

                        <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-500">
                            payment #{paymentId}
                        </p>
                    </div>

                    {status && (
                        <span
                            className={`absolute top-0 right-0 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm transition-all duration-500 hover:scale-105 ${getStatusColor(
                                status
                            )}`}
                        >
                            <FontAwesomeIcon
                                icon={StatusIcon}
                                className={`mr-1 text-xs ${status === 'processing' ? 'animate-spin' : ''}`}
                            />
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                    )}
                </div>

                {/* Payment Info */}
                <div className="mb-6 bg-neutral-700/20 rounded-lg group-hover:bg-neutral-700/30 transition-colors duration-500">
                    {[
                        { label: 'Amount', value: formattedAmount, color: 'emerald', icon: faMoneyBillWave },
                        { label: 'Method', value: formattedMethod, color: 'sky', icon: faCreditCard },
                        { label: 'Paid At', value: formattedDate, color: 'amber', icon: faCalendarCheck },
                        { label: 'Gateway ID', value: safeGatewayId, color: 'violet', icon: faFingerprint }
                    ].map((item, idx) => (
                        <div
                            key={idx}
                            className="flex items-center justify-between p-3 hover:bg-neutral-600/20 rounded-lg transition-all duration-300 hover:translate-x-1"
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className={`w-8 h-8 bg-${item.color}-500/10 rounded-lg flex items-center justify-center group-hover:bg-${item.color}-500/20 transition-all duration-500 hover:scale-110`}
                                >
                                    <FontAwesomeIcon icon={item.icon} className={`text-${item.color}-400 text-sm`} />
                                </div>
                                <span className="text-gray-400 text-sm">{item.label}</span>
                            </div>
                            <span
                                className={`text-sm text-gray-200 font-medium truncate ${item.label === 'Amount' ? 'text-base' : ''
                                    }`}
                            >
                                {item.value}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Refund Info */}
                {refundId && refundTime && (
                    <div className="flex items-center gap-3 p-3 mb-6 bg-blue-900/20 rounded-lg border border-blue-800/30 transition-all duration-300 hover:bg-blue-900/30 hover:border-blue-700/50 hover:shadow-lg hover:shadow-blue-500/10">
                        <FontAwesomeIcon icon={faUndo} className="text-blue-400 text-sm animate-pulse" />
                        <div className="flex-1">
                            <p className="text-xs text-blue-400 font-medium">Refund: {refundId}</p>
                            <p className="text-xs text-blue-300">{safeFormatDate(refundTime)}</p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                    <button
                        className="flex-1 max-sm:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-500 font-medium transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/25 hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleReceiptAction(paymentId, 'view')}
                        disabled={isViewLoading || isDownloadLoading}
                    >
                        {isViewLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Loading...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon
                                    icon={faEye}
                                    className="text-sm transition-transform duration-300 group-hover:scale-110"
                                />
                                Receipt
                            </>
                        )}
                    </button>
                    <button
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-gray-500/10 hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleReceiptAction(paymentId, 'download')}
                        disabled={isViewLoading || isDownloadLoading}
                    >
                        {isDownloadLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Downloading...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon
                                    icon={faDownload}
                                    className="text-sm transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5"
                                />
                                Download
                            </>
                        )}
                    </button>
                </div>
            </Card>
        );
    }, [getPaymentProperty, getStatusColor, getSafePaymentId, handleReceiptAction, receiptLoading, downloadLoading, currentPaymentId, currentAction]);

    // Loading state
    if (loading) {
        return (
            <div className="h-screen text-white p-6 flex items-center justify-center"
                style={{ maxHeight: 'calc(100vh - 96px)' }}
            >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <h1 className="text-2xl font-bold text-white mb-4 lg:mb-0">Payments</h1>
                </div>
                <Card className="p-12 text-center bg-gray-800 border border-gray-700 backdrop-blur-sm rounded-xl">
                    <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FontAwesomeIcon
                                icon={faTimesCircle}
                                className="text-red-400 text-2xl"
                            />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Error Loading Payments</h3>
                        <p className="text-gray-400 mb-4">{error}</p>
                        <button
                            onClick={handleRefetch}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-500 font-medium transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/25"
                        >
                            <FontAwesomeIcon icon={faRedo} className="text-sm" />
                            Try Again
                        </button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <h1 className="text-2xl font-bold text-white mb-4 lg:mb-0">Payments</h1>
                <button
                    onClick={handleRefetch}
                    className="flex max-w-[120px] items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 font-medium transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/25 hover:scale-105"
                >
                    <FontAwesomeIcon icon={faRedo} className="text-sm" />
                    Refresh
                </button>
            </div>

            {/* Filter Pills */}
            <FilterPills
                filters={FILTERS}
                activeFilter={filter}
                onFilterChange={handleFilterChange}
            />

            {/* Payments Grid */}
            {filteredPayments.length === 0 ? (
                <Card className="p-12 text-center bg-gray-800 border border-gray-700 backdrop-blur-sm rounded-xl transition-all duration-500 ease-out animate-fade-in-slide-up">
                    <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-soft-float">
                            <FontAwesomeIcon
                                icon={faCreditCard}
                                className="text-teal-400 text-2xl"
                                aria-hidden="true"
                            />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                            {safeData.payments.length === 0
                                ? 'No payments available'
                                : 'No payments found'}
                        </h3>
                        <p className="text-gray-400">
                            {safeData.payments.length === 0
                                ? 'There are no payments to display'
                                : 'No payments match your current filter criteria'}
                        </p>
                    </div>
                </Card>

            ) : (
                // Usage in Payments Grid
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {filteredPayments.map((payment, index) => renderPaymentCard(payment, index)).filter(Boolean)}
                </div>
            )}

            {/* Receipt Modal */}
            {showReceiptModal && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
                    <div className="bg-white rounded-2xl shadow-lg w-[50vw] max-sm:w-[300px] h-[90vh] overflow-hidden relative">
                        <button
                            className="absolute top-3 right-3 z-10 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            onClick={() => {
                                setShowReceiptModal(false);
                                // Clean up any blob URLs when closing
                                if (receiptHTML.includes('blob:')) {
                                    const blobUrl = receiptHTML.match(/src="([^"]*)"/)[1];
                                    URL.revokeObjectURL(blobUrl);
                                }
                            }}
                        >
                            ✕
                        </button>

                        {/* PDF Display */}
                        <div
                            className="w-full h-full rounded-b-2xl"
                            dangerouslySetInnerHTML={{ __html: receiptHTML }}
                        />
                    </div>
                </div>
            )}

            {/* Global Loading Modal for Receipt Actions */}
            {(receiptLoading || downloadLoading) && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
                    <div className="bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md mx-4">
                        <div className="flex flex-col items-center justify-center gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400"></div>
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    {currentAction === 'view' ? 'Loading Receipt' : 'Downloading Receipt'}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    {currentAction === 'view'
                                        ? 'Please wait while we prepare your receipt...'
                                        : 'Your download will start shortly...'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}