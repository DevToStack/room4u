export const emailTemplates = {
  adminBooking: ({
    customerName,
    customerEmail,
    apartmentName,
    checkIn,
    checkOut,
    totalPrice,
    adminDashboardUrl
  }) => `
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
  `,

  // 💳 NEW: Payment confirmation template for admins
  adminPayment: ({
    customerName,
    customerEmail,
    apartmentName,
    checkIn,
    checkOut,
    totalPrice,
    paymentId,
    paymentDate,
    adminDashboardUrl
  }) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Payment Received</title>
  </head>
  <body style="margin:0; font-family:Arial, sans-serif; background-color:#0a0a0a; color:#fafafa;">
    
    <div style="max-width:600px; margin:0 auto; background-color:#1e293b; border-radius:12px; overflow:hidden;">
      
      <!-- Header -->
      <div style="background-color:#10b981; padding:20px; text-align:center;">
        <h1 style="margin:0; font-size:22px; color:#fff; font-weight:bold;">
          <svg xmlns="http://www.w3.org/2000/svg" style="width:20px;height:20px;vertical-align:middle;margin-right:6px;" fill="currentColor" viewBox="0 0 576 512">
            <path d="M400 96l0 .7c-5.3-.4-10.6-.7-16-.7H256c-16.5 0-32.5 2.1-47.8 6c-.1-2-.2-4-.2-6c0-53 43-96 96-96s96 43 96 96zm-16 32c3.5 0 7 .1 10.4 .3c4.2 .3 8.4 .7 12.6 1.3C424.6 109.1 450.8 96 480 96h32l-18.8 75.1c15.8 14.8 28.7 32.8 37.5 52.9H544c17.7 0 32 14.3 32 32v96c0 17.7-14.3 32-32 32H512c-9.1 12.1-19.9 22.9-32 32v64c0 17.7-14.3 32-32 32H416c-17.7 0-32-14.3-32-32V448H256v32c0 17.7-14.3 32-32 32H192c-17.7 0-32-14.3-32-32V416c-34.9-26.2-58.7-66.3-63.2-112H68c-37.6 0-68-30.4-68-68s30.4-68 68-68H80c-1-35-36.3-62.6-71.8-62.1C3.8 128.9 0 132.6 0 137c0 4.5 3.2 8.3 7.6 8.9C30 148.5 48 169.5 48 195c0 3.2-.6 6.2-1.6 9.1c-5.6 17.7-20.9 30.6-39.5 32.5C2.6 238.9 0 242.6 0 247c0 5 3.3 9.1 8.1 10.5C43.4 264.5 68 292.5 68 327c0 2.1-.2 4.1-.5 6.1c-2.3 14.3-10.9 26.5-23.1 33.4C40.2 371.8 32 383 32 396c0 4.8 1.7 9.3 4.6 12.8C49.8 423.7 58.4 432 68 432h10.3c12.1 0 23.9-3.7 33.9-10.5l10.5-6.9c9.9-6.5 22.3-8.1 33.4-4.2c17.5 6.1 36.5 9.6 56.6 9.6c42.8 0 80.8-20.9 104-53.1c23.2 32.1 61.2 53.1 104 53.1c13.8 0 27-2.2 39.3-6.1c9.1-2.9 19-1.1 26.6 4.9l13.3 9.9c10.3 7.7 23.1 12.3 36.5 12.3h7.9c0 0 0 0 0 0h4c17.7 0 32-14.3 32-32V288c0-17.7-14.3-32-32-32H384l0-96h48c8.8 0 16-7.2 16-16s-7.2-16-16-16H480c-17.7 0-32 14.3-32 32v32h-8.2c-33.3 0-61.6-22.1-70.4-52.8c-13-45.7-54.5-75.2-101.8-75.2c-47.3 0-88.8 29.5-101.8 75.2C155.8 153.9 127.5 176 94.2 176H80c-8.8 0-16-7.2-16-16s7.2-16 16-16H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H184c-22.1 0-39.9-17.9-39.9-40c0-28.9 25.6-40 56-40c30.4 0 56 11.1 56 40c0 22.1-17.9 40-40 40H256z"/>
          </svg>
          Payment Received
        </h1>
        <p style="margin:5px 0 0; font-size:14px; color:#f0fdfa;">Booking Confirmed - Payment Successful</p>
      </div>
      
      <!-- Body Card -->
      <div style="padding:10px; background-color:#0f172a; border-radius:0 0 12px 12px;">
        
        <!-- Success Message -->
        <div style="background-color:#064e3b; padding:12px; border-radius:6px; margin-bottom:20px; text-align:center;">
          <p style="margin:0; font-size:16px; color:#10b981; font-weight:bold;">
            ✅ Payment of ₹${totalPrice} successfully received from ${customerName}
          </p>
        </div>
        
        <!-- Customer Name -->
        <p style="font-size:16px; color:#10b981; font-weight:bold; display:flex; align-items:center; margin-bottom:15px;">
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
          <tr style="background-color:#14272a;"><td style="font-weight:bold;">Total Amount</td><td>₹${totalPrice}</td></tr>
          <tr style="background-color:#0f1e29;"><td style="font-weight:bold;">Payment ID</td><td>${paymentId}</td></tr>
          <tr style="background-color:#14272a;"><td style="font-weight:bold;">Payment Date</td><td>${paymentDate}</td></tr>
        </table>
        
        <!-- CTA Button -->
        <div style="text-align:center; margin:20px 0;">
          <a href="${adminDashboardUrl}" style="display:inline-block; background-color:#10b981; color:#fff; text-decoration:none; font-weight:bold; padding:12px 24px; border-radius:6px; font-size:14px;">
            View Booking Details
          </a>
        </div>
        
        <!-- Footer -->
        <p style="font-size:12px; color:#94a3b8; text-align:center; margin-top:20px;">
          This is an automated payment confirmation from Apartment Booking System. Please do not reply to this email.
        </p>
        
      </div>
    </div>
  </body>
  </html>
  `
};