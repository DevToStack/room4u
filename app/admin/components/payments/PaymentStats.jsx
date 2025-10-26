import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faReceipt, faMoneyBillWave, faArrowRotateLeft, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const PaymentStats = ({ stats }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
                icon={faReceipt}
                label="Total Revenue"
                value={formatCurrency(stats.overview.totalRevenue)}
            />
            <StatCard
                icon={faMoneyBillWave}
                label="Successful"
                value={stats.overview.successfulPayments}
            />
            <StatCard
                icon={faArrowRotateLeft}
                label="Refunds"
                value={formatCurrency(stats.overview.totalRefunds)}
            />
            <StatCard
                icon={faCircleExclamation}
                label="Failed"
                value={stats.overview.failedPayments}
            />
        </div>
    );
};

const StatCard = ({ icon, label, value }) => (
    <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-4 flex items-center gap-3">
        <div className="flex justify-center items-center p-2 w-10 h-10 rounded-lg bg-neutral-700">
            <FontAwesomeIcon icon={icon} className="text-neutral-300" />
        </div>
        <div>
            <p className="text-xs text-neutral-400 uppercase">{label}</p>
            <p className="text-lg font-semibold text-neutral-100">{value}</p>
        </div>
    </div>
);

export default PaymentStats;