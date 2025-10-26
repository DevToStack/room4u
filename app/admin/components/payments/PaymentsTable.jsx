import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

export default function PaymentsTable({ payments, loading, filters, onViewDetails }) {
    return (
        <div className="bg-neutral-800 rounded-xl shadow-sm border border-neutral-700 overflow-hidden">
            {/* Unified Scroll Container */}
            <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                <table className="min-w-[768px] w-full text-left border-collapse text-neutral-50">
                    <thead className="bg-neutral-700 sticky top-0 z-10">
                        <tr>
                            <th className="p-4">ID</th>
                            <th className="p-4">User</th>
                            <th className="p-4">Apartment</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="text-center p-6 text-neutral-400">
                                    Loading payments...
                                </td>
                            </tr>
                        ) : payments.length ? (
                            payments.map((payment) => (
                                <tr
                                    key={payment.id}
                                    className="border-b border-neutral-700 hover:bg-neutral-800 transition duration-150"
                                >
                                    <td className="p-4 font-medium">#{payment.id}</td>
                                    <td className="p-4 text-neutral-50">
                                        <div className="text-sm font-medium">{payment.user_name}</div>
                                        {payment.user_email && (
                                            <div className="text-xs text-neutral-400">{payment.user_email}</div>
                                        )}
                                    </td>
                                    <td className="p-4 text-neutral-50">{payment.apartment_title}</td>
                                    <td className="p-4 text-neutral-50">{formatCurrency(payment.amount)}</td>
                                    <td className="p-4">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-medium ${payment.status === 'paid'
                                                    ? 'bg-green-500/10 text-green-400'
                                                    : payment.status === 'pending'
                                                        ? 'bg-yellow-500/10 text-yellow-400'
                                                        : payment.status === 'refunded'
                                                            ? 'bg-blue-500/10 text-blue-400'
                                                            : 'bg-red-500/10 text-red-400'
                                                }`}
                                        >
                                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="p-4 text-neutral-400">{formatDate(payment.paid_at)}</td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => onViewDetails({ open: true, payment })}
                                            className="bg-neutral-700 hover:bg-neutral-600 px-3 py-1 rounded text-sm flex items-center space-x-1 text-blue-400 transition"
                                        >
                                            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                                            <span>View</span>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center p-6 text-neutral-400">
                                    {filters.search ? 'No payments match your search.' : 'No payments found.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
