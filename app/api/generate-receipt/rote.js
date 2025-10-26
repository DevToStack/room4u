// app/api/generate-receipt/route.js
import puppeteer from 'puppeteer';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const data = await req.json();

        const {
            customerName,
            customerEmail,
            apartmentTitle,
            location,
            checkIn,
            checkOut,
            amount,
            method,
            bookingId,
        } = data;

        const htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: #f9f9f9;
              padding: 40px;
              color: #333;
            }
            .receipt-container {
              background: #fff;
              padding: 30px;
              border-radius: 12px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
              max-width: 700px;
              margin: auto;
            }
            h1 {
              color: #2b6cb0;
              text-align: center;
            }
            .section {
              margin-bottom: 25px;
            }
            .section h2 {
              font-size: 18px;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 8px;
              color: #2d3748;
              margin-bottom: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            table th, table td {
              padding: 12px;
              border: 1px solid #e2e8f0;
              text-align: left;
            }
            table th {
              background-color: #ebf8ff;
              color: #2b6cb0;
            }
            table, th, td {
              border-radius: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 12px;
              color: #888;
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <h1>🏨 YourStay – Booking Receipt</h1>

            <div class="section">
              <h2>Customer Information</h2>
              <p><strong>Name:</strong> ${customerName}</p>
              <p><strong>Email:</strong> ${customerEmail}</p>
              <p><strong>Booking ID:</strong> ${bookingId}</p>
            </div>

            <div class="section">
              <h2>Apartment Details</h2>
              <p><strong>Apartment:</strong> ${apartmentTitle}</p>
              <p><strong>Location:</strong> ${location}</p>
              <p><strong>Check-in:</strong> ${checkIn}</p>
              <p><strong>Check-out:</strong> ${checkOut}</p>
            </div>

            <div class="section">
              <h2>Payment Summary</h2>
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Method</th>
                    <th>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Apartment Booking</td>
                    <td>${method}</td>
                    <td>${amount}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="footer">
              © ${new Date().getFullYear()} YourStay. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `;

        const browser = await puppeteer.launch({
            headless: 'new',
        });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="booking-receipt-${bookingId}.pdf"`,
            },
        });
    } catch (error) {
        console.error('PDF generation error:', error);
        return NextResponse.json({ error: 'Failed to generate receipt' }, { status: 500 });
    }
}
