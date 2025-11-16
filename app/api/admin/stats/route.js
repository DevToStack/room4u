import { NextResponse } from "next/server";
import { query } from "@/lib/mysql-wrapper";

// ----------------- Helpers -----------------

function getGrouping(range, column = "created_at") {
    switch (range) {
        case "day":
            return { groupBy: `HOUR(${column})` };
        case "week":
        case "month":
            return { groupBy: `DATE(${column})` };
        case "year":
            return { groupBy: `DATE_FORMAT(${column}, '%Y-%m')` };
        default:
            return { groupBy: `DATE(${column})` };
    }
}

function getDateFilter(range, column = "created_at") {
    switch (range) {
        case "day": return `${column} >= DATE_SUB(NOW(), INTERVAL 1 DAY)`;
        case "week": return `${column} >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
        case "month": return `${column} >= DATE_SUB(NOW(), INTERVAL 1 MONTH)`;
        case "year": return `${column} >= DATE_SUB(NOW(), INTERVAL 1 YEAR)`;
        default: return `${column} >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
    }
}

function generateLabels(range, now = new Date()) {
    const labels = [];
    const d = new Date(now);

    if (range === "day") {
        for (let i = 23; i >= 0; i--) {
            const h = (now.getHours() - i + 24) % 24;
            labels.push(String(h).padStart(2, "0"));
        }
    }

    if (range === "week") {
        for (let i = 6; i >= 0; i--) {
            const x = new Date(now);
            x.setDate(now.getDate() - i);
            labels.push(x.toISOString().slice(0, 10));
        }
    }

    if (range === "month") {
        const start = new Date(now);
        start.setDate(now.getDate() - 29);
        for (let i = 0; i < 30; i++) {
            const x = new Date(start);
            x.setDate(start.getDate() + i);
            labels.push(x.toISOString().slice(0, 10));
        }
    }

    if (range === "year") {
        for (let i = 11; i >= 0; i--) {
            const x = new Date(now.getFullYear(), now.getMonth() - i, 1);
            labels.push(`${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}`);
        }
    }

    return labels;
}

function fillMissingData(raw = [], range, alias, nowDate = null) {
    const now = nowDate ? new Date(nowDate) : new Date();
    const labels = generateLabels(range, now);

    const rawMap = new Map();
    raw.forEach(r => {
        rawMap.set(String(r.label), Number(r.value));
    });

    const filled = [];
    let cumulative = 0;
    const isRevenue = alias === "revenue";

    labels.forEach(label => {
        let value = rawMap.get(label) ?? 0;

        if (isRevenue) {
            cumulative += value;
            value = cumulative;
        }

        filled.push({
            label: range === "day" ? `${label}:00` : label,
            value
        });
    });

    return filled;
}

// ----------------- MAIN API -----------------

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const range = searchParams.get("range") || "day";

        const nowRow = await query("SELECT NOW() AS dbNow");
        const dbNow = nowRow?.[0]?.dbNow ?? new Date();

        // ---- Total counts ----
        const [
            usersCount,
            bookingsCount,
            paymentsCount,
            revenueRow,
            pendingRow,
            confirmedRow,
            cancelledRow
        ] = await Promise.all([
            query("SELECT COUNT(*) AS totalUsers FROM users"),
            query("SELECT COUNT(*) AS totalBookings FROM bookings"),
            query("SELECT COUNT(*) AS totalPayments FROM payments"),
            query("SELECT IFNULL(SUM(amount),0) AS totalRevenue FROM payments WHERE status IN ('paid')"),
            query("SELECT COUNT(*) AS pendingBookings FROM bookings WHERE status = 'pending'"),
            query("SELECT COUNT(*) AS confirmedBookings FROM bookings WHERE status = 'confirmed'"),
            query("SELECT COUNT(*) AS cancelledBookings FROM bookings WHERE status = 'cancelled'")
        ]);

        // ---- Totals Object ----
        const totals = {
            totalUsers: Number(usersCount[0].totalUsers),
            totalBookings: Number(bookingsCount[0].totalBookings),
            totalPayments: Number(paymentsCount[0].totalPayments),
            totalRevenue: Number(revenueRow[0].totalRevenue),
            pendingBookings: Number(pendingRow[0].pendingBookings),
            confirmedBookings: Number(confirmedRow[0].confirmedBookings),
            cancelledBookings: Number(cancelledRow[0].cancelledBookings),
        };

        // ---- Upcoming Bookings (7 days) ----
        const upcoming = await query(`
            SELECT 
                b.id,
                b.start_date,
                b.end_date,
                b.total_amount,
                b.status,
                b.created_at,
                u.name AS customer_name,
                u.email AS customer_email
            FROM bookings b
            LEFT JOIN users u ON b.user_id = u.id
            WHERE b.start_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
            AND b.status IN ('pending','confirmed')
            ORDER BY b.start_date ASC
            LIMIT 20
        `);

        const upcomingBookings = upcoming.map(b => ({
            id: b.id,
            checkInDate: b.start_date,
            checkOutDate: b.end_date,
            totalAmount: Number(b.total_amount),
            status: b.status,
            createdAt: b.created_at,
            customer: {
                name: b.customer_name,
                email: b.customer_email
            }
        }));

        // ---- Recent Bookings (latest 10) ----
        const recent = await query(`
            SELECT 
                b.id,
                b.start_date,
                b.end_date,
                b.total_amount,
                b.status,
                b.created_at,
                u.name AS customer_name,
                u.email AS customer_email
            FROM bookings b
            LEFT JOIN users u ON b.user_id = u.id
            ORDER BY b.created_at DESC
            LIMIT 10
        `);

        const recentBookings = recent.map(b => ({
            id: b.id,
            checkInDate: b.start_date,
            checkOutDate: b.end_date,
            totalAmount: Number(b.total_amount),
            status: b.status,
            createdAt: b.created_at,
            customer: {
                name: b.customer_name,
                email: b.customer_email
            }
        }));

        // ---- Booking Status Pie ----
        const statusRows = await query(`
            SELECT status, COUNT(*) AS count 
            FROM bookings 
            GROUP BY status
        `);

        const statusDistribution = statusRows.reduce((acc, r) => {
            acc[r.status] = Number(r.count);
            return acc;
        }, {});

        // ---- Graph Tables ----
        const graphTables = [
            { name: "users", column: "created_at", sum: false, alias: "users" },
            { name: "bookings", column: "created_at", sum: false, alias: "bookings" },
            { name: "payments", column: "paid_at", sum: false, alias: "payments", status: "AND status='paid'" },
            { name: "payments", column: "paid_at", sum: true, alias: "revenue", status: "AND status='paid'" },
        ];

        const graphResults = await Promise.all(
            graphTables.map(async t => {
                const { groupBy } = getGrouping(range, t.column);
                const filter = getDateFilter(range, t.column);

                const sql = `
                    SELECT 
                        ${groupBy} AS label,
                        ${t.sum ? "SUM(amount)" : "COUNT(*)"} AS value
                    FROM ${t.name}
                    WHERE ${filter} ${t.status ? t.status : ""}
                    GROUP BY ${groupBy}
                    ORDER BY ${groupBy}
                `;

                const raw = await query(sql);
                return {
                    alias: t.alias,
                    data: fillMissingData(raw, range, t.alias, dbNow)
                };
            })
        );

        const graphs = {};
        graphResults.forEach(g => (graphs[g.alias] = g.data));

        return NextResponse.json({
            totals,
            graphs,
            bookings: {
                statistics: {
                    pending: totals.pendingBookings,
                    confirmed: totals.confirmedBookings,
                    cancelled: totals.cancelledBookings,
                    total: totals.totalBookings,
                },
                upcoming: upcomingBookings,
                recent: recentBookings,
                statusDistribution
            }
        });

    } catch (err) {
        console.error("❌ Dashboard Stats Error:", err);
        return NextResponse.json({ error: "Failed to load dashboard stats" }, { status: 500 });
    }
}
