import { Head, Link } from '@inertiajs/react';

export default function Privacy() {
    return (
        <>
            <Head title="Privacy Policy - WorkWise" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap" rel="stylesheet" />
            
            <div className="relative min-h-screen bg-white">
                {/* Header */}
                <header className="border-b border-gray-200">
                    <div className="container mx-auto px-4 py-6">
                        <div className="flex justify-between items-center">
                            <Link href="/" className="text-3xl font-bold text-gray-900 hover:text-blue-600 transition-all duration-300">
                                WorkWise
                            </Link>
                            <nav className="flex items-center space-x-6">
                                <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">Home</Link>
                                <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">About</Link>
                                <Link href="/help" className="text-gray-700 hover:text-blue-600 transition-colors">Help</Link>
                                <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                    Sign In
                                </Link>
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="container mx-auto px-4 py-16 max-w-4xl">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
                        <p className="text-lg text-gray-600">
                            Last updated: December 2024
                        </p>
                    </div>

                    {/* Content */}
                    <div className="prose prose-lg max-w-none">
                        <div className="bg-green-50 border-l-4 border-green-400 p-6 mb-8">
                            <p className="text-green-800 font-medium">
                                Your privacy is important to us. This Privacy Policy explains how WorkWise collects, uses, and protects your personal information when you use our service.
                            </p>
                        </div>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
                            
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">1.1 Information You Provide</h3>
                            <p className="text-gray-700 mb-4">
                                We collect information you provide directly to us, including:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                                <li><strong>Account Information:</strong> Name, email address, phone number, profile photo</li>
                                <li><strong>Professional Information:</strong> Skills, experience, portfolio, work history</li>
                                <li><strong>Payment Information:</strong> Billing address, payment method details (processed securely by our payment partners)</li>
                                <li><strong>Communications:</strong> Messages, project discussions, support inquiries</li>
                                <li><strong>Content:</strong> Project files, work samples, reviews and ratings</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-900 mb-3">1.2 Information We Collect Automatically</h3>
                            <p className="text-gray-700 mb-4">
                                When you use our service, we automatically collect certain information:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                                <li><strong>Usage Data:</strong> Pages visited, features used, time spent on platform</li>
                                <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                                <li><strong>Location Data:</strong> General geographic location based on IP address</li>
                                <li><strong>Cookies and Tracking:</strong> See our Cookie Policy for details</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
                            <p className="text-gray-700 mb-4">
                                We use the information we collect to:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                                <li>Provide, maintain, and improve our services</li>
                                <li>Create and manage your account</li>
                                <li>Process payments and transactions</li>
                                <li>Match freelancers with relevant job opportunities using AI</li>
                                <li>Facilitate communication between users</li>
                                <li>Send important notifications and updates</li>
                                <li>Provide customer support</li>
                                <li>Prevent fraud and ensure platform security</li>
                                <li>Comply with legal obligations</li>
                                <li>Analyze usage patterns to improve our service</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. AI and Machine Learning</h2>
                            <p className="text-gray-700 mb-4">
                                WorkWise uses artificial intelligence and machine learning to enhance your experience:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                                <li><strong>Job Matching:</strong> Our AI analyzes your skills and preferences to recommend relevant opportunities</li>
                                <li><strong>Talent Recommendations:</strong> We help employers find suitable freelancers based on project requirements</li>
                                <li><strong>Fraud Detection:</strong> AI helps identify and prevent fraudulent activities</li>
                                <li><strong>Content Moderation:</strong> Automated systems help maintain platform quality and safety</li>
                            </ul>
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                                <p className="text-blue-800">
                                    <strong>Note:</strong> Our AI systems are designed to be fair and unbiased. We regularly audit our algorithms to ensure they don't discriminate based on protected characteristics.
                                </p>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
                            
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 With Other Users</h3>
                            <p className="text-gray-700 mb-4">
                                Your profile information, work samples, and reviews are visible to other users to facilitate connections and hiring decisions.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 With Service Providers</h3>
                            <p className="text-gray-700 mb-4">
                                We share information with trusted third-party service providers who help us operate our platform:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                                <li>Payment processors (Stripe, PayPal)</li>
                                <li>Cloud hosting providers (AWS, Google Cloud)</li>
                                <li>Email service providers</li>
                                <li>Analytics and monitoring services</li>
                                <li>Customer support tools</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 Legal Requirements</h3>
                            <p className="text-gray-700 mb-4">
                                We may disclose your information if required by law or in response to valid legal requests from authorities.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
                            <p className="text-gray-700 mb-4">
                                We implement robust security measures to protect your personal information:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                                <li><strong>Encryption:</strong> All data is encrypted in transit and at rest</li>
                                <li><strong>Access Controls:</strong> Strict access controls limit who can view your information</li>
                                <li><strong>Regular Audits:</strong> We conduct regular security audits and assessments</li>
                                <li><strong>Secure Infrastructure:</strong> Our systems are hosted on secure, monitored infrastructure</li>
                                <li><strong>Employee Training:</strong> Our team is trained on data protection best practices</li>
                            </ul>
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                                <p className="text-yellow-800">
                                    <strong>Important:</strong> While we implement strong security measures, no system is 100% secure. Please use strong passwords and keep your account information confidential.
                                </p>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights and Choices</h2>
                            <p className="text-gray-700 mb-4">
                                You have several rights regarding your personal information:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                                <li><strong>Access:</strong> Request a copy of your personal data</li>
                                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                                <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal requirements)</li>
                                <li><strong>Portability:</strong> Request your data in a portable format</li>
                                <li><strong>Objection:</strong> Object to certain processing activities</li>
                                <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
                            </ul>
                            <p className="text-gray-700 mb-4">
                                To exercise these rights, please contact us at privacy@workwise.com.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
                            <p className="text-gray-700 mb-4">
                                We retain your personal information for as long as necessary to provide our services and comply with legal obligations:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                                <li><strong>Account Data:</strong> Retained while your account is active</li>
                                <li><strong>Transaction Records:</strong> Retained for 7 years for tax and legal compliance</li>
                                <li><strong>Communications:</strong> Retained for 3 years for support and dispute resolution</li>
                                <li><strong>Usage Data:</strong> Aggregated and anonymized data may be retained indefinitely</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. International Data Transfers</h2>
                            <p className="text-gray-700 mb-4">
                                WorkWise operates globally, and your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for international transfers, including:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                                <li>Standard Contractual Clauses approved by the European Commission</li>
                                <li>Adequacy decisions for certain countries</li>
                                <li>Other appropriate safeguards as required by applicable law</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children's Privacy</h2>
                            <p className="text-gray-700 mb-4">
                                WorkWise is not intended for use by children under 18 years of age. We do not knowingly collect personal information from children under 18. If we become aware that we have collected personal information from a child under 18, we will take steps to delete such information.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Cookies and Tracking Technologies</h2>
                            <p className="text-gray-700 mb-4">
                                We use cookies and similar tracking technologies to enhance your experience:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                                <li><strong>Essential Cookies:</strong> Required for basic platform functionality</li>
                                <li><strong>Analytics Cookies:</strong> Help us understand how you use our service</li>
                                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                                <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements (with your consent)</li>
                            </ul>
                            <p className="text-gray-700">
                                You can control cookie settings through your browser preferences. For more details, see our Cookie Policy.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
                            <p className="text-gray-700 mb-4">
                                We may update this Privacy Policy from time to time. We will notify you of any material changes by:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                                <li>Posting the updated policy on our website</li>
                                <li>Sending you an email notification</li>
                                <li>Displaying a prominent notice on our platform</li>
                            </ul>
                            <p className="text-gray-700">
                                Your continued use of our service after any changes indicates your acceptance of the updated Privacy Policy.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
                            <p className="text-gray-700 mb-4">
                                If you have any questions about this Privacy Policy or our data practices, please contact us:
                            </p>
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <ul className="text-gray-700 space-y-2">
                                    <li><strong>Email:</strong> privacy@workwise.com</li>
                                    <li><strong>Data Protection Officer:</strong> dpo@workwise.com</li>
                                    <li><strong>Address:</strong> WorkWise Privacy Team</li>
                                    <li><strong>Phone:</strong> +1 (555) 123-4567</li>
                                </ul>
                            </div>
                        </section>

                        <div className="border-t border-gray-200 pt-8 mt-12">
                            <p className="text-sm text-gray-500 text-center">
                                This Privacy Policy is effective as of December 2024 and was last updated on December 15, 2024.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="border-t border-gray-200 bg-gray-50">
                    <div className="container mx-auto px-4 py-12">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">WorkWise</h3>
                                <p className="text-gray-600">
                                    AI-driven marketplace connecting talent with opportunity.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
                                <ul className="space-y-2 text-gray-600">
                                    <li><Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
                                    <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
                                    <li><Link href="/cookies" className="hover:text-blue-600 transition-colors">Cookie Policy</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
                                <ul className="space-y-2 text-gray-600">
                                    <li><Link href="/help" className="hover:text-blue-600 transition-colors">Help Center</Link></li>
                                    <li><Link href="/contact" className="hover:text-blue-600 transition-colors">Contact Us</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
                                <ul className="space-y-2 text-gray-600">
                                    <li><Link href="/about" className="hover:text-blue-600 transition-colors">About Us</Link></li>
                                    <li><Link href="/careers" className="hover:text-blue-600 transition-colors">Careers</Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
                            <p>&copy; 2024 WorkWise. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>

            <style>{`
                body {
                    background: white;
                    color: #333;
                    font-family: 'Inter', sans-serif;
                }
                .prose h2 {
                    margin-top: 2rem;
                    margin-bottom: 1rem;
                }
                .prose h3 {
                    margin-top: 1.5rem;
                    margin-bottom: 0.75rem;
                }
            `}</style>
        </>
    );
}