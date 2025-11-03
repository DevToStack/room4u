export function getReceiptTemplet(data){

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

            * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            }

            body {
            font-family: 'Inter', sans-serif;
            background: #ffffff;
            color: #1a1a1a;
            line-height: 1.4;
            font-size: 9px;
            width: 148mm;
            height: 210mm;
            overflow: hidden;
            position: relative;
            }

            .receipt-container {
            width: 100%;
            height: 100%;
            padding: 6mm 10mm;
            display: flex;
            flex-direction: column;
            position: relative;
            background: #ffffff;
            border: 0.5px solid #e0e0e0;
            }

            /* IMPROVED HEADER */
            .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4mm;
            padding-bottom: 3mm;
            border-bottom: 1px solid #e0e0e0;
            }

            .company-info {
            display: flex;
            align-items: center;
            gap: 2mm;
            }

            .company-logo {
            width: 12mm;
            height: 12mm;
            background: #008080;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 20px;
            }

            .company-text {
            display: flex;
            flex-direction: column;
            }

            .company-name {
            font-size: 12px;
            font-weight: 700;
            color: #008080;
            letter-spacing: -0.2px;
            }

            .company-tagline {
            font-size: 7px;
            color: #666;
            margin-top: 0.3mm;
            font-weight: 400;
            }

            .receipt-info {
            text-align: right;
            }

            .receipt-title {
            font-size: 10px;
            font-weight: 600;
            color: #1a1a1a;
            text-transform: uppercase;
            margin-bottom: 1mm;
            }

            .receipt-id {
            font-size: 8px;
            color: #ffffff;
            background: #008080;
            display: inline-block;
            padding: 1mm 2mm;
            border-radius: 8px;
            box-shadow: 0 0 2px rgba(0,0,0,0.1);
            }

            /* GRID */
            .compact-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4mm;
            margin-bottom: 3mm;
            }

            .section {
            margin-bottom: 3mm;
            }

            .section-title {
            font-size: 9px;
            font-weight: 600;
            color: #008080;
            margin-bottom: 2mm;
            text-transform: uppercase;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 1mm;
            letter-spacing: 0.2px;
            display: flex;
            align-items: center;
            gap: 2mm;
            }

            .section-title i {
            font-size: 8px;
            }

            .info-item {
            margin-bottom: 2mm;
            display: flex;
            align-items: flex-start;
            gap: 2mm;
            }

            .info-icon {
            width: 10px;
            text-align: center;
            color: #008080;
            font-size: 8px;
            margin-top: 0.5mm;
            }

            .info-content {
            flex: 1;
            }

            .info-label {
            font-weight: 500;
            color: #666;
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            }

            .info-value {
            font-weight: 400;
            color: #1a1a1a;
            font-size: 9px;
            margin-top: 0.3mm;
            }

            /* BOOKING CARD */
            .booking-card {
            background: #f9f9f9;
            border-radius: 4px;
            padding: 3mm;
            margin-top: 2mm;
            border: 1px solid #e0e0e0;
            }

            .apartment-title {
            font-size: 10px;
            font-weight: 600;
            color: #004d4d;
            margin-bottom: 2mm;
            display: flex;
            align-items: center;
            gap: 2mm;
            }

            .apartment-title i {
            color: #008080;
            font-size: 9px;
            }

            .dates-row {
            display: flex;
            gap: 2mm;
            margin-bottom: 2mm;
            }

            .date-box {
            flex: 1;
            padding: 2mm;
            background: #ffffff;
            border-radius: 3px;
            border: 1px solid #e0e0e0;
            text-align: center;
            }

            .date-icon {
            color: #008080;
            font-size: 7px;
            margin-bottom: 1mm;
            }

            .date-label {
            font-size: 7px;
            color: #666;
            text-transform: uppercase;
            }

            .date-value {
            font-size: 8px;
            font-weight: 500;
            color: #1a1a1a;
            margin: 0.5mm 0;
            }

            /* INVOICE TABLE */
            .invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin: 2mm 0;
            font-size: 8px;
            }

            .invoice-table th {
            background: #008080;
            color: #fff;
            padding: 2mm;
            text-align: left;
            font-weight: 600;
            }

            .invoice-table td {
            padding: 2mm;
            border-bottom: 1px solid #f0f0f0;
            }

            .text-right { text-align: right; }
            .text-center { text-align: center; }

            .total-row {
            background: #008080;
            color: #ffffff;
            font-weight: 600;
            }

            /* STATUS BADGES */
            .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 1mm;
            padding: 1mm 2mm;
            border-radius: 6px;
            font-size: 7px;
            font-weight: 600;
            text-transform: uppercase;
            }

            .status-paid { background: #008080; color: #fff; }
            .status-refunded { background: #666; color: #fff; }
            .status-pending { background: #e0e0e0; color: #666; }
            .status-confirmed { background: #4CAF50; color: #fff; }

            /* NOTICE BOX */
            .notice-box {
            background: #fffbea;
            border-left: 2px solid #ffb300;
            padding: 2mm;
            margin: 3mm 0;
            border-radius: 3px;
            font-size: 8px;
            display: flex;
            align-items: flex-start;
            gap: 2mm;
            }

            .notice-icon {
            color: #ffb300;
            font-size: 8px;
            margin-top: 0.2mm;
            }

            /* PAYMENT CARD */
            .payment-card {
            background: #f5f5f5;
            border-radius: 4px;
            padding: 3mm;
            border: 1px solid #e0e0e0;
            margin-top: 2mm;
            }

            /* FOOTER */
            .footer {
            margin-top: auto;
            padding-top: 3mm;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            color: #666;
            font-size: 7px;
            }

            .thank-you {
            font-size: 8px;
            color: #008080;
            font-weight: 500;
            margin-bottom: 1mm;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 2mm;
            }

            .security-stamp {
            position: absolute;
            bottom: 14mm;
            right: 10mm;
            transform: rotate(-15deg);
            opacity: 0.7;
            font-size: 7px;
            color: #008080;
            border: 1px solid #008080;
            padding: 1mm 2mm;
            border-radius: 3px;
            letter-spacing: 1px;
            display: flex;
            align-items: center;
            gap: 1mm;
            }

            .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            font-size: 30px;
            color: rgba(0,128,128,0.05);
            font-weight: 700;
            letter-spacing: 2px;
            user-select: none;
            }

            .divider {
            height: 1px;
            background: #e0e0e0;
            margin: 3mm 0;
            }

            .stats-row {
            display: flex;
            gap: 3mm;
            font-size: 7px;
            margin-top: 2mm;
            }

            .stat-item {
            display: flex;
            align-items: center;
            gap: 1mm;
            }

            .stat-icon {
            color: #008080;
            font-size: 6px;
            }
        </style>
        </head>
        <body>
        <div class="receipt-container">
            <div class="watermark">Rooms4U</div>

            <!-- IMPROVED HEADER -->
            <div class="header">
            <div class="company-info">
                <div class="company-logo">
                R4U
                </div>
                <div class="company-text">
                <div class="company-name">Rooms4U</div>
                <div class="company-tagline">Luxury Stays, Unforgettable Experiences</div>
                </div>
            </div>
            <div class="receipt-info">
                <div class="receipt-title">Booking Receipt</div>
                <div class="receipt-id"><i class="fas fa-hashtag"></i> Booking #${data.bookingId}</div>
            </div>
            </div>

            <div class="compact-grid">
            <div class="section">
                <div class="section-title"><i class="fas fa-user"></i> Guest Information</div>
                <div class="info-item">
                <div class="info-icon"><i class="fas fa-user-circle"></i></div>
                <div class="info-content">
                    <div class="info-label">Full Name</div>
                    <div class="info-value">${data.customerName}</div>
                </div>
                </div>
                <div class="info-item">
                <div class="info-icon"><i class="fas fa-envelope"></i></div>
                <div class="info-content">
                    <div class="info-label">Email</div>
                    <div class="info-value">${data.customerEmail}</div>
                </div>
                </div>
                ${data.customerPhone ? `
                <div class="info-item">
                <div class="info-icon"><i class="fas fa-phone"></i></div>
                <div class="info-content">
                    <div class="info-label">Phone</div>
                    <div class="info-value">${data.customerPhone}</div>
                </div>
                </div>` : ''}
                <div class="info-item">
                <div class="info-icon"><i class="fas fa-info-circle"></i></div>
                <div class="info-content">
                    <div class="info-label">Status</div>
                    <div class="info-value">
                    <span class="status-badge ${data.bookingStatus === 'confirmed' ? 'status-confirmed' : data.bookingStatus === 'paid' ? 'status-paid' : data.bookingStatus === 'cancelled' ? 'status-refunded' : 'status-pending'}">
                        <i class="fas ${data.bookingStatus === 'confirmed' ? 'fa-check-circle' : data.bookingStatus === 'paid' ? 'fa-check-circle' : data.bookingStatus === 'cancelled' ? 'fa-times-circle' : 'fa-clock'}"></i>
                        ${data.bookingStatus}
                    </span>
                    </div>
                </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title"><i class="fas fa-calendar-alt"></i> Stay Details</div>
                <div class="booking-card">
                <div class="apartment-title"><i class="fas fa-home"></i> ${data.apartment}</div>
                <div class="dates-row">
                    <div class="date-box">
                    <div class="date-icon"><i class="fas fa-sign-in-alt"></i></div>
                    <div class="date-label">Check-in</div>
                    <div class="date-value">${new Date(data.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    <div class="date-label">After 3:00 PM</div>
                    </div>
                    <div class="date-box">
                    <div class="date-icon"><i class="fas fa-sign-out-alt"></i></div>
                    <div class="date-label">Check-out</div>
                    <div class="date-value">${new Date(data.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    <div class="date-label">Before 11:00 AM</div>
                    </div>
                </div>
                <div class="stats-row">
                    <div class="stat-item">
                    <i class="fas fa-moon stat-icon"></i>
                    <strong>Nights:</strong> ${data.nights}
                    </div>
                    <div class="stat-item">
                    <i class="fas fa-users stat-icon"></i>
                    <strong>Guests:</strong> ${data.guests}
                    </div>
                </div>
                </div>
            </div>
            </div>

            <div class="divider"></div>

            <div class="notice-box">
            <div class="notice-icon"><i class="fas fa-exclamation-triangle"></i></div>
            <div>
                <strong>Important:</strong> Present this receipt and a valid ID at check-in. Early check-in or late check-out is subject to availability and applicable charges.
            </div>
            </div>

            <div class="section">
            <div class="section-title"><i class="fas fa-file-invoice-dollar"></i> Payment Summary</div>
            <table class="invoice-table">
                <thead>
                <tr>
                    <th>Description</th>
                    <th class="text-center">Nights</th>
                    <th class="text-right">Rate</th>
                    <th class="text-right">Amount</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>${data.apartment}</td>
                    <td class="text-center">${data.nights}</td>
                    <td class="text-right">₹${parseFloat(data.price_per_night).toFixed(2)}</td>
                    <td class="text-right">₹${parseFloat(data.total).toFixed(2)}</td>
                </tr>
                <tr class="total-row">
                    <td colspan="3" class="text-right">Total Amount</td>
                    <td class="text-right">₹${parseFloat(data.total).toFixed(2)}</td>
                </tr>
                </tbody>
            </table>
            </div>

            <div class="payment-card">
            <div class="section-title"><i class="fas fa-credit-card"></i> Payment Information</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2mm;">
                <div class="info-item">
                <div class="info-icon"><i class="fas fa-money-bill-wave"></i></div>
                <div class="info-content">
                    <div class="info-label">Payment Status</div>
                    <div class="info-value">
                    <span class="status-badge ${data.paymentStatus === 'paid' ? 'status-paid' : data.paymentStatus === 'refunded' ? 'status-refunded' : 'status-pending'}">
                        <i class="fas ${data.paymentStatus === 'paid' ? 'fa-check-circle' : data.paymentStatus === 'refunded' ? 'fa-undo' : 'fa-clock'}"></i>
                        ${data.paymentStatus || 'Pending'}
                    </span>
                    </div>
                </div>
                </div>
                <div class="info-item">
                <div class="info-icon"><i class="fas fa-wallet"></i></div>
                <div class="info-content">
                    <div class="info-label">Payment Method</div>
                    <div class="info-value">${data.paymentMethod || 'Online Payment'}</div>
                </div>
                </div>
                ${data.transactionId ? `
                <div class="info-item">
                <div class="info-icon"><i class="fas fa-receipt"></i></div>
                <div class="info-content">
                    <div class="info-label">Transaction ID</div>
                    <div class="info-value" style="font-size: 7px;">${data.transactionId}</div>
                </div>
                </div>` : ''}
                ${data.paymentDate ? `
                <div class="info-item">
                <div class="info-icon"><i class="fas fa-calendar-check"></i></div>
                <div class="info-content">
                    <div class="info-label">Payment Date</div>
                    <div class="info-value">${new Date(data.paymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </div>
                </div>` : ''}
            </div>
            </div>

            <div class="security-stamp">
            <i class="fas fa-shield-alt"></i> VERIFIED
            </div>

            <div class="footer">
            <div class="thank-you">
                <i class="fas fa-heart"></i> Thank you for choosing StayEase Apartments! <i class="fas fa-heart"></i>
            </div>
            <div><i class="fas fa-envelope"></i> Questions? Contact <b>support@stayease.com</b> or <i class="fas fa-phone"></i> call +91-XXXXX-XXXXX</div>
            <div style="margin-top: 1mm;">
                <i class="fas fa-clock"></i> Generated on ${new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
            </div>
        </div>
        </body>
        </html>
        `;
};