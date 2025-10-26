import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,  // your Gmail
    pass: process.env.MAIL_PASS,  // Gmail App Password
  },
});

export const emailService = {
  async sendBookingConfirmation({ to, userName, apartmentTitle, bookingId, startDate, endDate, nextSteps }) {
    const mailOptions = {
      from: process.env.MAIL_USER,
      to,
      subject: `🎉 Booking Confirmed - ${apartmentTitle}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking Confirmed</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Inter', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    padding: 20px;
                }
                
                .email-container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                }
                
                .header {
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    padding: 40px 30px;
                    text-align: center;
                    color: white;
                }
                
                .header h1 {
                    font-size: 28px;
                    font-weight: 700;
                    margin-bottom: 10px;
                }
                
                .header-icon {
                    font-size: 48px;
                    margin-bottom: 20px;
                }
                
                .content {
                    padding: 40px 30px;
                }
                
                .greeting {
                    font-size: 18px;
                    color: #666;
                    margin-bottom: 30px;
                }
                
                .booking-card {
                    background: linear-gradient(135deg, #f8f9ff, #f0f2ff);
                    border-radius: 12px;
                    padding: 25px;
                    margin: 25px 0;
                    border-left: 4px solid #4CAF50;
                }
                
                .booking-card h3 {
                    color: #2d3748;
                    margin-bottom: 20px;
                    font-size: 20px;
                }
                
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 12px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid #e2e8f0;
                }
                
                .detail-row:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                }
                
                .detail-label {
                    color: #718096;
                    font-weight: 500;
                }
                
                .detail-value {
                    color: #2d3748;
                    font-weight: 600;
                    text-align: right;
                }
                
                .next-steps {
                    background: #fff9e6;
                    border: 1px solid #ffd666;
                    border-radius: 12px;
                    padding: 20px;
                    margin: 25px 0;
                }
                
                .next-steps h4 {
                    color: #d97706;
                    margin-bottom: 10px;
                    font-size: 16px;
                }
                
                .footer {
                    text-align: center;
                    padding: 30px;
                    background: #f7fafc;
                    color: #718096;
                    border-top: 1px solid #e2e8f0;
                }
                
                .contact-info {
                    margin-top: 15px;
                    font-size: 14px;
                }
                
                @media (max-width: 600px) {
                    .content {
                        padding: 25px 20px;
                    }
                    
                    .header {
                        padding: 30px 20px;
                    }
                    
                    .header h1 {
                        font-size: 24px;
                    }
                    
                    .detail-row {
                        flex-direction: column;
                        text-align: left;
                    }
                    
                    .detail-value {
                        text-align: left;
                        margin-top: 5px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <div class="header-icon">✅</div>
                    <h1>Booking Confirmed!</h1>
                    <p>Your reservation has been approved</p>
                </div>
                
                <div class="content">
                    <div class="greeting">
                        <p>Dear <strong>${userName}</strong>,</p>
                    </div>
                    
                    <p>Great news! Your booking for <strong>${apartmentTitle}</strong> has been confirmed by our admin team.</p>
                    
                    <div class="booking-card">
                        <h3>📅 Booking Details</h3>
                        <div class="detail-row">
                            <span class="detail-label">Booking ID: <span class="detail-value">${bookingId}</span></span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Apartment: <span class="detail-value">${apartmentTitle}</span></span>
                            
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Check-in: <span class="detail-value">${new Date(startDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></span>
                            
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Check-out: <span class="detail-value">${new Date(endDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></span>
                        </div>
                    </div>
                    
                    <div class="next-steps">
                        <h4>📋 Next Steps</h4>
                        <p>${nextSteps}</p>
                    </div>
                    
                    <p style="text-align: center; margin-top: 30px;">
                        We're excited to host you! 🎉
                    </p>
                </div>
                
                <div class="footer">
                    <p><strong>The Booking Team</strong></p>
                    <p class="contact-info">
                        Need help? Contact us at support@bookingteam.com<br>
                        or call +1 (555) 123-4567
                    </p>
                </div>
            </div>
        </body>
        </html>
      `,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Booking confirmation email sent:', info.response);
    } catch (err) {
      console.error('❌ Booking confirmation email failed:', err);
    }
  },

  async sendBookingCancellation({ to, userName, apartmentTitle, bookingId, adminNotes }) {
    const mailOptions = {
      from: process.env.MAIL_USER,
      to,
      subject: `❌ Booking Cancelled - ${apartmentTitle}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking Cancelled</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Inter', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                    min-height: 100vh;
                    padding: 20px;
                }
                
                .email-container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                }
                
                .header {
                    background: linear-gradient(135deg, #ff4444, #cc0000);
                    padding: 40px 30px;
                    text-align: center;
                    color: white;
                }
                
                .header h1 {
                    font-size: 28px;
                    font-weight: 700;
                    margin-bottom: 10px;
                }
                
                .header-icon {
                    font-size: 48px;
                    margin-bottom: 20px;
                }
                
                .content {
                    padding: 40px 30px;
                }
                
                .greeting {
                    font-size: 18px;
                    color: #666;
                    margin-bottom: 30px;
                }
                
                .booking-card {
                    background: linear-gradient(135deg, #fff5f5, #fed7d7);
                    border-radius: 12px;
                    padding: 25px;
                    margin: 25px 0;
                    border-left: 4px solid #e53e3e;
                }
                
                .booking-card h3 {
                    color: #2d3748;
                    margin-bottom: 20px;
                    font-size: 20px;
                }
                
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 12px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid #fed7d7;
                }
                
                .detail-row:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                }
                
                .detail-label {
                    color: #718096;
                    font-weight: 500;
                }
                
                .detail-value {
                    color: #2d3748;
                    font-weight: 600;
                    text-align: right;
                }
                
                .admin-notes {
                    background: #fffaf0;
                    border: 1px solid #feebc8;
                    border-radius: 12px;
                    padding: 20px;
                    margin: 25px 0;
                }
                
                .admin-notes h4 {
                    color: #dd6b20;
                    margin-bottom: 10px;
                    font-size: 16px;
                }
                
                .support-section {
                    text-align: center;
                    background: #ebf8ff;
                    border-radius: 12px;
                    padding: 25px;
                    margin: 25px 0;
                }
                
                .support-button {
                    display: inline-block;
                    background: #3182ce;
                    color: white;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 600;
                    margin-top: 15px;
                }
                
                .footer {
                    text-align: center;
                    padding: 30px;
                    background: #f7fafc;
                    color: #718096;
                    border-top: 1px solid #e2e8f0;
                }
                
                .contact-info {
                    margin-top: 15px;
                    font-size: 14px;
                }
                
                @media (max-width: 600px) {
                    .content {
                        padding: 25px 20px;
                    }
                    
                    .header {
                        padding: 30px 20px;
                    }
                    
                    .header h1 {
                        font-size: 24px;
                    }
                    
                    .detail-row {
                        flex-direction: column;
                        text-align: left;
                    }
                    
                    .detail-value {
                        text-align: left;
                        margin-top: 5px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <div class="header-icon">❌</div>
                    <h1>Booking Cancelled</h1>
                    <p>We're sorry to see you go</p>
                </div>
                
                <div class="content">
                    <div class="greeting">
                        <p>Dear <strong>${userName}</strong>,</p>
                    </div>
                    
                    <p>We regret to inform you that your booking for <strong>${apartmentTitle}</strong> has been cancelled.</p>
                    
                    <div class="booking-card">
                        <h3>📅 Booking Details</h3>
                        <div class="detail-row">
                            <span class="detail-label">Booking ID:</span>
                            <span class="detail-value">${bookingId}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Apartment:</span>
                            <span class="detail-value">${apartmentTitle}</span>
                        </div>
                    </div>
                    
                    ${adminNotes ? `
                    <div class="admin-notes">
                        <h4>📝 Admin Notes</h4>
                        <p>${adminNotes}</p>
                    </div>
                    ` : ''}
                    
                    <div class="support-section">
                        <h4>Need Assistance?</h4>
                        <p>We're here to help you with any questions or concerns about this cancellation.</p>
                        <a href="mailto:support@bookingteam.com" class="support-button">Contact Support</a>
                    </div>
                    
                    <p style="text-align: center; margin-top: 20px; color: #666;">
                        We hope to serve you better in the future.
                    </p>
                </div>
                
                <div class="footer">
                    <p><strong>The Booking Team</strong></p>
                    <p class="contact-info">
                        Email: support@bookingteam.com<br>
                        Phone: +1 (555) 123-4567<br>
                        Hours: Mon-Fri 9AM-6PM EST
                    </p>
                </div>
            </div>
        </body>
        </html>
      `,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Booking cancellation email sent:', info.response);
    } catch (err) {
      console.error('❌ Booking cancellation email failed:', err);
    }
  },
};
