import { Head, Link } from '@inertiajs/react';

export default function Terms() {
    return (
        <>
            <Head title="Terms of Service - WorkWise" />
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
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
                        <p className="text-lg text-gray-600">
                            Last updated: December 2024
                        </p>
                    </div>

                    {/* Content */}
                    <div className="prose prose-lg max-w-none">
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8">
                            <p className="text-blue-800 font-medium">
                                Please read these Terms of Service carefully before using WorkWise. By accessing or using our service, you agree to be bound by these terms.
                            </p>
                        </div>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                            <p className="text-gray-700 mb-4">
                                By accessing and using WorkWise ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                            </p>
                            <p className="text-gray-700">
                                These Terms of Service apply to all users of the service, including without limitation users who are browsers, vendors, customers, merchants, and/or contributors of content.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
                            <p className="text-gray-700 mb-4">
                                WorkWise is an AI-driven marketplace platform that connects freelancers with employers seeking professional services. Our platform facilitates:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                                <li>Job posting and discovery</li>
                                <li>AI-powered matching between freelancers and projects</li>
                                <li>Secure payment processing through escrow services</li>
                                <li>Communication tools for project collaboration</li>
                                <li>Project management and milestone tracking</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts and Registration</h2>
                            <p className="text-gray-700 mb-4">
                                To access certain features of the Service, you must register for an account. When you register for an account, you may be required to provide certain information about yourself.
                            </p>
                            <p className="text-gray-700 mb-4">
                                You agree that the information you provide to us is accurate and that you will keep it accurate and up-to-date at all times. You are solely responsible for the activity that occurs on your account.
                            </p>
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                                <p className="text-yellow-800">
                                    <strong>Important:</strong> You must be at least 18 years old to use WorkWise and enter into contracts through our platform.
                                </p>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Conduct and Responsibilities</h2>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Prohibited Activities</h3>
                            <p className="text-gray-700 mb-4">You agree not to:</p>
                            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                                <li>Use the service for any unlawful purpose or to solicit others to perform unlawful acts</li>
                                <li>Violate any international, federal, provincial, or state regulations, rules, or laws</li>
                                <li>Infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                                <li>Harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                                <li>Submit false or misleading information</li>
                                <li>Upload or transmit viruses or any other type of malicious code</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Quality Standards</h3>
                            <p className="text-gray-700 mb-4">
                                All users are expected to maintain professional standards in their interactions and work quality. This includes:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                                <li>Providing accurate descriptions of skills and experience</li>
                                <li>Delivering work that meets agreed-upon specifications</li>
                                <li>Communicating professionally and respectfully</li>
                                <li>Meeting agreed-upon deadlines and milestones</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Payment Terms and Fees</h2>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 Service Fees</h3>
                            <p className="text-gray-700 mb-4">
                                WorkWise charges service fees for successful transactions:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                                <li>Freelancers: 10% service fee on earnings</li>
                                <li>Employers: 3% payment processing fee</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-900 mb-3">5.2 Escrow System</h3>
                            <p className="text-gray-700 mb-4">
                                All payments are processed through our secure escrow system. Funds are held securely until project milestones are completed and approved by the employer.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property Rights</h2>
                            <p className="text-gray-700 mb-4">
                                The Service and its original content, features, and functionality are and will remain the exclusive property of WorkWise and its licensors. The Service is protected by copyright, trademark, and other laws.
                            </p>
                            <p className="text-gray-700 mb-4">
                                Work created by freelancers for employers through our platform belongs to the employer upon full payment, unless otherwise agreed upon in writing between the parties.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Privacy and Data Protection</h2>
                            <p className="text-gray-700 mb-4">
                                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
                            </p>
                            <p className="text-gray-700">
                                We collect and use information in accordance with our Privacy Policy and applicable data protection laws, including GDPR where applicable.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Dispute Resolution</h2>
                            <p className="text-gray-700 mb-4">
                                In the event of disputes between users, WorkWise provides mediation services to help resolve conflicts. Our dispute resolution process includes:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                                <li>Initial communication facilitation</li>
                                <li>Review of project documentation and communications</li>
                                <li>Mediated resolution attempts</li>
                                <li>Final arbitration if necessary</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
                            <p className="text-gray-700 mb-4">
                                WorkWise acts as a platform connecting freelancers and employers. We are not responsible for the quality of work, payment disputes, or any damages arising from user interactions.
                            </p>
                            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                                <p className="text-red-800">
                                    <strong>Disclaimer:</strong> The service is provided "as is" without warranties of any kind, either express or implied.
                                </p>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Termination</h2>
                            <p className="text-gray-700 mb-4">
                                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.
                            </p>
                            <p className="text-gray-700">
                                You may also terminate your account at any time by contacting us. Upon termination, your right to use the Service will cease immediately.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to Terms</h2>
                            <p className="text-gray-700 mb-4">
                                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
                            </p>
                            <p className="text-gray-700">
                                What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Information</h2>
                            <p className="text-gray-700 mb-4">
                                If you have any questions about these Terms of Service, please contact us:
                            </p>
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <ul className="text-gray-700 space-y-2">
                                    <li><strong>Email:</strong> legal@workwise.com</li>
                                    <li><strong>Address:</strong> WorkWise Legal Department</li>
                                    <li><strong>Phone:</strong> +1 (555) 123-4567</li>
                                </ul>
                            </div>
                        </section>

                        <div className="border-t border-gray-200 pt-8 mt-12">
                            <p className="text-sm text-gray-500 text-center">
                                These Terms of Service are effective as of December 2024 and were last updated on December 15, 2024.
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