import connection from "@/lib/db";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { getReceiptTemplet } from "@/lib/receipt/templet"

export const dynamic = "force-dynamic";

// Adjust Chromium for different environments
chromium.setGraphicsMode = false;

export async function GET(req, { params }) {
  const { id } = await params;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tokenResult = verifyToken(token);
    if (!tokenResult.valid) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const userId = tokenResult.decoded.id;

    const [user] = await connection.query(`SELECT id FROM users WHERE id = ?`, [userId]);
    if (user.length === 0)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const [rows] = await connection.query(
      `
            SELECT 
                b.id AS bookingId,
                b.start_date AS checkIn,
                b.end_date AS checkOut,
                b.nights,
                b.guests,
                b.status AS bookingStatus,
                b.user_id,  
                a.title AS apartment,
                a.price_per_night,
                p.amount AS total,
                p.status AS paymentStatus,
                p.method AS paymentMethod,
                p.paid_at AS paymentDate,
                p.razorpay_payment_id AS transactionId,
                u.name AS customerName,
                u.email AS customerEmail,
                u.phone_number AS customerPhone
            FROM bookings b
            JOIN apartments a ON b.apartment_id = a.id
            JOIN users u ON b.user_id = u.id
            LEFT JOIN payments p ON b.id = p.booking_id
            WHERE p.id = ?
        `,
      [id]
    );

    if (rows.length === 0)
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    const data = rows[0];
    if (data.user_id !== userId)
      return NextResponse.json({ error: "Access denied" }, { status: 403 });

    if (data.paymentStatus !== "paid")
      return NextResponse.json({ error: "Payment not completed" }, { status: 403 });

    let executablePath = await chromium.executablePath();

    if (!executablePath) {
      // fallback for local development (Windows/Mac)
      executablePath = puppeteer.executablePath();
    }

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });


    const page = await browser.newPage();
    await page.setContent(getReceiptTemplet(data), { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A5",
      printBackground: true,
      margin: {
        top: "0mm",
        bottom: "0mm",
        left: "0mm",
        right: "0mm",
      },
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=receipt-${id}.pdf`,
      },
    });
  } catch (err) {
    console.error("Receipt generation error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}