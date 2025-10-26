"use client";
import { useEffect, useState } from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faUsers,
    faCalendarCheck,
    faMoneyBillWave,
    faChartLine,
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
`;

export default function AdminDashboardStats() {
    const router = useRouter();

    const [timeRanges, setTimeRanges] = useState({
        users: "day",
        bookings: "day",
        payments: "day",
        revenue: "day",
    });

    const [totals, setTotals] = useState({
        totalUsers: 0,
        totalBookings: 0,
        totalPayments: 0,
        totalRevenue: 0,
    });

    const [graphs, setGraphs] = useState({
        users: [],
        bookings: [],
        payments: [],
        revenue: [],
    });

    const [loadingGraphs, setLoadingGraphs] = useState({
        users: false,
        bookings: false,
        payments: false,
        revenue: false,
    });

    // Apply recharts focus fix
    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = chartStyles;
        document.head.appendChild(styleSheet);
        return () => document.head.removeChild(styleSheet);
    }, []);

    // ✅ Step 2: Fetch dashboard data (only after auth passes)
    useEffect(() => {
        async function fetchInitialData() {
            try {
                setLoadingGraphs({
                    users: true,
                    bookings: true,
                    payments: true,
                    revenue: true,
                });

                const res = await fetch(`/api/admin/stats?range=day`);
                const data = await res.json();

                if (data.totals) setTotals(data.totals);
                if (data.graphs) setGraphs(data.graphs);
            } catch (err) {
                console.error("❌ Stats fetch error:", err);
            } finally {
                setLoadingGraphs({
                    users: false,
                    bookings: false,
                    payments: false,
                    revenue: false,
                });
            }
        }

        fetchInitialData();
    }, []);

    // ✅ Step 3: Fetch individual chart when time range changes
    const handleRangeChange = async (key, value) => {
        setTimeRanges((prev) => ({ ...prev, [key]: value }));
        setLoadingGraphs((prev) => ({ ...prev, [key]: true }));

        try {
            const res = await fetch(`/api/admin/stats?range=${value}`);
            const data = await res.json();

            if (data.graphs && data.graphs[key]) {
                setGraphs((prev) => ({
                    ...prev,
                    [key]: data.graphs[key],
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

    const formatTooltipValue = (value, key) =>
        key === "revenue" ? `₹${value.toLocaleString()}` : value.toLocaleString();

    return (
        <section className="h-screen max-sm:pb-20  p-4 sm:p-6">
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
      `}</style>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6 max-sm:gap-4">
                <div className="bg-white/10 p-4 max-sm:p-2 rounded-lg shadow flex items-center gap-3">
                    <FontAwesomeIcon icon={faUsers} className="text-2xl text-white/80" />
                    <div>
                        <p className="text-gray-300">Total Users</p>
                        <p className="text-2xl max-sm:text-xl font-bold">
                            {totals.totalUsers.toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="bg-white/10 p-4 max-sm:p-2 rounded-lg shadow flex items-center gap-3">
                    <FontAwesomeIcon
                        icon={faCalendarCheck}
                        className="text-2xl text-white/80"
                    />
                    <div>
                        <p className="text-gray-300">Total Bookings</p>
                        <p className="text-2xl max-sm:text-xl font-bold">
                            {totals.totalBookings.toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="bg-white/10 p-4 max-sm:p-2 rounded-lg shadow flex items-center gap-3">
                    <FontAwesomeIcon
                        icon={faMoneyBillWave}
                        className="text-2xl text-white/80"
                    />
                    <div>
                        <p className="text-gray-300">Total Payments</p>
                        <p className="text-2xl max-sm:text-xl font-bold">
                            {totals.totalPayments.toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="bg-white/10 p-4 max-sm:p-2 rounded-lg shadow flex items-center gap-3">
                    <FontAwesomeIcon
                        icon={faChartLine}
                        className="text-2xl text-white/80"
                    />
                    <div>
                        <p className="text-gray-300">Total Revenue</p>
                        <p className="text-2xl max-sm:text-xl font-bold">
                            ₹{totals.totalRevenue.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Graph Cards */}
            <div className="h-full max-h-[80vh] overflow-y-auto pb-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-20">
                    {chartOptions.map(({ key, label, color }) => (
                        <div key={key} className="bg-white/10 p-6 rounded-lg shadow flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="p-2 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: `${color}33` }}
                                    >
                                        <FontAwesomeIcon icon={chartIcons[key]} className="text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold">{label} Trend</h2>
                                </div>
                                <CustomSelect
                                    value={timeRanges[key]}
                                    onChange={(val) => handleRangeChange(key, val)}
                                />
                            </div>

                            <div className="flex-1">
                                {loadingGraphs[key] ? (
                                    <div className="flex justify-center items-center h-[300px]">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
                                    </div>
                                ) : graphs[key]?.length > 0 ? (
                                    <div className="w-full h-[300px] focus:outline-none">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={graphs[key]}>
                                                <XAxis dataKey="label" stroke="#888" fontSize={12} />
                                                <YAxis
                                                    stroke="#888"
                                                    fontSize={12}
                                                    tickFormatter={(v) =>
                                                        key === "revenue"
                                                            ? `₹${(v / 1000).toFixed(0)}k`
                                                            : v.toLocaleString()
                                                    }
                                                />
                                                <Tooltip
                                                    formatter={(v) => [formatTooltipValue(v, key), label]}
                                                    labelFormatter={(label) => `Time: ${label}`}
                                                    contentStyle={{
                                                        backgroundColor: "#1f2937",
                                                        border: "1px solid #374151",
                                                        borderRadius: "6px",
                                                    }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="value"
                                                    stroke={color}
                                                    strokeWidth={2}
                                                    dot={false}
                                                    activeDot={{ r: 4, fill: color }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="flex justify-center items-center h-[300px] text-gray-400">
                                        No data available for this period
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
