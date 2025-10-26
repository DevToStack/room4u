import PolicyLayout from '@/components/PolicyLayout'

export default function CancellationRefund() {
    return (
        <PolicyLayout
            title="Cancellation & Refund Policy"
            lastUpdated="December 1, 2024"
        >
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-teal-400">1. General Cancellation Policy</h2>
                <p className="text-neutral-300">
                    All cancellation requests must be made by the user logged into their dashboard on ApartmentBook or by contacting our support team directly.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-teal-400">2. Refund Rules</h2>
                <p className="mb-4 text-neutral-300">Refund eligibility is determined by the timing of the cancellation relative to the check-in date:</p>

                <div className="bg-neutral-800 rounded-lg p-6 mb-4 border border-neutral-700">
                    <div className="grid gap-4">
                        <div className="border-b border-neutral-700 pb-4">
                            <h3 className="font-semibold text-teal-300 mb-2">Cancellation 7+ days before check-in</h3>
                            <p className="text-neutral-300"><strong>Full refund</strong> of booking amount (minus payment processing fees)</p>
                        </div>

                        <div className="border-b border-neutral-700 pb-4">
                            <h3 className="font-semibold text-amber-400 mb-2">Cancellation 3-6 days before check-in</h3>
                            <p className="text-neutral-300"><strong>50% refund</strong> of booking amount</p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-rose-400 mb-2">Cancellation less than 72 hours before check-in</h3>
                            <p className="text-neutral-300"><strong>No refund</strong> provided</p>
                        </div>
                    </div>
                </div>

                <p className="text-sm text-neutral-400">
                    *Note: All time calculations are based on the local time of the apartment.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-teal-400">3. Refund Processing</h2>
                <ul className="list-disc pl-6 space-y-2 text-neutral-300">
                    <li>Approved refunds will be processed to the original payment method</li>
                    <li>Refunds may take 7-10 business days to reflect in your account</li>
                    <li>The transaction ID for the refund will be visible in your booking dashboard</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-teal-400">4. Extenuating Circumstances</h2>
                <p className="text-neutral-300">
                    In rare cases of verified extenuating circumstances (e.g., serious illness, government travel restrictions), we may review cancellations on a case-by-case basis. Supporting documentation will be required.
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4 text-teal-400">5. Contact Us</h2>
                <p className="text-neutral-300">
                    For cancellation requests or questions about refunds, please contact us:<br />
                    <strong className="text-teal-300">Email:</strong> support@apartmentbook.com
                </p>
            </section>
        </PolicyLayout>
    )
}