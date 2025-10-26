import PolicyLayout from '@/components/PolicyLayout'

export default function CookiesPolicy() {
    return (
        <PolicyLayout
            title="Cookies Policy"
            lastUpdated="December 1, 2024"
        >
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-teal-400">1. What Are Cookies?</h2>
                <p className="text-neutral-300">
                    Cookies are small text files that are placed on your device (computer, tablet, or mobile) when you visit our website. They help the website remember your actions and preferences over a period of time.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-teal-400">2. How We Use Cookies</h2>
                <p className="mb-4 text-neutral-300">We use cookies for the following essential purposes:</p>

                <div className="space-y-4">
                    <div className="border-l-4 border-teal-500 pl-4">
                        <h3 className="font-semibold text-teal-300">Strictly Necessary Cookies</h3>
                        <p className="text-neutral-400">
                            These are required for the website to function. They enable core functionality like user login, session management, and payment processing. You cannot disable these.
                        </p>
                    </div>

                    <div className="border-l-4 border-emerald-500 pl-4">
                        <h3 className="font-semibold text-teal-300">Security Cookies</h3>
                        <p className="text-neutral-400">
                            We use these to identify and prevent security risks. They help us authenticate users and protect user data from unauthorized access.
                        </p>
                    </div>

                    <div className="border-l-4 border-violet-500 pl-4">
                        <h3 className="font-semibold text-teal-300">Performance and Analytics Cookies</h3>
                        <p className="text-neutral-400">
                            These cookies help us understand how visitors interact with our website by collecting anonymous data. This helps us improve how our website works.
                        </p>
                    </div>

                    <div className="border-l-4 border-amber-500 pl-4">
                        <h3 className="font-semibold text-teal-300">Functionality Cookies</h3>
                        <p className="text-neutral-400">
                            These remember your preferences (like your language or region) to provide a more personalized experience.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-teal-400">3. Your Cookie Choices</h2>
                <p className="text-neutral-300">
                    Most web browsers allow you to control cookies through their settings preferences. You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. Please note that if you disable or refuse cookies, some parts of our website may become inaccessible or not function properly.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-teal-400">4. Third-Party Cookies</h2>
                <p className="text-neutral-300">
                    We use Razorpay for payments, which may place its own cookies to ensure secure transaction processing. We do not control the use of these third-party cookies and we recommend you review Razorpay&apos;s Privacy Policy for more information.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4 text-teal-400">5. Contact Us</h2>
                <p className="text-neutral-300">
                    If you have any questions about our use of cookies, please contact us at:<br />
                    <strong className="text-teal-300">Email:</strong> privacy@apartmentbook.com
                </p>
            </section>
        </PolicyLayout>
    )
}