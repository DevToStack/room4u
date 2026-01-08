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
    faArrowTrendUp,
    faArrowTrendDown
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
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 backdrop-blur-sm border border-neutral-700 rounded-xl p-4 shadow-2xl">
                <p className="text-neutral-100 font-semibold mb-2">{`${label}`}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
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
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 backdrop-blur-sm border border-neutral-700 rounded-xl p-4 shadow-2xl">
                <p className="text-neutral-100 font-semibold mb-2">{payload[0].name}</p>
                <p className="text-sm font-medium" style={{ color: payload[0].color }}>
                    {`Count: ${payload[0].value}`}
                </p>
                <p className="text-sm font-medium" style={{ color: payload[0].color }}>
                    {`Percentage: ${payload[0].payload.percentage}%`}
                </p>
            </div>
        );
    }
    return null;
};

// Skeleton components
const StatCardSkeleton = () => (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-neutral-900/50 to-neutral-800/30 border border-neutral-700/50 animate-pulse">
        <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-neutral-700/50">
                <div className="w-6 h-6 rounded-lg bg-neutral-700/50"></div>
            </div>
            <div className="flex-1">
                <div className="h-4 w-24 bg-neutral-700/50 rounded-lg mb-2"></div>
                <div className="h-8 w-20 bg-neutral-700/50 rounded-lg"></div>
            </div>
        </div>
    </div>
);

const ChartCardSkeleton = () => (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-neutral-900/50 to-neutral-800/30 border border-neutral-700/50 animate-pulse">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-neutral-700/50">
                    <div className="w-6 h-6 rounded-lg bg-neutral-700/50"></div>
                </div>
                <div className="space-y-2">
                    <div className="h-6 w-32 bg-neutral-700/50 rounded-lg"></div>
                    <div className="h-4 w-24 bg-neutral-700/50 rounded-lg"></div>
                </div>
            </div>
            <div className="h-10 w-24 bg-neutral-700/50 rounded-lg"></div>
        </div>
        <div className="w-full h-[300px] bg-neutral-800/30 rounded-lg"></div>
    </div>
);

const PieChartSkeleton = () => (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-neutral-900/50 to-neutral-800/30 border border-neutral-700/50 animate-pulse">
        <div className="h-7 w-48 bg-neutral-700/50 rounded-lg mb-4"></div>
        <div className="flex flex-col items-center">
            <div className="w-full h-48 mb-4 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-40 h-40 rounded-full bg-neutral-900/30"></div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full">
                {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/30 border border-neutral-700/50">
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full bg-neutral-700/50"></div>
                            <div className="h-4 w-20 bg-neutral-700/50 rounded-lg"></div>
                        </div>
                        <div className="text-right">
                            <div className="h-6 w-8 bg-neutral-700/50 rounded-lg mb-1"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const BookingCardSkeleton = () => (
    <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-900/30 to-neutral-800/20 border border-neutral-700/50 animate-pulse">
        <div className="flex justify-between items-start mb-3">
            <div className="space-y-2">
                <div className="h-4 w-28 bg-neutral-700/50 rounded-lg"></div>
                <div className="h-3 w-20 bg-neutral-700/50 rounded-lg"></div>
            </div>
            <div className="h-6 w-16 bg-neutral-700/50 rounded-full"></div>
        </div>
        <div className="space-y-3">
            {[1, 2, 3, 4].map((line) => (
                <div key={line} className="flex justify-between items-center">
                    <div className="h-3 w-16 bg-neutral-700/50 rounded-lg"></div>
                    <div className="h-4 w-20 bg-neutral-700/50 rounded-lg"></div>
                </div>
            ))}
        </div>
    </div>
);

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
            ongoingBookings: 0,
            expiredBookings: 0,
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
            ongoing: [],
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

    // Chart configurations with subtle gradients
    const chartConfigs = {
        users: {
            type: "area",
            color: "#4ade80",
            gradient: true,
            stroke: "#4ade80",
            fill: "url(#usersGradient)",
            bgGradient: "from-emerald-900/10 to-emerald-900/5",
            borderColor: "border-emerald-800/30"
        },
        bookings: {
            type: "bar",
            color: "#60a5fa",
            gradient: false,
            stroke: "#60a5fa",
            fill: "#60a5fa",
            bgGradient: "from-blue-900/10 to-blue-900/5",
            borderColor: "border-blue-800/30"
        },
        payments: {
            type: "line",
            color: "#fbbf24",
            gradient: false,
            stroke: "#fbbf24",
            fill: "none",
            bgGradient: "from-amber-900/10 to-amber-900/5",
            borderColor: "border-amber-800/30"
        },
        revenue: {
            type: "composed",
            color: "#f87171",
            gradient: true,
            stroke: "#f87171",
            fill: "url(#revenueGradient)",
            bgGradient: "from-rose-900/10 to-rose-900/5",
            borderColor: "border-rose-800/30"
        }
    };

    // Enhanced colors for pie chart with subtle shades
    const PIE_CHART_COLORS = {
        pending: "#fbbf24",
        confirmed: "#4ade80",
        cancelled: "#f87171",
        ongoing: "#04f0ff",
        expired: "#8b5cf6"
    };

    // Prepare data for pie chart
    const pieChartData = [
        {
            name: "Confirmed Bookings",
            value: dashboardData.totals.confirmedBookings,
            percentage: dashboardData.totals.totalBookings > 0
                ? Math.round((dashboardData.totals.confirmedBookings / dashboardData.totals.totalBookings) * 100)
                : 0,
            color: PIE_CHART_COLORS.confirmed,
            gradient: "bg-gradient-to-r from-emerald-500/20 to-emerald-500/5"
        },
        {
            name: "Pending Bookings",
            value: dashboardData.totals.pendingBookings,
            percentage: dashboardData.totals.totalBookings > 0
                ? Math.round((dashboardData.totals.pendingBookings / dashboardData.totals.totalBookings) * 100)
                : 0,
            color: PIE_CHART_COLORS.pending,
            gradient: "bg-gradient-to-r from-amber-500/20 to-amber-500/5"
        },
        {
            name: "Cancelled Bookings",
            value: dashboardData.totals.cancelledBookings,
            percentage: dashboardData.totals.totalBookings > 0
                ? Math.round((dashboardData.totals.cancelledBookings / dashboardData.totals.totalBookings) * 100)
                : 0,
            color: PIE_CHART_COLORS.cancelled,
            gradient: "bg-gradient-to-r from-rose-500/20 to-rose-500/5"
        },
        {
            name: "Ongoing Bookings",
            value: dashboardData.totals.ongoingBookings,
            percentage: dashboardData.totals.totalBookings > 0
                ? Math.round((dashboardData.totals.ongoingBookings / dashboardData.totals.totalBookings) * 100)
                : 0,
            color: PIE_CHART_COLORS.ongoing,
            gradient: "bg-gradient-to-r from-cyan-500/20 to-cyan-500/5"
        },
        {
            name: "Expired Bookings",
            value: dashboardData.totals.expiredBookings,
            percentage: dashboardData.totals.totalBookings > 0
                ? Math.round((dashboardData.totals.expiredBookings / dashboardData.totals.totalBookings) * 100)
                : 0,
            color: PIE_CHART_COLORS.expired,
            gradient: "bg-gradient-to-r from-violet-500/20 to-violet-500/5"
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
                            ongoingBookings: 0,
                            expiredBookings: 0,
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
                            ongoing: [],
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
        { key: "users", label: "Users", color: "#4ade80", icon: faUsers },
        { key: "bookings", label: "Bookings", color: "#60a5fa", icon: faCalendarCheck },
        { key: "payments", label: "Payments", color: "#fbbf24", icon: faMoneyBillWave },
        { key: "revenue", label: "Revenue (₹)", color: "#f87171", icon: faChartLine },
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
                                <stop offset="0%" stopColor={config.color} stopOpacity={0.4} />
                                <stop offset="100%" stopColor={config.color} stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#404040" vertical={false} opacity={0.3} />
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
                            strokeWidth={3}
                            dot={{ fill: config.stroke, strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 8, fill: "#ffffff", stroke: config.stroke, strokeWidth: 2 }}
                        />
                    </AreaChart>
                );

            case "bar":
                return (
                    <BarChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#404040" vertical={false} opacity={0.3} />
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
                            radius={[8, 8, 0, 0]}
                            opacity={0.9}
                        />
                    </BarChart>
                );

            case "line":
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#404040" vertical={false} opacity={0.3} />
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
                            activeDot={{ r: 8, fill: "#ffffff", stroke: config.stroke, strokeWidth: 2 }}
                        />
                    </LineChart>
                );

            case "composed":
                return (
                    <ComposedChart {...commonProps}>
                        <defs>
                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={config.color} stopOpacity={0.4} />
                                <stop offset="100%" stopColor={config.color} stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#404040" vertical={false} opacity={0.3} />
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
            <section className="overflow-y-auto p-4 sm:p-6 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950"
                style={{ maxHeight: 'calc(100vh - 96px)' }}
            >
                <div className="space-y-6">
                    {/* Main Summary Cards Skeleton */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((item) => (
                            <StatCardSkeleton key={item} />
                        ))}
                    </div>

                    {/* Booking Status Overview Section Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                        <PieChartSkeleton />

                        <div className="p-6 rounded-2xl bg-gradient-to-br from-neutral-900/50 to-neutral-800/30 border border-neutral-800/50 animate-pulse xl:col-span-3 lg:col-span-1">
                            <div className="flex items-center justify-between mb-6">
                                <div className="h-7 w-40 bg-neutral-800/50 rounded-lg"></div>
                                <div className="flex gap-1 bg-neutral-900/50 rounded-xl p-1">
                                    {[1, 2, 3].map((item) => (
                                        <div key={item} className="px-4 py-2 rounded-lg bg-neutral-800/50 w-24"></div>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((item) => (
                                    <BookingCardSkeleton key={item} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Graph Cards Skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map((item) => (
                            <ChartCardSkeleton key={item} />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="overflow-y-auto p-4 sm:p-6 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950"
            style={{ maxHeight: 'calc(100vh - 96px)' }}
        >
            {/* Main Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6 max-sm:gap-4">
                {chartOptions.map(({ key, label, color, icon }) => (
                    <div key={key}
                        className={`summary-card p-5 max-sm:p-4 rounded-2xl shadow-xl border ${chartConfigs[key].borderColor} 
                                     bg-gradient-to-br from-neutral-900/60 to-neutral-800/40 backdrop-blur-sm`}>
                        <div className="flex items-center gap-4">
                            <div
                                className="p-3 rounded-xl flex items-center justify-center backdrop-blur-sm"
                                style={{
                                    background: `linear-gradient(135deg, ${color}20, ${color}10)`,
                                    boxShadow: `0 4px 15px ${color}10`
                                }}
                            >
                                <FontAwesomeIcon
                                    icon={icon}
                                    style={{ color }}
                                    className="text-xl"
                                />
                            </div>
                            <div>
                                <p className="text-neutral-300 text-sm font-medium mb-1">{label}</p>
                                <p className="text-2xl max-sm:text-xl font-bold text-white">
                                    {key === 'revenue' ? '₹' : ''}{dashboardData.totals[`total${key.charAt(0).toUpperCase() + key.slice(1)}`]?.toLocaleString() || 0}
                                </p>
                                {/* <div className="flex items-center gap-1 mt-1">
                                    <FontAwesomeIcon icon={faArrowTrendUp} className="text-xs text-emerald-400" />
                                    <span className="text-xs text-emerald-400 font-medium">+12%</span>
                                    <span className="text-xs text-neutral-500 ml-2">vs last month</span>
                                </div> */}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Booking Status Overview Section */}
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                {/* Pie Chart Card with Enhanced Design */}
                <div className={`chart-card flex flex-col p-6 rounded-2xl shadow-xl border border-neutral-800/30 
                                bg-gradient-to-br from-neutral-900/60 to-neutral-800/40 backdrop-blur-sm xl:col-span-1 lg:col-span-1`}>
                    <h2 className="text-xl font-bold text-white mb-4">Booking Status</h2>
                    <div className="flex flex-col items-center">
                        <div className="w-full h-48 mb-2 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="90%"
                                        startAngle={180}
                                        endAngle={0}
                                        innerRadius={70}
                                        outerRadius={110}
                                        paddingAngle={2}
                                        dataKey="value"
                                        label={({ percentage }) => `${percentage}%`}
                                        labelLine={false}
                                    >
                                        {pieChartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                                stroke="rgb(23 23 23)"
                                                strokeWidth={3}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<PieChartTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Center summary */}
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
                                <p className="text-neutral-400 text-sm font-medium">Total</p>
                                <p className="text-3xl font-bold text-white">
                                    {dashboardData.totals.totalBookings}
                                </p>
                                <p className="text-xs text-neutral-500">Bookings</p>
                            </div>
                        </div>

                        {/* Legend with gradient backgrounds */}
                        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3 w-full mt-4">
                            {pieChartData.map((item, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center justify-between p-3 rounded-xl ${item.gradient} border border-neutral-800/50 
                ${index >= 2 && index <= 3 ? "col-span-1 " : "max-sm:col-span-1 col-span-2"}
            `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: item.color }}
                                        ></div>
                                        <span className="text-sm text-neutral-200 font-medium">
                                            {item.name}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-white">
                                            {formatNumber(item.value)}
                                        </p>
                                        <p className="text-xs text-neutral-300 font-medium">{item.percentage}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Bookings & Upcoming Check-ins Section */}
                <div className={`chart-card p-6 rounded-2xl shadow-xl border border-neutral-800/30 
                                bg-gradient-to-br from-neutral-900/60 to-neutral-800/40 backdrop-blur-sm xl:col-span-3 lg:col-span-1`}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Bookings Overview</h2>
                        <div className="flex gap-1 bg-neutral-900/50 rounded-xl p-1">
                            {['recent', 'upcoming', 'ongoing'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveBookingTab(tab)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeBookingTab === tab
                                        ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-white shadow-lg border border-blue-500/30'
                                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                                        }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bookings Content */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 overflow-y-auto pr-2">
                        {(activeBookingTab === 'recent' ? dashboardData.bookings.recent :
                            activeBookingTab === 'upcoming' ? dashboardData.bookings.upcoming :
                                dashboardData.bookings.ongoing)?.slice(0, 4).map((booking) => (
                                    <div key={booking.id}
                                        className="summary-card p-4 rounded-xl border border-neutral-800/50 hover:border-neutral-600/50 transition-all duration-300
                                           bg-gradient-to-br from-neutral-900/30 to-neutral-800/20 backdrop-blur-sm">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="font-semibold text-white text-sm">
                                                    {booking.bookingReference || `#${booking.id}`}
                                                </p>
                                                <p className="text-xs text-neutral-400 mt-1">
                                                    {booking.customer?.name || 'N/A'}
                                                </p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm
                                        ${booking.status === 'confirmed' ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 text-emerald-300 border border-emerald-500/30' :
                                                    booking.status === 'pending' ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/10 text-amber-300 border border-amber-500/30' :
                                                        booking.status === 'cancelled' ? 'bg-gradient-to-r from-rose-500/20 to-rose-500/10 text-rose-300 border border-rose-500/30' :
                                                            'bg-gradient-to-r from-blue-500/20 to-cyan-500/10 text-cyan-300 border border-cyan-500/30'}`}>
                                                {booking.status}
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-neutral-400">Check-in</span>
                                                <span className="text-sm font-medium text-white">
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
                                                <span className="text-sm font-bold text-white">
                                                    ₹{booking.totalAmount?.toLocaleString() || '0'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center pt-3 border-t border-neutral-800/50">
                                                <span className="text-xs text-neutral-400">Booked on</span>
                                                <span className="text-xs text-neutral-400">
                                                    {new Date(booking.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        {(!(activeBookingTab === 'recent' ? dashboardData.bookings.recent :
                            activeBookingTab === 'upcoming' ? dashboardData.bookings.upcoming :
                                dashboardData.bookings.ongoing) ||
                            (activeBookingTab === 'recent' ? dashboardData.bookings.recent.length :
                                activeBookingTab === 'upcoming' ? dashboardData.bookings.upcoming.length :
                                    dashboardData.bookings.ongoing.length) === 0) && (
                                <div className="col-span-2 flex flex-col items-center justify-center py-8">
                                    <div className="p-4 rounded-full bg-gradient-to-br from-neutral-800/50 to-neutral-800/30 mb-4">
                                        <FontAwesomeIcon
                                            icon={activeBookingTab === 'upcoming' ? faCalendarCheck : faBed}
                                            className="text-3xl text-neutral-500"
                                        />
                                    </div>
                                    <p className="text-neutral-400 font-medium">No {activeBookingTab} bookings found</p>
                                </div>
                            )}
                    </div>
                </div>
            </div>

            {/* Graph Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {chartOptions.map(({ key, label, color, icon }) => {
                    const config = chartConfigs[key];
                    return (
                        <div key={key}
                            className={`chart-card p-6 rounded-2xl shadow-xl border ${config.borderColor} 
                                         bg-gradient-to-br ${config.bgGradient} backdrop-blur-sm flex flex-col`}>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="p-3 rounded-xl flex items-center justify-center backdrop-blur-sm"
                                        style={{
                                            background: `linear-gradient(135deg, ${color}20, ${color}10)`,
                                            boxShadow: `0 4px 15px ${color}10`
                                        }}
                                    >
                                        <FontAwesomeIcon
                                            icon={icon}
                                            style={{ color }}
                                            className="text-lg"
                                        />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{label} Trend</h2>
                                        <p className="text-sm text-neutral-400 capitalize">
                                            {config.type} chart • {timeRanges[key]} view
                                        </p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg blur-sm"></div>
                                    <CustomSelect
                                        value={timeRanges[key]}
                                        onChange={(val) => handleRangeChange(key, val)}
                                        className="relative"
                                    />
                                </div>
                            </div>

                            <div className="flex-1">
                                {loadingGraphs[key] ? (
                                    <div className="flex justify-center items-center h-[300px]">
                                        <div className="relative">
                                            <div className="absolute inset-0 animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-neutral-800"></div>
                                            <div className="relative animate-spin rounded-full h-12 w-12 border-b-2 border-t-2" style={{ borderColor: color }}></div>
                                        </div>
                                    </div>
                                ) : dashboardData.graphs[key]?.length > 0 ? (
                                    <div className="w-full h-[300px] focus:outline-none">
                                        <ResponsiveContainer width="100%" height="100%">
                                            {renderChart(key, dashboardData.graphs[key], config)}
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="flex flex-col justify-center items-center h-[300px] text-neutral-400">
                                        <div className="p-4 rounded-full bg-neutral-900/50 mb-4">
                                            <FontAwesomeIcon icon={faChartLine} className="text-2xl" />
                                        </div>
                                        <p className="font-medium">No data available for this period</p>
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