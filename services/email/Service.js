// lib/email-service.js
import nodemailer from "nodemailer";
import { emailTemplates } from "./templet";

export class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
    this.init();
  }

  init() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        rateLimit: 5, // optional: limit concurrent messages
      });

      // Verify connection configuration (async-safe)
      this.transporter.verify()
        .then(() => {
          console.log("✅ Email transporter ready");
          this.initialized = true;
        })
        .catch((error) => {
          console.error("❌ Email transporter verification failed:", error);
          this.initialized = false;
        });
    } catch (error) {
      console.error("❌ Email service initialization failed:", error);
      this.initialized = false;
    }
  }

  async sendEmail({
    to,
    subject,
    html,
    from = `"Apartment Booking" <${process.env.MAIL_USER}>`,
  }) {
    if (!this.initialized) {
      console.warn("⚠️ Email service not yet initialized — attempting fallback send...");
    }

    if (!to) {
      throw new Error("❌ Missing 'to' field in sendEmail()");
    }

    try {
      const result = await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });

      console.log(`✅ Email sent to: ${to}`);
      return result;
    } catch (error) {
      console.error("❌ Error sending email:", error);
      throw error;
    }
  }

  // 📦 Template-specific method: send booking email to admins
  async sendAdminBookingEmail(bookingData) {
    // bookingData: { customerName, customerEmail, apartmentName, checkIn, checkOut, totalPrice }

    const adminEmails = (bookingData.adminEmails && bookingData.adminEmails.length > 0)
      ? bookingData.adminEmails.join(",")
      : process.env.MAIL_USER; // fallback if no admin found

    const html = emailTemplates.adminBooking({
      ...bookingData,
      adminDashboardUrl: process.env.ADMIN_DASHBOARD_URL || '#',
    });

    return this.sendEmail({
      to: adminEmails,
      subject: `New Booking Request - ${bookingData.apartmentName}`,
      html,
    });
  }

  // 💳 NEW: Send payment confirmation email to admins
  async sendAdminPaymentEmail(paymentData) {
    // paymentData: { 
    //   customerName, 
    //   customerEmail, 
    //   apartmentName, 
    //   checkIn, 
    //   checkOut, 
    //   totalPrice, 
    //   paymentId, 
    //   paymentDate, 
    //   adminEmails (optional)
    // }

    const adminEmails = (paymentData.adminEmails && paymentData.adminEmails.length > 0)
      ? paymentData.adminEmails.join(",")
      : process.env.MAIL_USER; // fallback if no admin found

    const html = emailTemplates.adminPayment({
      ...paymentData,
      adminDashboardUrl: process.env.ADMIN_DASHBOARD_URL || '#',
    });

    return this.sendEmail({
      to: adminEmails,
      subject: `Payment Received - ${paymentData.apartmentName} - ${paymentData.customerName}`,
      html,
    });
  }
}

// ✅ Singleton instance
export const emailService = new EmailService();