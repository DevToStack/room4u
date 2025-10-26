import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export async function sendOtp(email, otp) {
  await transporter.sendMail({
    from: `"LuxStay" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "🔑 Your Registration OTP Code",
    html: `
    <div style="font-family: 'Inter', sans-serif; background-color: #f9fafb; padding: 5px; text-align: center; color: #111827;">
      <div style="max-width: 480px; margin: auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
        
        <h2 style="font-size: 20px; font-weight: 600; color: #166534; margin: 5px 0;">
          Welcome to Apartment Booking 🎉
        </h2>
        
        <p style="font-size: 14px; color: #4b5563; margin: 5px 0; line-height: 1.6;">
          Thank you for registering! Use the OTP below to verify your account:
        </p>

        <div style="margin: 15px 0;">
          <span style="display: inline-block; background-color: #ecfdf5; color: #065f46; font-size: 26px; font-weight: 700; letter-spacing: 6px; padding: 12px 24px; border-radius: 10px; border: 1px solid #a7f3d0;">
            ${otp}
          </span>
        </div>

        <p style="font-size: 13px; color: #6b7280; margin: 5px 0;">
          This OTP will expire in <b>10 minutes</b>.<br/>
          If you didn’t sign up, please ignore this email.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 10px 0;" />

        <p style="font-size: 11px; color: #9ca3af; margin: 5px 0;">
          &copy; ${new Date().getFullYear()} Apartment Booking. All rights reserved.<br/>
          This is an automated email, please do not reply.
        </p>
      </div>
    </div>
    `,
  });
}

