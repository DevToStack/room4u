import { NextResponse } from "next/server";
import { query } from "@/lib/mysql-wrapper";

// ---- Helpers ----

function getGrouping(range, column = "created_at") {
    switch (range) {
        case "day":
            return { groupBy: `HOUR(${column})`, labelFormat: 'hour', interval: 24 };
        case "week":
            return { groupBy: `DATE(${column})`, labelFormat: 'YYYY-MM-DD', interval: 7 };
        case "month":
            return { groupBy: `DATE(${column})`, labelFormat: 'YYYY-MM-DD', interval: 30 };
        case "year":
            return { groupBy: `DATE_FORMAT(${column}, '%Y-%m')`, labelFormat: 'YYYY-MM', interval: 12 };
        default:
            return { groupBy: `DATE(${column})`, labelFormat: 'YYYY-MM-DD', interval: 7 };
    }
}

function getDateFilter(range, column = "created_at") {
    const now = new Date();
    switch (range) {
        case "day":
            return `${column} >= DATE_SUB(NOW(), INTERVAL 1 DAY)`;
        case "week":
            return `${column} >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
        case "month":
            return `${column} >= DATE_SUB(NOW(), INTERVAL 1 MONTH)`;
        case "year":
            return `${column} >= DATE_SUB(NOW(), INTERVAL 1 YEAR)`;
        default:
            return `${column} >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
    }
}

// Generate labels for the graph
function generateLabels(range, now = new Date()) {
    const labels = [];
    const startDate = new Date(now);

    switch (range) {
        case 'day':
            // Show last 24 hours
            for (let i = 23; i >= 0; i--) {
                const hour = (now.getHours() - i + 24) % 24;
                labels.push(String(hour).padStart(2, '0'));
            }
            break;

        case 'week':
            // Show last 7 days
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(now.getDate() - i);
                labels.push(d.toISOString().slice(0, 10));
            }
            break;

        case 'month':
            // Show last 30 days
            startDate.setDate(now.getDate() - 29); // 30 days including today
            for (let i = 0; i < 30; i++) {
                const d = new Date(startDate);
                d.setDate(startDate.getDate() + i);
                labels.push(d.toISOString().slice(0, 10));
            }
            break;

        case 'year':
            // Show last 12 months
            for (let i = 11; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                labels.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
            }
            break;
    }

    return labels;
}

// Fill missing values - only apply cumulative sum for revenue
function fillMissingData(raw = [], range, alias, nowDate = null) {
    const now = nowDate ? new Date(nowDate) : new Date();
    const labels = generateLabels(range, now);
    const rawMap = new Map();

    // Convert raw data to map based on range
    raw.forEach(item => {
        let key;
        if (range === 'day') {
            // For hour-based data, ensure consistent formatting
            const hour = String(Number(item.label)).padStart(2, '0');
            key = hour;
        } else if (range === 'year') {
            // For month-based data
            key = item.label;
        } else {
            // For date-based data
            key = new Date(item.label).toISOString().slice(0, 10);
        }
        rawMap.set(key, Number(item.value));
    });

    const filled = [];

    // Only apply cumulative sum for revenue
    const isCumulative = alias === 'revenue';
    let cumulative = 0;

    labels.forEach(label => {
        let value = 0;

        if (range === 'day') {
            // For hour data, match the formatted hour
            value = rawMap.get(label) ?? 0;
        } else if (range === 'year') {
            // For month data
            value = rawMap.get(label) ?? 0;
        } else {
            // For date data, ensure proper date matching
            const dateStr = new Date(label).toISOString().slice(0, 10);
            value = rawMap.get(dateStr) ?? 0;
        }

        if (isCumulative) {
            cumulative += value;
            filled.push({
                label: range === 'day' ? `${label}:00` : label,
                value: cumulative,
            });
        } else {
            filled.push({
                label: range === 'day' ? `${label}:00` : label,
                value: value,
            });
        }
    });

    return filled;
}

// ---- Main GET ----

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const range = searchParams.get("range") || "day";

        // Get DB time for consistency
        const dbNowRows = await query("SELECT NOW() AS dbNow");
        const dbNow = dbNowRows?.[0]?.dbNow ?? new Date().toISOString();

        // Totals (unchanged)
        const [totalUsersRow, totalBookingsRow, totalPaymentsRow, totalRevenueRow] = await Promise.all([
            query("SELECT COUNT(*) AS totalUsers FROM users"),
            query("SELECT COUNT(*) AS totalBookings FROM bookings"),
            query("SELECT COUNT(*) AS totalPayments FROM payments"),
            query("SELECT IFNULL(SUM(amount),0) AS totalRevenue FROM payments WHERE status IN ('success','paid')")
        ]);

        const totals = {
            totalUsers: Number(totalUsersRow?.[0]?.totalUsers ?? 0),
            totalBookings: Number(totalBookingsRow?.[0]?.totalBookings ?? 0),
            totalPayments: Number(totalPaymentsRow?.[0]?.totalPayments ?? 0),
            totalRevenue: Number(totalRevenueRow?.[0]?.totalRevenue ?? 0),
        };

        const tables = [
            { name: "users", column: "created_at", statusFilter: "", sum: false, alias: "users" },
            { name: "bookings", column: "created_at", statusFilter: "", sum: false, alias: "bookings" },
            { name: "payments", column: "paid_at", statusFilter: "AND status IN ('success','paid')", sum: false, alias: "payments" },
            { name: "payments", column: "paid_at", statusFilter: "AND status IN ('success','paid')", sum: true, alias: "revenue" },
        ];

        const graphResults = await Promise.all(tables.map(async t => {
            const { groupBy } = getGrouping(range, t.column);
            const filter = getDateFilter(range, t.column);

            const sql = `
                SELECT ${groupBy} AS label, ${t.sum ? 'SUM(amount)' : 'COUNT(*)'} AS value
                FROM ${t.name}
                WHERE ${filter} ${t.statusFilter}
                GROUP BY ${groupBy}
                ORDER BY ${groupBy}
            `;

            const raw = await query(sql);
            return {
                alias: t.alias,
                data: fillMissingData(raw, range, t.alias, dbNow)
            };
        }));

        const graphs = {};
        graphResults.forEach(g => graphs[g.alias] = g.data);

        return NextResponse.json({ totals, graphs }, { status: 200 });
    } catch (err) {
        console.error("❌ Admin Stats Error:", err);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}