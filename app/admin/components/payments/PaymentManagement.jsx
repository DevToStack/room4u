'use client';
import { useState, useEffect, useMemo, lazy, Suspense } from 'react';

// Lazy load FontAwesome icons - only load what's needed
const loadIcons = async () => {
    const { faSearch, faSync, faFileExport, faEye } = await import('@fortawesome/free-solid-svg-icons');
    return { faSearch, faSync, faFileExport, faEye };
};

// Lazy load components
const PaymentStats = lazy(() => import('./PaymentStats'));
const PaymentFilters = lazy(() => import('./PaymentFilters'));
const PaymentsTable = lazy(() => import('./PaymentsTable'));
const PaymentDetailsModal = lazy(() => import('./PaymentDetailsModal'));
const Snackbar = lazy(() => import('./Snackbar'));

// Loading components
const LoadingSpinner = () => (
    <div className="h-screen text-white p-6 flex items-center justify-center"
        style={{ maxHeight: 'calc(100vh - 96px)' }}
    >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
    </div>
);

const PaymentManagement = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });
    const [filters, setFilters] = useState({ status: 'all', search: '', startDate: '', endDate: '' });
    const [paymentDetails, setPaymentDetails] = useState({ open: false, payment: null });
    const [exportLoading, setExportLoading] = useState(false);
    const [iconsLoaded, setIconsLoaded] = useState(false);

    // Load icons on component mount
    useEffect(() => {
        loadIcons().then(() => setIconsLoaded(true));
    }, []);

    // Fetch payments only when status filter changes
    useEffect(() => {
        fetchPayments();
    }, [filters.status]);

    // Fetch stats separately and only once
    useEffect(() => {
        fetchStats();
    }, []);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (filters.status && filters.status !== 'all') {
                queryParams.append('status', filters.status);
            }

            const res = await fetch(`/api/admin/payments?${queryParams}`);
            const data = await res.json();
            if (res.ok) setPayments(data.payments || []);
        } catch (err) {
            console.error(err);
            showSnackbar('Failed to fetch payments', 'error');
        }
        setLoading(false);
    };

    const fetchStats = async () => {
        try {
            const res = await fetch(`/api/admin/payments/stats`);
            const data = await res.json();
            if (res.ok) setStats(data);
        } catch (err) {
            console.error(err);
        }
    };

    const exportToCSV = async () => {
        setExportLoading(true);
        try {
            const queryParams = new URLSearchParams();

            if (filters.status && filters.status !== 'all') {
                queryParams.append('status', filters.status);
            }
            if (filters.startDate) {
                queryParams.append('startDate', filters.startDate);
            }
            if (filters.endDate) {
                queryParams.append('endDate', filters.endDate);
            }

            const response = await fetch(`/api/admin/payments/export?${queryParams}`);

            if (!response.ok) {
                throw new Error('Export failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;

            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `payments-${new Date().toISOString().split('T')[0]}.csv`;

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch.length === 2) {
                    filename = filenameMatch[1];
                }
            }

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            showSnackbar('Payments exported successfully', 'success');
        } catch (error) {
            console.error('Export error:', error);
            showSnackbar('Failed to export payments', 'error');
        }
        setExportLoading(false);
    };

    const showSnackbar = (message, type = 'success') => {
        setSnackbar({ open: true, message, type });
        setTimeout(() => setSnackbar({ open: false, message: '', type: 'success' }), 3000);
    };

    // Memoized filtered payments to avoid recalculating on every render
    const filteredPayments = useMemo(() => {
        if (!filters.search) return payments;

        return payments.filter(payment =>
            payment.user_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
            payment.apartment_title?.toLowerCase().includes(filters.search.toLowerCase()) ||
            payment.razorpay_payment_id?.toLowerCase().includes(filters.search.toLowerCase())
        );
    }, [payments, filters.search]);

    if (loading && payments.length === 0) {
        return <LoadingSpinner />;
    }

    return (
        <div className="bg-neutral-900 h-full text-neutral-100 p-4 sm:p-6">
            <Suspense fallback={null}>
                {snackbar.open && (
                    <Snackbar message={snackbar.message} type={snackbar.type} />
                )}
            </Suspense>

            {/* Stats - Only load when stats are available */}
            {stats && (
                <Suspense fallback={<div className="h-24 bg-neutral-800 rounded-xl animate-pulse mb-8" />}>
                    <PaymentStats stats={stats} />
                </Suspense>
            )}

            {/* Filters - Load only when icons are ready */}
            {iconsLoaded && (
                <Suspense fallback={<div className="h-16 bg-neutral-800 rounded-xl animate-pulse mb-8" />}>
                    <PaymentFilters
                        filters={filters}
                        setFilters={setFilters}
                        loading={loading}
                        exportLoading={exportLoading}
                        onRefresh={fetchPayments}
                        onExport={exportToCSV}
                    />
                </Suspense>
            )}

            {/* Table - Load with payments data */}
            <Suspense fallback={<div className="h-64 bg-neutral-800 rounded-xl animate-pulse" />}>
                <PaymentsTable
                    payments={filteredPayments}
                    loading={loading}
                    filters={filters}
                    onViewDetails={setPaymentDetails}
                />
            </Suspense>

            {/* Modal - Only load when needed */}
            {paymentDetails.open && (
                <Suspense fallback={null}>
                    <PaymentDetailsModal
                        payment={paymentDetails.payment}
                        onClose={() => setPaymentDetails({ open: false, payment: null })}
                    />
                </Suspense>
            )}
        </div>
    );
};

export default PaymentManagement;