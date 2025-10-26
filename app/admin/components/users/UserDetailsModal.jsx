import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import Section from './Section';
import CompactStatCard from './CompactStatCard';
import DataTable from './DataTable';
import InfoField from './InfoField';
import StatusBadge from './StatusBadge';
import ReviewCard from './ReviewCard';
import ActivityItem from './ActivityItem';
import EmptyState from './EmptyState';

export default function UserDetailsModal({ userDetails, loading, onClose, onEdit }) {
    const { user, bookings, payments, reviews, activities } = userDetails;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-md">
            <div className="bg-[#0a0a0a] p-6 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl border border-neutral-800">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
                        <FontAwesomeIcon icon={faUser} className="mr-2" />
                        {user.name || "Undefiend"}
                    </h3>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => onEdit(user)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition flex items-center"
                        >
                            <FontAwesomeIcon icon={faPen} className="mr-2" /> Edit
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-gray-700 hover:bg-gray-800 text-white p-2 rounded-lg transition"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                </div>

                {/* Loader */}
                {loading ? (
                    <div className="flex justify-center items-center py-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-400 border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Compact Stats */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                <CompactStatCard
                                    title="Bookings"
                                    value={user.statistics?.total_bookings || 0}
                                    color="green"
                                    icon="clipboardList"
                                />
                                <CompactStatCard
                                    title="Payments"
                                    value={user.statistics?.total_payments || 0}
                                    color="blue"
                                    icon="moneyBill"
                                />
                                <CompactStatCard
                                    title="Reviews"
                                    value={user.statistics?.total_reviews || 0}
                                    color="orange"
                                    icon="star"
                                />
                                <CompactStatCard
                                    title="Total Spent"
                                    value={`$${user.statistics?.total_spent || 0}`}
                                    color="purple"
                                    icon="creditCard"
                                />
                            </div>

                        <div className='max-h-[70vh] overflow-y-auto space-y-8 max-sm:pb-50 pb-20'>
                            {/* Personal Info */}
                            <Section title="Personal Information">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InfoField label="Name" value={user.name} />
                                    <InfoField label="Email" value={user.email} />
                                    <InfoField label="Phone" value={user.phone_number} />
                                    <InfoField
                                        label="Member Since"
                                        value={new Date(user.created_at).toLocaleDateString()}
                                    />
                                    <InfoField label="User ID" value={user.id} mono />
                                </div>
                            </Section>

                            {/* Bookings */}
                            <Section title={`Bookings (${bookings?.length})`}>
                                <DataTable
                                    data={bookings}
                                    columns={[
                                        { key: "id", label: "Booking ID" },
                                        { key: "apartment_title", label: "Apartment" },
                                        {
                                            key: "dates",
                                            label: "Dates",
                                            render: (b) =>
                                                `${new Date(b.start_date).toLocaleDateString()} - ${new Date(
                                                    b.end_date
                                                ).toLocaleDateString()}`,
                                        },
                                        { key: "nights", label: "Nights", center: true },
                                        {
                                            key: "status",
                                            label: "Status",
                                            render: (b) => (
                                                <StatusBadge
                                                    status={b.status}
                                                    variants={{
                                                        confirmed: "green",
                                                        pending: "yellow",
                                                        cancelled: "red",
                                                        expired: "gray",
                                                    }}
                                                />
                                            ),
                                        },
                                    ]}
                                    emptyMessage="No bookings found"
                                />
                            </Section>

                            {/* Payments */}
                            <Section title={`Payments (${payments?.length})`}>
                                <DataTable
                                    data={payments}
                                    columns={[
                                        { key: "id", label: "Payment ID" },
                                        { key: "booking_id", label: "Booking ID" },
                                        { key: "amount", label: "Amount", render: (p) => `$${p.amount}` },
                                        {
                                            key: "status",
                                            label: "Status",
                                            render: (p) => (
                                                <StatusBadge
                                                    status={p.status}
                                                    variants={{
                                                        paid: "green",
                                                        refunded: "blue",
                                                        failed: "red",
                                                        cancelled: "gray",
                                                    }}
                                                />
                                            ),
                                        },
                                        {
                                            key: "paid_at",
                                            label: "Date",
                                            render: (p) => new Date(p.paid_at).toLocaleDateString(),
                                        },
                                    ]}
                                    emptyMessage="No payments found"
                                />
                            </Section>

                            {/* Reviews */}
                            <Section title={`Reviews (${reviews?.length})`}>
                                {reviews?.length > 0 ? (
                                    <div className="space-y-4">
                                        {reviews.map((r) => (
                                            <ReviewCard key={r.id} review={r} />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState message="No reviews yet" />
                                )}
                            </Section>

                            {/* Activity */}
                            <Section title="Recent Activity">
                                {activities?.length > 0 ? (
                                    <div className="space-y-3">
                                        {activities.map((a) => (
                                            <ActivityItem key={a.id} activity={a} />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState message="No recent activity" />
                                )}
                            </Section>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}