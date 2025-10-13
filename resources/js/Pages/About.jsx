import { Head, Link } from '@inertiajs/react';

export default function About() {
    return (
        <>
            <Head title="About Us - WorkWise" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap" rel="stylesheet" />
            
            <div className="relative min-h-screen bg-white">
                {/* Animated Background Shapes */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-700/10 rounded-full blur-3xl"></div>

                {/* Header */}
                <header className="relative z-10 border-b border-gray-200">
                    <div className="container mx-auto px-4 py-6">
                        <div className="flex justify-between items-center">
                            <Link href="/" className="text-3xl font-bold text-gray-900 hover:text-blue-600 transition-all duration-300">
                                WorkWise
                            </Link>
                            <nav className="flex items-center space-x-6">
                                <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">Home</Link>
                                <Link href="/jobs" className="text-gray-700 hover:text-blue-600 transition-colors">Browse Jobs</Link>
                                <Link href="/help" className="text-gray-700 hover:text-blue-600 transition-colors">Help</Link>
                                <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                    Sign In
                                </Link>
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="relative z-10 container mx-auto px-4 py-16">
                    {/* Hero Section */}
                    <section className="text-center mb-16">
                        <h1 className="text-5xl font-bold text-gray-900 mb-6">
                            About <span className="text-blue-600">WorkWise</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            We're revolutionizing the way talented professionals connect with innovative companies through AI-powered matching and seamless collaboration tools.
                        </p>
                    </section>

                    {/* Mission Section */}
                    <section className="mb-16">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                                <p className="text-lg text-gray-600 mb-4">
                                    WorkWise exists to bridge the gap between exceptional talent and meaningful opportunities. We believe that when the right people connect with the right projects, extraordinary things happen.
                                </p>
                                <p className="text-lg text-gray-600">
                                    Our AI-driven platform doesn't just match skills to requirements—it understands the nuances of collaboration, culture fit, and career aspirations to create partnerships that drive success for everyone involved.
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-xl">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">🎯</div>
                                    <h3 className="text-2xl font-bold text-blue-900 mb-4">Perfect Matches</h3>
                                    <p className="text-blue-800">
                                        Our advanced AI analyzes skills, experience, work style, and project requirements to create matches that lead to successful collaborations.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Values Section */}
                    <section className="mb-16">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                These principles guide everything we do at WorkWise
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                                <div className="text-5xl mb-4">🤝</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Trust & Transparency</h3>
                                <p className="text-gray-600">
                                    We build trust through transparent processes, secure payments, and honest communication between all parties.
                                </p>
                            </div>
                            
                            <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                                <div className="text-5xl mb-4">⚡</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Innovation</h3>
                                <p className="text-gray-600">
                                    We continuously innovate with AI and technology to make freelancing and hiring more efficient and effective.
                                </p>
                            </div>
                            
                            <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                                <div className="text-5xl mb-4">🌟</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Excellence</h3>
                                <p className="text-gray-600">
                                    We're committed to helping both freelancers and companies achieve excellence in their work and collaborations.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Team Section */}
                    <section className="mb-16">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for the Future of Work</h2>
                            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                                WorkWise was founded by a team of technologists, entrepreneurs, and freelancing veterans who understand the challenges of remote collaboration and the power of AI to solve them.
                            </p>
                        </div>
                        
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-12 rounded-xl text-center">
                            <h3 className="text-2xl font-bold mb-4">Join the WorkWise Community</h3>
                            <p className="text-xl mb-8 opacity-90">
                                Whether you're a freelancer looking for your next opportunity or a company seeking exceptional talent, WorkWise is here to help you succeed.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link 
                                    href="/register" 
                                    className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                                >
                                    Get Started Today
                                </Link>
                                <Link 
                                    href="/contact" 
                                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                                >
                                    Contact Us
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Stats Section */}
                    <section className="mb-16">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                            <div className="p-6">
                                <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
                                <div className="text-gray-600">Active Freelancers</div>
                            </div>
                            <div className="p-6">
                                <div className="text-4xl font-bold text-blue-600 mb-2">5,000+</div>
                                <div className="text-gray-600">Companies</div>
                            </div>
                            <div className="p-6">
                                <div className="text-4xl font-bold text-blue-600 mb-2">50,000+</div>
                                <div className="text-gray-600">Projects Completed</div>
                            </div>
                            <div className="p-6">
                                <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
                                <div className="text-gray-600">Satisfaction Rate</div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <footer className="relative z-10 border-t border-gray-200 bg-gray-50">
                    <div className="container mx-auto px-4 py-12">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">WorkWise</h3>
                                <p className="text-gray-600">
                                    AI-driven marketplace connecting talent with opportunity.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
                                <ul className="space-y-2 text-gray-600">
                                    <li><Link href="/about" className="hover:text-blue-600 transition-colors">About Us</Link></li>
                                    <li><Link href="/careers" className="hover:text-blue-600 transition-colors">Careers</Link></li>
                                    <li><Link href="/press" className="hover:text-blue-600 transition-colors">Press</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
                                <ul className="space-y-2 text-gray-600">
                                    <li><Link href="/help" className="hover:text-blue-600 transition-colors">Help Center</Link></li>
                                    <li><Link href="/contact" className="hover:text-blue-600 transition-colors">Contact Us</Link></li>
                                    <li><Link href="/community" className="hover:text-blue-600 transition-colors">Community</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
                                <ul className="space-y-2 text-gray-600">
                                    <li><Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
                                    <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
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
            `}</style>
        </>
    );
}