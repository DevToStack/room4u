export const emailTemplates = {
  adminBooking: ({
    customerName,
    customerEmail,
    apartmentName,
    checkIn,
    checkOut,
    totalPrice,
    adminDashboardUrl
  }) => {

    const progress = 50; // 🔥 Constant progress value (Booking Created)

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>New Booking Request</title>
    </head>
    <body style="margin:0; font-family:Arial, sans-serif; background-color:#0a0a0a; color:#fafafa;">
      
      <div style="max-width:600px; margin:0 auto; background-color:#1e293b; border-radius:12px; overflow:hidden;">
        
        <!-- Header -->
        <div style="background-color:#14b8a6; padding:20px; text-align:center;">
          <h1 style="margin:0; font-size:22px; color:#fff; font-weight:bold;">
            <svg xmlns="http://www.w3.org/2000/svg" style="width:20px;height:20px;vertical-align:middle;margin-right:6px;" fill="currentColor" viewBox="0 0 512 512">
              <path d="M464 64h-48V24a8 8 0 0 0-16 0v40H112V24a8 8 0 0 0-16 0v40H48A48 48 0 0 0 0 112v336a48 48 0 0 0 48 48h416a48 48 0 0 0 48-48V112a48 48 0 0 0-48-48zM464 448H48V192h416z"/>
            </svg>
            New Booking Request
          </h1>
          <p style="margin:5px 0 0; font-size:14px; color:#f0fdfa;">Action Required - Pending Approval</p>
        </div>

        <!-- 🔥 Progress Bar -->
        <div style="padding:20px; background-color:#0f172a;">
          <p style="font-size:14px; margin:0 0 8px; color:#cbd5e1;">
            Booking Progress: <strong>${progress}%</strong>
          </p>

          <!-- Bar -->
          <div style="width:100%; height:12px; background:#1e293b; border-radius:8px; overflow:hidden;">
            <div style="
              width:${progress}%;
              height:12px;
              background:linear-gradient(90deg,#14b8a6,#06b6d4);
              transition:width .4s ease;
            "></div>
          </div>

          <!-- Steps -->
          <div style="display:flex; justify-content:space-between; margin-top:10px; font-size:12px; color:#94a3b8;">
            <span style="color:${progress >= 50 ? "#10b981" : "#94a3b8"};">Booking Created</span>
            <span style="color:#94a3b8;">Admin Approval</span>
            <span style="color:#94a3b8;">Payment</span>
          </div>
        </div>
        
        <!-- Body Card -->
        <div style="padding:10px; background-color:#0f172a; border-radius:0 0 12px 12px;">
          
          <!-- Customer Name -->
          <p style="font-size:16px; color:#14b8a6; font-weight:bold; display:flex; align-items:center; margin-bottom:15px;">
            <svg xmlns="http://www.w3.org/2000/svg" style="width:16px;height:16px;margin-right:6px;" fill="currentColor" viewBox="0 0 448 512">
              <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm89.6 32h-11.1c-22.4 10.5-47.5 16-74.5 16s-52.1-5.5-74.5-16h-11.1C60.2 288 0 348.2 0 422.4V464a48 48 0 0 0 48 48h352a48 48 0 0 0 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"/>
            </svg>
            ${customerName}
          </p>
          
          <!-- Details Table -->
          <table width="100%" cellpadding="8" cellspacing="0" style="font-size:14px; color:#e2e8f0; border-collapse:collapse;">
            <tr style="background-color:#14272a;"><td width="30%" style="font-weight:bold;">Email</td><td>${customerEmail}</td></tr>
            <tr style="background-color:#0f1e29;"><td style="font-weight:bold;">Apartment</td><td>${apartmentName}</td></tr>
            <tr style="background-color:#14272a;"><td style="font-weight:bold;">Check-in</td><td>${checkIn}</td></tr>
            <tr style="background-color:#0f1e29;"><td style="font-weight:bold;">Check-out</td><td>${checkOut}</td></tr>
            <tr style="background-color:#14272a;"><td style="font-weight:bold;">Total Price</td><td>₹${totalPrice}</td></tr>
          </table>
          
          <!-- CTA Button -->
          <div style="text-align:center; margin:20px 0;">
            <a href="${adminDashboardUrl}" style="display:inline-block; background-color:#14b8a6; color:#fff; text-decoration:none; font-weight:bold; padding:12px 24px; border-radius:6px; font-size:14px;">
              Review & Confirm Booking
            </a>
          </div>
          
          <!-- Footer -->
          <p style="font-size:12px; color:#94a3b8; text-align:center; margin-top:20px;">
            This is an automated notification from Apartment Booking System. Please do not reply to this email.
          </p>
          
        </div>
      </div>
    </body>
    </html>
    `;
  },


  // 💳 NEW: Admin Payment Notification Email (Dark Premium UI)
  adminPayment: ({
    adminName,
    customerName,
    customerEmail,
    customerPhone,
    apartmentName,
    checkIn,
    checkOut,
    totalPrice,
    paymentId,
    paymentDate,
    paymentStatus,
    transactionType,
    adminDashboardUrl
  }) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Payment Received</title>
  </head>
  <body style="margin:0; font-family:Arial, sans-serif; background-color:#0a0a0a; color:#fafafa;">
  
    <div style="max-width:600px; margin:0 auto; background-color:#1e293b; border-radius:12px; overflow:hidden;">
  
      <!-- Header -->
      <div style="background-color:#10b981; padding:20px; text-align:center;">
        <h1 style="margin:0; font-size:22px; color:#fff; font-weight:bold;">
          <svg xmlns="http://www.w3.org/2000/svg" style="width:20px;height:20px;vertical-align:middle;margin-right:6px;" fill="currentColor" viewBox="0 0 576 512">
            <path d="M400 96l0 .7c-5.3-.4-10.6-.7-16-.7H256c-16.5 0-32.5 2.1-47.8 6c-.1-2-.2-4-.2-6c0-53 43-96 96-96s96 43 96 96z"/>
          </svg>
          New Payment Received
        </h1>
        <p style="margin:5px 0 0; font-size:14px; color:#f0fdfa;">A customer has completed the payment successfully</p>
      </div>
  
      <!-- Body -->
      <div style="padding:16px; background-color:#0f172a;">
  
        <div style="background-color:#064e3b; padding:12px; border-radius:6px; margin-bottom:20px; text-align:center;">
          <p style="margin:0; font-size:16px; color:#10b981; font-weight:bold;">
            💰 ₹${totalPrice} Payment Completed by ${customerName}
          </p>
        </div>
  
        <!-- Customer -->
        <p style="font-size:16px; color:#10b981; font-weight:bold; margin-bottom:10px;">
          👤 Customer Information
        </p>
  
        <table width="100%" cellpadding="8" cellspacing="0" style="font-size:14px; color:#e2e8f0; border-collapse:collapse;">
          <tr style="background-color:#14272a;"><td width="30%" style="font-weight:bold;">Name</td><td>${customerName}</td></tr>
          <tr style="background-color:#0f1e29;"><td style="font-weight:bold;">Email</td><td>${customerEmail}</td></tr>
          <tr style="background-color:#14272a;"><td style="font-weight:bold;">Phone</td><td>${customerPhone}</td></tr>
        </table>
  
        <br/>
  
        <!-- Booking Info -->
        <p style="font-size:16px; color:#10b981; font-weight:bold; margin-bottom:10px;">
          🏠 Booking Details
        </p>
  
        <table width="100%" cellpadding="8" cellspacing="0" style="font-size:14px; color:#e2e8f0; border-collapse:collapse;">
          <tr style="background-color:#0f1e29;"><td width="30%" style="font-weight:bold;">Apartment</td><td>${apartmentName}</td></tr>
          <tr style="background-color:#14272a;"><td style="font-weight:bold;">Check-in</td><td>${checkIn}</td></tr>
          <tr style="background-color:#0f1e29;"><td style="font-weight:bold;">Check-out</td><td>${checkOut}</td></tr>
        </table>
  
        <br/>
  
        <!-- Payment Info -->
        <p style="font-size:16px; color:#10b981; font-weight:bold; margin-bottom:10px;">
          💳 Payment Details
        </p>
  
        <table width="100%" cellpadding="8" cellspacing="0" style="font-size:14px; color:#e2e8f0; border-collapse:collapse;">
          <tr style="background-color:#14272a;"><td width="30%" style="font-weight:bold;">Amount</td><td>₹${totalPrice}</td></tr>
          <tr style="background-color:#0f1e29;"><td style="font-weight:bold;">Payment ID</td><td>${paymentId}</td></tr>
          <tr style="background-color:#14272a;"><td style="font-weight:bold;">Status</td><td>${paymentStatus}</td></tr>
          <tr style="background-color:#0f1e29;"><td style="font-weight:bold;">Type</td><td>${transactionType}</td></tr>
          <tr style="background-color:#14272a;"><td style="font-weight:bold;">Date</td><td>${paymentDate}</td></tr>
        </table>
  
        <!-- Button -->
        <div style="text-align:center; margin:24px 0 10px;">
          <a href="${adminDashboardUrl}" style="display:inline-block; background-color:#10b981; color:#fff; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:bold;">
            Go to Admin Dashboard
          </a>
        </div>
  
        <p style="font-size:12px; color:#94a3b8; text-align:center; margin-top:20px;">
          This is an automated notification from your Apartment Booking System.
        </p>
  
      </div>
    </div>
  
  </body>
  </html>
  `
};
  