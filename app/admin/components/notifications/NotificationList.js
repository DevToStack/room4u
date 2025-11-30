import NotificationItem from "./NotificationItem";

export default function NotificationList({ notifications = [], refresh }) {
    if (!Array.isArray(notifications) || notifications.length === 0) {
        return <p className="mt-4 text-gray-400">No notifications found.</p>;
    }

    return (
        <div className="mt-5 space-y-4 max-h-[600px] overflow-y-auto p-2">
            {notifications.map((n) => (
                <NotificationItem key={n.id} item={n} refresh={refresh} />
            ))}
        </div>
    );
}
