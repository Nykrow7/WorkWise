import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';

export default function Welcome({ auth }) {
    useEffect(() => {
        // Intersection Observer for animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('[data-observer-target]').forEach(el => {
            observer.observe(el);
        });

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <>
            <Head title="WorkWise - AI Marketplace" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap" rel="stylesheet" />
            <div className="relative min-h-screen bg-white">
                {/* Animated Background Shapes */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>

                {/* Main Content */}
                <div className="relative z-10 container mx-auto px-4 py-8">
                    {/* Header */}
                    <header className="flex justify-between items-center mb-16" data-observer-target>
                        <h1 className="text-4xl font-bold text-gray-900 hover:text-blue-600 transition-all duration-700 hover:drop-shadow-lg">WorkWise</h1>
                        <nav className="flex items-center space-x-6">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="text-gray-700 hover:text-blue-600 transition-all duration-700"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="text-gray-700 hover:text-blue-600 transition-all duration-700"
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        href={route('role.selection')}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-all duration-700 hover:shadow-xl hover:scale-105"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </nav>
                    </header>

                    {/* Hero Section */}
                    <section className="text-center mb-24" data-observer-target>
                        <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                            Connect. Create. <span className="text-blue-600 animate-pulse">Collaborate.</span>
                        </h2>
                        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                            WorkWise is an AI-driven marketplace connecting gig workers with companies.
                        </p>
                        <Link
                            href={route('jobs.index')}
                            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-700 hover:shadow-xl hover:scale-105"
                        >
                            Browse Jobs
                        </Link>
                    </section>

                    {/* Features Section */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-8" data-observer-target>
                        <div className="bg-white/70 backdrop-blur-sm p-8 rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-700 text-center">
                            <div className="text-6xl mb-4">✨</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Matching</h3>
                            <p className="text-gray-600">
                                Our AI-powered system matches gig workers with projects based on skills, experience, and preferences for perfect collaborations.
                            </p>
                        </div>

                        <div className="bg-white/70 backdrop-blur-sm p-8 rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-700 text-center">
                            <div className="text-6xl mb-4">🔒</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Secure Payments</h3>
                            <p className="text-gray-600">
                                Built-in escrow system ensures secure transactions and timely payments for both gig workers and employers.
                            </p>
                        </div>

                        <div className="bg-white/70 backdrop-blur-sm p-8 rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-700 text-center">
                            <div className="text-6xl mb-4">💡</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Quality Talent</h3>
                            <p className="text-gray-600">
                                Access to a curated network of skilled professionals across various industries and expertise levels.
                            </p>
                        </div>
                    </section>
                </div>
            </div>

            <style>{`
                body {
                    background: white;
                    color: #333;
                    font-family: 'Inter', sans-serif;
                }

                [data-observer-target] {
                    opacity: 0;
                    transform: translateY(20px);
                    transition: opacity 0.8s ease-out, transform 0.8s ease-out;
                }
                [data-observer-target].is-visible {
                    opacity: 1;
                    transform: translateY(0);
                }
            `}</style>
        </>
    );
}
