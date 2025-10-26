import { sendOtp } from "@/lib/mailer";
import { generateOTP } from "@/utils/otp";

export async function POST(req) {
    try {
        const { email, purpose } = await req.json();

        if (!email || !purpose) {
            return Response.json({ error: 'Unusual input detected' }, { status: 400 });
        }

        // Generate and store new OTP
        const otp = await generateOTP(email, purpose);

        // ✅ Await the email sending
        await sendOtp(email, otp);

        return Response.json({ success: true, message: 'OTP sent successfully.' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        return Response.json({ error: 'Failed to send OTP.' }, { status: 500 });
    }
}
