const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const PaymentDetailsModal = ({ payment, onClose }) => {
    if (!payment) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
            <div className="bg-neutral-800 border border-neutral-700 rounded-xl shadow-lg p-6 w-full max-w-lg">
                <h2 className="text-lg font-semibold text-neutral-100 mb-4">Payment Details</h2>
                <div className="space-y-2 text-sm">
                    <DetailItem label="ID" value={`#${payment.id}`} />
                    <DetailItem label="Razorpay ID" value={payment.razorpay_payment_id || 'N/A'} />
                    <DetailItem label="User" value={payment.user_name} />
                    <DetailItem label="Email" value={payment.user_email} />
                    <DetailItem label="Apartment" value={payment.apartment_title} />
                    <DetailItem label="Amount" value={formatCurrency(payment.amount)} />
                    <DetailItem label="Status" value={payment.status} capitalize />
                    <DetailItem label="Method" value={payment.method || 'N/A'} />
                    <DetailItem label="Paid At" value={new Date(payment.paid_at).toLocaleString()} />
                    {payment.refund_id && <DetailItem label="Refund ID" value={payment.refund_id} />}
                    {payment.refund_time && <DetailItem label="Refund Time" value={new Date(payment.refund_time).toLocaleString()} />}
                </div>
                <div className="mt-6 flex justify-end">
                    <button
                        className="bg-neutral-700 hover:bg-neutral-600 text-neutral-100 px-4 py-1.5 rounded-lg text-sm"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const DetailItem = ({ label, value, capitalize = false }) => (
    <p className="text-neutral-300">
        <span className="text-neutral-400">{label}:</span>
        <span className={capitalize ? 'capitalize' : ''}> {value}</span>
    </p>
);

export default PaymentDetailsModal;