"use client";
import { useEffect, useState } from "react";
import {
    ResponsiveContainer,
    LineChart,
    BarChart,
    AreaChart,
    ComposedChart,
    Line,
    Bar,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUsers,
    faCalendarCheck,
    faMoneyBillWave,
    faChartLine,
    faBed,
    faUserCheck,
    faClock
} from "@fortawesome/free-solid-svg-icons";
import CustomSelect from "../../../../components/select";
import { useRouter } from "next/navigation";

const chartStyles = `
  .recharts-wrapper:focus,
  .recharts-surface:focus,
  .recharts-wrapper *:focus {
    outline: none !important;
  }
  .recharts-surface {
    outline: none !important;
  }
  .recharts-tooltip-wrapper {
    z-index: 1000;
  }
`;

// Custom tooltip component for better styling
const CustomTooltip = ({ active, payload, label, chartKey }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-neutral-800/95 backdrop-blur-sm border border-neutral-600 rounded-lg p-3 shadow-xl">
                <p className="text-neutral-200 font-medium mb-1">{`${label}`}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {`${entry.name}: ${chartKey === 'revenue' ? '₹' : ''}${entry.value.toLocaleString()}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Custom tooltip for pie chart
const PieChartTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-neutral-800/95 backdrop-blur-sm border border-neutral-600 rounded-lg p-3 shadow-xl">
                <p className="text-neutral-200 font-medium mb-1">{payload[0].name}</p>
                <p className="text-sm" style={{ color: payload[0].color }}>
                    {`Count: ${payload[0].value}`}
                </p>
                <p className="text-sm" style={{ color: payload[0].color }}>
                    {`Percentage: ${payload[0].payload.percentage}%`}
                </p>
            </div>
        );
    }
    return null;
};

export default function AdminDashboardStats() {
    const router = useRouter();
    const [activeBookingTab, setActiveBookingTab] = useState('recent');
    const [timeRanges, setTimeRanges] = useState({
        users: "day",
        bookings: "day",
        payments: "day",
        revenue: "day",
    });

    const [dashboardData, setDashboardData] = useState({
        totals: {
            totalUsers: 0,
            totalBookings: 0,
            totalPayments: 0,
            totalRevenue: 0,
            pendingBookings: 0,
            confirmedBookings: 0,
            cancelledBookings: 0,
        },
        graphs: {
            users: [],
            bookings: [],
            payments: [],
            revenue: [],
        },
        bookings: {
            statistics: {
                pending: 0,
                confirmed: 0,
                cancelled: 0,
                total: 0
            },
            upcoming: [],
            recent: [],
            statusDistribution: {}
        }
    });

    const [loading, setLoading] = useState(true);
    const [loadingGraphs, setLoadingGraphs] = useState({
        users: false,
        bookings: false,
        payments: false,
        revenue: false,
    });

    // Chart configurations for different styles
    const chartConfigs = {
        users: {
            type: "area",
            color: "#4ade80",
            gradient: true,
            stroke: "#4ade80",
            fill: "url(#usersGradient)"
        },
        bookings: {
            type: "bar",
            color: "#60a5fa",
            gradient: false,
            stroke: "#60a5fa",
            fill: "#60a5fa"
        },
        payments: {
            type: "line",
            color: "#fbbf24",
            gradient: false,
            stroke: "#fbbf24",
            fill: "none"
        },
        revenue: {
            type: "composed",
            color: "#f87171",
            gradient: true,
            stroke: "#f87171",
            fill: "url(#revenueGradient)"
        }
    };

    // Colors for pie chart
    const PIE_CHART_COLORS = {
        pending: "#fbbf24",
        confirmed: "#4ade80",
        cancelled: "#f87171",
        ongoing:"#04f0ff"
    };

    // Prepare data for pie chart
    const pieChartData = [
        {
            name: "Confirmed Bookings",
            value: dashboardData.totals.confirmedBookings,
            percentage: dashboardData.totals.totalBookings > 0
                ? Math.round((dashboardData.totals.confirmedBookings / dashboardData.totals.totalBookings) * 100)
                : 0,
            color: PIE_CHART_COLORS.confirmed
        },
        {
            name: "Pending Bookings",
            value: dashboardData.totals.pendingBookings,
            percentage: dashboardData.totals.totalBookings > 0
                ? Math.round((dashboardData.totals.pendingBookings / dashboardData.totals.totalBookings) * 100)
                : 0,
            color: PIE_CHART_COLORS.pending
        },
        {
            name: "Cancelled Bookings",
            value: dashboardData.totals.cancelledBookings,
            percentage: dashboardData.totals.totalBookings > 0
                ? Math.round((dashboardData.totals.cancelledBookings / dashboardData.totals.totalBookings) * 100)
                : 0,
            color: PIE_CHART_COLORS.cancelled
        },
        {
            name: "Ongoing Bookings",
            value: dashboardData.totals.cancelledBookings,
            percentage: dashboardData.totals.totalBookings > 0
                ? Math.round((dashboardData.totals.cancelledBookings / dashboardData.totals.totalBookings) * 100)
                : 0,
            color: PIE_CHART_COLORS.ongoing
        }
    ];
    const formatNumber = (num) =>
        num >= 1000 ? `${(num / 1000).toFixed(1)}K` : num;      
    // Apply recharts focus fix
    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = chartStyles;
        document.head.appendChild(styleSheet);
        return () => document.head.removeChild(styleSheet);
    }, []);

    // Fetch dashboard data
    useEffect(() => {
        async function fetchInitialData() {
            try {
                setLoading(true);
                const res = await fetch(`/api/admin/stats?range=day`);
                const data = await res.json();

                if (data) {
                    setDashboardData({
                        totals: data.totals || {
                            totalUsers: 0,
                            totalBookings: 0,
                            totalPayments: 0,
                            totalRevenue: 0,
                            pendingBookings: 0,
                            confirmedBookings: 0,
                            cancelledBookings: 0,
                        },
                        graphs: data.graphs || {
                            users: [],
                            bookings: [],
                            payments: [],
                            revenue: [],
                        },
                        bookings: data.bookings || {
                            statistics: {
                                pending: 0,
                                confirmed: 0,
                                cancelled: 0,
                                total: 0
                            },
                            upcoming: [],
                            recent: [],
                            statusDistribution: {}
                        }
                    });
                }
            } catch (err) {
                console.error("❌ Stats fetch error:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchInitialData();
    }, []);

    const handleRangeChange = async (key, value) => {
        setTimeRanges((prev) => ({ ...prev, [key]: value }));
        setLoadingGraphs((prev) => ({ ...prev, [key]: true }));

        try {
            const res = await fetch(`/api/admin/stats?range=${value}`);
            const data = await res.json();

            if (data.graphs && data.graphs[key]) {
                setDashboardData(prev => ({
                    ...prev,
                    graphs: {
                        ...prev.graphs,
                        [key]: data.graphs[key]
                    }
                }));
            }
        } catch (err) {
            console.error("❌ Range change fetch error:", err);
        } finally {
            setLoadingGraphs((prev) => ({ ...prev, [key]: false }));
        }
    };

    const chartIcons = {
        users: faUsers,
        bookings: faCalendarCheck,
        payments: faMoneyBillWave,
        revenue: faChartLine,
    };

    const chartOptions = [
        { key: "users", label: "Users", color: "#4ade80" },
        { key: "bookings", label: "Bookings", color: "#60a5fa" },
        { key: "payments", label: "Payments", color: "#fbbf24" },
        { key: "revenue", label: "Revenue (₹)", color: "#f87171" },
    ];

    // Booking status cards data
    const bookingStats = [
        {
            key: "pending",
            label: "Pending Bookings",
            value: dashboardData.totals.pendingBookings,
            color: "#fbbf24",
            icon: faClock
        },
        {
            key: "confirmed",
            label: "Confirmed Bookings",
            value: dashboardData.totals.confirmedBookings,
            color: "#4ade80",
            icon: faUserCheck
        },
        {
            key: "cancelled",
            label: "Cancelled Bookings",
            value: dashboardData.totals.cancelledBookings,
            color: "#f87171",
            icon: faCalendarCheck
        }
    ];

    // Render different chart types based on configuration
    const renderChart = (key, data, config) => {
        const commonProps = {
            data: data,
            margin: { top: 10, right: 10, left: 10, bottom: 10 }
        };

        switch (config.type) {
            case "area":
                return (
                    <AreaChart {...commonProps}>
                        <defs>
                            <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#4ade80" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#404040" vertical={false} />
                        <XAxis
                            dataKey="label"
                            stroke="#a3a3a3"
                            fontSize={12}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="#a3a3a3"
                            fontSize={12}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => v.toLocaleString()}
                        />
                        <Tooltip content={<CustomTooltip chartKey={key} />} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={config.stroke}
                            fill={config.fill}
                            strokeWidth={2}
                            dot={{ fill: config.stroke, strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, fill: config.stroke }}
                        />
                    </AreaChart>
                );

            case "bar":
                return (
                    <BarChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#404040" vertical={false} />
                        <XAxis
                            dataKey="label"
                            stroke="#a3a3a3"
                            fontSize={12}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="#a3a3a3"
                            fontSize={12}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => v.toLocaleString()}
                        />
                        <Tooltip content={<CustomTooltip chartKey={key} />} />
                        <Bar
                            dataKey="value"
                            fill={config.fill}
                            radius={[4, 4, 0, 0]}
                            opacity={0.8}
                        />
                    </BarChart>
                );

            case "line":
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#404040" vertical={false} />
                        <XAxis
                            dataKey="label"
                            stroke="#a3a3a3"
                            fontSize={12}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="#a3a3a3"
                            fontSize={12}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => v.toLocaleString()}
                        />
                        <Tooltip content={<CustomTooltip chartKey={key} />} />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={config.stroke}
                            strokeWidth={3}
                            dot={{ fill: config.stroke, strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, fill: config.stroke }}
                        />
                    </LineChart>
                );

            case "composed":
                return (
                    <ComposedChart {...commonProps}>
                        <defs>
                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f87171" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#f87171" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#404040" vertical={false} />
                        <XAxis
                            dataKey="label"
                            stroke="#a3a3a3"
                            fontSize={12}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="#a3a3a3"
                            fontSize={12}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                        />
                        <Tooltip content={<CustomTooltip chartKey={key} />} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            fill="url(#revenueGradient)"
                            stroke="none"
                            opacity={0.4}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={config.stroke}
                            strokeWidth={2}
                            dot={false}
                        />
                    </ComposedChart>
                );

            default:
                return (
                    <LineChart {...commonProps}>
                        <XAxis dataKey="label" stroke="#a3a3a3" fontSize={12} />
                        <YAxis stroke="#a3a3a3" fontSize={12} />
                        <Tooltip content={<CustomTooltip chartKey={key} />} />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={config.color}
                            strokeWidth={2}
                        />
                    </LineChart>
                );
        }
    };

    if (loading) {
        return (
            <section className="h-screen flex items-center justify-center bg-neutral-900">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-neutral-400"></div>
            </section>
        );
    }

    return (
        <section className="overflow-y-auto p-4 sm:p-6 bg-neutral-900"
            style={{ maxHeight: 'calc(100vh - 96px)' }}
        >
            <style jsx>{`
                .recharts-wrapper:focus {
                    outline: none !important;
                }
                .recharts-surface:focus {
                    outline: none !important;
                }
                .recharts-wrapper *:focus {
                    outline: none !important;
                }
                .chart-card {
                    backdrop-filter: blur(10px);
                    background: rgb(38 38 38);
                    border: 1px solid rgb(64 64 64);
                    transition: all 0.3s ease;
                }
                .chart-card:hover {
                    background: rgb(51 51 51);
                    border-color: rgb(82 82 82);
                    transform: translateY(-2px);
                }
                .summary-card {
                    background: rgb(38 38 38);
                    border: 1px solid rgb(64 64 64);
                    transition: all 0.3s ease;
                }
                .summary-card:hover {
                    background: rgb(51 51 51);
                    border-color: rgb(82 82 82);
                    transform: translateY(-1px);
                }
            `}</style>

            {/* Main Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6 max-sm:gap-4">
                {chartOptions.map(({ key, label, color }) => (
                    <div key={key} className="summary-card p-4 max-sm:p-3 rounded-xl shadow-lg">
                        <div className="flex items-center gap-3">
                            <div
                                className="p-3 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: `${color}15` }}
                            >
                                <FontAwesomeIcon
                                    icon={chartIcons[key]}
                                    style={{ color }}
                                    className="text-lg"
                                />
                            </div>
                            <div>
                                <p className="text-neutral-400 text-sm">{label}</p>
                                <p className="text-2xl max-sm:text-xl font-bold text-white">
                                    {key === 'revenue' ? '₹' : ''}{dashboardData.totals[`total${key.charAt(0).toUpperCase() + key.slice(1)}`]?.toLocaleString() || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Booking Status Overview Section */}
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                {/* Pie Chart Card with Half-Circle Design */}
                <div className="chart-card flex flex-col p-6 rounded-xl shadow-lg xl:col-span-1 lg:col-span-1">
                    <h2 className="text-xl font-bold text-white mb-6">Booking Status Distribution</h2>
                    <div className="flex flex-col items-center">
                        <div className="w-full h-48 mb-6 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="90%"
                                        startAngle={180}
                                        endAngle={0}
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={2}
                                        dataKey="value"
                                        label={({ percentage }) => `${percentage}%`}
                                        labelLine={false}
                                    >
                                        {pieChartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                                stroke="rgb(38 38 38)"
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<PieChartTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Center summary */}
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
                                <p className="text-neutral-400 text-sm">Total</p>
                                <p className="text-2xl font-bold text-white">
                                    {dashboardData.totals.totalBookings}
                                </p>
                                <p className="text-xs text-neutral-500">Bookings</p>
                            </div>
                        </div>

                        {/* Legend with improved styling */}
                        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-2 w-full">
                            {pieChartData.map((item, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center justify-between p-3 rounded-lg bg-neutral-800/50 border border-neutral-700 
                ${index <= 1 ? "max-sm:col-span-1 col-span-2" : "col-span-1"}
            `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: item.color }}
                                        ></div>
                                        <span className="text-sm text-neutral-300 font-medium">
                                            {item.name}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-white">
                                            {formatNumber(item.value)}
                                        </p>
                                        <p className="text-xs text-neutral-400">{item.percentage}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>

                {/* Recent Bookings & Upcoming Check-ins Section */}
                <div className="chart-card p-6 rounded-xl shadow-lg xl:col-span-3 lg:col-span-1 max-h-[600px]">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Bookings Overview</h2>
                        <div className="flex bg-neutral-800 rounded-lg p-1">
                            <button
                                onClick={() => setActiveBookingTab('recent')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeBookingTab === 'recent'
                                        ? 'bg-neutral-700 text-white shadow'
                                        : 'text-neutral-400 hover:text-white'
                                    }`}
                            >
                                Recent Bookings
                            </button>
                            <button
                                onClick={() => setActiveBookingTab('upcoming')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeBookingTab === 'upcoming'
                                        ? 'bg-neutral-700 text-white shadow'
                                        : 'text-neutral-400 hover:text-white'
                                    }`}
                            >
                                Upcoming Check-ins
                            </button>
                        </div>
                    </div>

                    {/* Recent Bookings Tab */}
                    {activeBookingTab === 'recent' && (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                            {dashboardData.bookings.recent?.slice(0, 4).map((booking) => (
                                <div key={booking.id} className="summary-card p-4 rounded-lg border border-neutral-700 hover:border-neutral-100 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="font-medium text-white text-sm">
                                                {booking.bookingReference || `#${booking.id}`}
                                            </p>
                                            <p className="text-xs text-neutral-400">
                                                {booking.customer?.name || 'N/A'}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                                                booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/20 text-red-400'
                                            }`}>
                                            {booking.status}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-neutral-400">Check-in</span>
                                            <span className="text-sm text-white">
                                                {new Date(booking.checkInDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-neutral-400">Check-out</span>
                                            <span className="text-sm text-white">
                                                {new Date(booking.checkOutDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-neutral-400">Amount</span>
                                            <span className="text-sm font-medium text-white">
                                                ₹{booking.totalAmount?.toLocaleString() || '0'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-neutral-700">
                                            <span className="text-xs text-neutral-400">Booked on</span>
                                            <span className="text-xs text-neutral-400">
                                                {new Date(booking.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!dashboardData.bookings.recent || dashboardData.bookings.recent.length === 0) && (
                                <div className="col-span-2 flex flex-col items-center justify-center py-8 text-neutral-500">
                                    <FontAwesomeIcon icon={faBed} className="text-4xl mb-2 opacity-50" />
                                    <p>No recent bookings found</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Upcoming Check-ins Tab */}
                    {activeBookingTab === 'upcoming' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {dashboardData.bookings.upcoming?.slice(0, 4).map((booking) => (
                                <div key={booking.id} className="summary-card p-4 rounded-lg border border-neutral-700 hover:border-neutral-100 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="font-medium text-white text-sm">
                                                {booking.bookingReference || `#${booking.id}`}
                                            </p>
                                            <p className="text-xs text-neutral-400">
                                                {booking.customer?.name || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                                                    booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-red-500/20 text-red-400'
                                                }`}>
                                                {booking.status}
                                            </span>
                                            <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full">
                                                {new Date(booking.checkInDate).toLocaleDateString() === new Date().toLocaleDateString()
                                                    ? 'Today'
                                                    : 'Upcoming'
                                                }
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-neutral-400">Check-in</span>
                                            <span className="text-sm text-white font-medium">
                                                {new Date(booking.checkInDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-neutral-400">Check-out</span>
                                            <span className="text-sm text-white">
                                                {new Date(booking.checkOutDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-neutral-400">Nights</span>
                                            <span className="text-sm text-white">
                                                {Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24))} nights
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-neutral-400">Amount</span>
                                            <span className="text-sm font-medium text-white">
                                                ₹{booking.totalAmount?.toLocaleString() || '0'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!dashboardData.bookings.upcoming || dashboardData.bookings.upcoming.length === 0) && (
                                <div className="col-span-2 flex flex-col items-center justify-center py-8 text-neutral-500">
                                    <FontAwesomeIcon icon={faCalendarCheck} className="text-4xl mb-2 opacity-50" />
                                    <p>No upcoming check-ins found</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Graph Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {chartOptions.map(({ key, label, color }) => {
                    const config = chartConfigs[key];
                    return (
                        <div key={key} className="chart-card p-6 rounded-xl shadow-lg flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="p-3 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: `${color}15` }}
                                    >
                                        <FontAwesomeIcon
                                            icon={chartIcons[key]}
                                            style={{ color }}
                                        />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{label} Trend</h2>
                                        <p className="text-sm text-neutral-400 capitalize">
                                            {config.type} chart • {timeRanges[key]} view
                                        </p>
                                    </div>
                                </div>
                                <CustomSelect
                                    value={timeRanges[key]}
                                    onChange={(val) => handleRangeChange(key, val)}
                                />
                            </div>

                            <div className="flex-1">
                                {loadingGraphs[key] ? (
                                    <div className="flex justify-center items-center h-[300px]">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-400"></div>
                                    </div>
                                ) : dashboardData.graphs[key]?.length > 0 ? (
                                    <div className="w-full h-[300px] focus:outline-none">
                                        <ResponsiveContainer width="100%" height="100%">
                                            {renderChart(key, dashboardData.graphs[key], config)}
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="flex justify-center items-center h-[300px] text-neutral-400">
                                        No data available for this period
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}