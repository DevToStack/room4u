import PolicyLayout from '@/components/PolicyLayout'

export default function TermsConditions() {
    return (
        <PolicyLayout
            title="Terms & Conditions"
            lastUpdated="December 1, 2024"
        >
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-teal-400">1. Acceptance of Terms</h2>
                <p className="text-neutral-300">
                    By accessing and using ApartmentBook (the &quot;Platform&quot;), you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-teal-400">2. User Accounts and Registration</h2>
                <ul className="list-disc pl-6 space-y-2 text-neutral-300">
                    <li>You must be at least 18 years old to create an account and make a booking</li>
                    <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                    <li>You agree to provide accurate, current, and complete information during registration and booking</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-teal-400">3. Booking and Payment</h2>
                <ul className="list-disc pl-6 space-y-2 text-neutral-300">
                    <li>All bookings are subject to apartment availability</li>
                    <li>You agree to pay the total amount due, including all applicable taxes and fees</li>
                    <li>Payments are processed securely via Razorpay</li>
                    <li>By providing payment information, you represent you are authorized to use the payment method</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-teal-400">4. User Responsibilities</h2>
                <ul className="list-disc pl-6 space-y-2 text-neutral-300">
                    <li>You agree to use the apartment for residential short-stay purposes only</li>
                    <li>You are responsible for the conduct of all guests in your booking</li>
                    <li>You will comply with the specific rules of the apartment building</li>
                    <li>Any damage to the property may result in additional charges</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-teal-400">5. Limitation of Liability</h2>
                <p className="text-neutral-300">
                    ApartmentBook acts as a booking intermediary. We are not liable for any direct, indirect, or consequential damages arising from your stay at an apartment. Our total liability to you shall not exceed the total booking value.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-teal-400">6. Governing Law and Dispute Resolution</h2>
                <p className="text-neutral-300">
                    These Terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in [Your City, India].
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4 text-teal-400">7. Contact Us</h2>
                <p className="text-neutral-300">
                    For any questions regarding these Terms and Conditions, please contact us at:<br />
                    <strong className="text-teal-300">Email:</strong> legal@apartmentbook.com
                </p>
            </section>
        </PolicyLayout>
    )
}