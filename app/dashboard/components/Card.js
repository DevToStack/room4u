// app/dashboard/components/Card.js
export default function Card({ children, className = '', ...props }) {
    return (
        <div
            className={`bg-neutral-800 rounded-2xl shadow-lg border border-neutral-700 hover:border-neutral-600 transition-colors duration-200 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}