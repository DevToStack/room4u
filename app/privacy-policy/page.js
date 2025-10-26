import PolicyLayout from '@/components/PolicyLayout'

export default function PrivacyPolicy() {
    return (
        <PolicyLayout
            title="Privacy Policy"
            lastUpdated="December 1, 2024"
        >
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-teal-400">1. Introduction</h2>
                <p className="mb-4 text-neutral-300">
                    Welcome to ApartmentBook (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy and handling your data with transparency and care. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our booking services.
                </p>
                <p className="text-neutral-300">
                    By using our platform, you consent to the data practices described in this policy.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-teal-400">2. Information We Collect</h2>
                <p className="mb-4 text-neutral-300">We collect information that you provide directly to us and data about your use of our platform.</p>
                <ul className="list-disc pl-6 mb-4 space-y-2 text-neutral-300">
                    <li><strong className="text-teal-300">Personal Identifiers:</strong> Your full name and email address.</li>
                    <li><strong className="text-teal-300">Booking Details:</strong> Your selected check-in and check-out dates, number of guests, and the specific apartment booked.</li>
                    <li><strong className="text-teal-300">Authentication Data:</strong> For login security, we store session tokens and may collect device information during the OTP verification process via your Gmail.</li>
                    <li><strong className="text-teal-300">Payment Information:</strong> All payments are processed securely by Razorpay. We do not store your raw card numbers, bank details, or other sensitive payment information.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-teal-400">3. How We Use Your Information</h2>
                <ul className="list-disc pl-6 space-y-2 text-neutral-300">
                    <li>To create and manage your user account</li>
                    <li>To process your apartment bookings and send booking confirmations</li>
                    <li>To authenticate your login via OTP sent to your Gmail</li>
                    <li>To facilitate secure online payments through Razorpay</li>
                    <li>To manage your bookings, including cancellations and refund processing</li>
                    <li>To allow you to add feedback and view your transaction history</li>
                    <li>To improve our website&apos;s performance, security, and user experience</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-teal-400">4. Data Security</h2>
                <p className="text-neutral-300">
                    We implement robust security measures, including encryption (SSL/TLS), to protect your data from unauthorized access, alteration, or destruction. While no online service is 100% secure, we strive to use commercially acceptable means to protect your personal information.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-teal-400">5. Your Data Protection Rights</h2>
                <p className="mb-4 text-neutral-300">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2 text-neutral-300">
                    <li><strong className="text-teal-300">Access:</strong> Request copies of your personal data</li>
                    <li><strong className="text-teal-300">Rectification:</strong> Correct any inaccurate or incomplete data</li>
                    <li><strong className="text-teal-300">Erasure (&quot;Right to be Forgotten&quot;):</strong> Request the deletion of your personal data</li>
                    <li><strong className="text-teal-300">Restrict Processing:</strong> Request we temporarily or permanently stop processing your data</li>
                    <li><strong className="text-teal-300">Data Portability:</strong> Request a transfer of your data to another service</li>
                </ul>
                <p className="mt-4 text-neutral-300">
                    To exercise these rights, please contact us at <strong className="text-teal-300">privacy@apartmentbook.com</strong>. We will respond within 30 days.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-teal-400">6. Contact Us</h2>
                <p className="text-neutral-300">
                    If you have any questions about this Privacy Policy, please contact us:<br />
                    <strong className="text-teal-300">Email:</strong> privacy@apartmentbook.com<br />
                    <strong className="text-teal-300">Address:</strong> [Your Business Physical Address, if applicable]
                </p>
            </section>
        </PolicyLayout>
    )
}