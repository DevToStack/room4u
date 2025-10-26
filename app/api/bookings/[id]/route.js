import pool from "@/lib/db";

export async function POST(req, { params }) {
    try {
        const { id } = params;

        const connection = await pool.getConnection();

        await connection.execute(
            `UPDATE bookings SET status = 'cancelled' WHERE id = ? AND status != 'cancelled'`,
            [id]
        );

        connection.release();
        return Response.json({ success: true });
    } catch (error) {
        console.error(error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}
