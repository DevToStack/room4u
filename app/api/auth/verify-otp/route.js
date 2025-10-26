import { verifyOTP } from "@/utils/otp"; 

export async function POST(req) {
    const { email, purpose, otp } = await req.json();
    if (!email || !purpose || !otp) {
        return Response.json({ error: 'Missing fields' }, { status: 400 });
    }

    const valid = await verifyOTP(email, purpose, otp);
    if (!valid) {
        return Response.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    return Response.json({ success: true });
}
