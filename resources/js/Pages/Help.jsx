import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Help() {
    const [activeCategory, setActiveCategory] = useState('getting-started');
    const [openFaq, setOpenFaq] = useState(null);

    const categories = [
        { id: 'getting-started', name: 'Getting Started', icon: '🚀' },
        { id: 'freelancers', name: 'For Freelancers', icon: '👨‍💻' },
        { id: 'employers', name: 'For Employers', icon: '🏢' },
        { id: 'payments', name: 'Payments & Billing', icon: '💳' },
        { id: 'account', name: 'Account & Security', icon: '🔒' },
        { id: 'technical', name: 'Technical Support', icon: '⚙️' }
    ];

    const faqs = {
        'getting-started': [
            {
                question: 'How do I get started on WorkWise?',
                answer: 'Getting started is easy! First, choose whether you want to join as a freelancer or employer during registration. Complete your profile with relevant information, and you\'ll be ready to start browsing jobs or posting projects.'
            },
            {
                question: 'Is WorkWise free to use?',
                answer: 'Yes, creating an account and browsing is completely free. We only charge a small service fee when you successfully complete a project through our platform.'
            },
            {
                question: 'How does the AI matching work?',
                answer: 'Our AI analyzes your skills, experience, work history, and preferences to match you with the most suitable opportunities. The more you use WorkWise, the better our recommendations become.'
            }
        ],
        'freelancers': [
            {
                question: 'How do I create an attractive freelancer profile?',
                answer: 'Include a professional photo, detailed description of your skills, portfolio samples, and clear pricing. Highlight your unique strengths and past successes to stand out to potential clients.'
            },
            {
                question: 'How do I submit a winning proposal?',
                answer: 'Read the job description carefully, address the client\'s specific needs, showcase relevant experience, and provide a clear timeline and budget. Personalize each proposal rather than using templates.'
            },
            {
                question: 'When and how do I get paid?',
                answer: 'Payments are processed through our secure escrow system. You\'ll receive payment after completing milestones or project deliverables as agreed with your client.'
            }
        ],
        'employers': [
            {
                question: 'How do I post an effective job?',
                answer: 'Be specific about your requirements, provide clear project scope, set realistic budgets and timelines, and include any necessary files or references. The more detailed your job post, the better quality proposals you\'ll receive.'
            },
            {
                question: 'How do I choose the right freelancer?',
                answer: 'Review portfolios, check ratings and reviews, conduct interviews if needed, and consider both skills and communication style. Our AI recommendations can help narrow down the best matches.'
            },
            {
                question: 'How does the payment protection work?',
                answer: 'Our escrow system holds your payment securely until you\'re satisfied with the work. This protects both you and the freelancer, ensuring fair transactions for everyone.'
            }
        ],
        'payments': [
            {
                question: 'What payment methods do you accept?',
                answer: 'We accept major credit cards, PayPal, and bank transfers. All payments are processed securely through our encrypted payment system.'
            },
            {
                question: 'What are your service fees?',
                answer: 'We charge a small percentage fee on completed transactions. Freelancers pay 10% on earnings, while employers pay a 3% processing fee. No hidden charges or monthly subscriptions.'
            },
            {
                question: 'How long do payments take to process?',
                answer: 'Payments typically process within 1-3 business days. International transfers may take up to 5 business days depending on your bank and location.'
            }
        ],
        'account': [
            {
                question: 'How do I change my account type?',
                answer: 'You can switch between freelancer and employer modes in your account settings. This allows you to both offer services and hire talent using the same account.'
            },
            {
                question: 'How do I update my profile information?',
                answer: 'Go to your Profile Settings to update your information, skills, portfolio, and preferences. Keep your profile current to get the best job matches.'
            },
            {
                question: 'Is my personal information secure?',
                answer: 'Yes, we use industry-standard encryption and security measures to protect your data. We never share your personal information with third parties without your consent.'
            }
        ],
        'technical': [
            {
                question: 'I\'m having trouble uploading files. What should I do?',
                answer: 'Ensure your files are under 10MB and in supported formats (PDF, DOC, JPG, PNG). Clear your browser cache and try again. If issues persist, contact our support team.'
            },
            {
                question: 'The website is loading slowly. How can I fix this?',
                answer: 'Try refreshing the page, clearing your browser cache, or switching to a different browser. Check your internet connection and disable browser extensions that might interfere.'
            },
            {
                question: 'I\'m not receiving email notifications. What\'s wrong?',
                answer: 'Check your spam folder and ensure notifications are enabled in your account settings. Add our email domain to your safe sender list to prevent future issues.'
            }
        ]
    };

    return (
        <>
            <Head title="Help & FAQ - WorkWise" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap" rel="stylesheet" />
            
            <div className="relative min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white border-b border-gray-200">
                    <div className="container mx-auto px-4 py-6">
                        <div className="flex justify-between items-center">
                            <Link href="/" className="text-3xl font-bold text-gray-900 hover:text-blue-600 transition-all duration-300">
                                WorkWise
                            </Link>
                            <nav className="flex items-center space-x-6">
                                <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">Home</Link>
                                <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">About</Link>
                                <Link href="/jobs" className="text-gray-700 hover:text-blue-600 transition-colors">Browse Jobs</Link>
                                <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                    Sign In
                                </Link>
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-5xl font-bold mb-6">How can we help you?</h1>
                        <p className="text-xl mb-8 opacity-90">
                            Find answers to common questions or get in touch with our support team
                        </p>
                        
                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search for help articles..."
                                    className="w-full px-6 py-4 text-gray-900 rounded-xl text-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
                                />
                                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                    Search
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <div className="container mx-auto px-4 py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar Categories */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Help Categories</h3>
                                <nav className="space-y-2">
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => setActiveCategory(category.id)}
                                            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                                                activeCategory === category.id
                                                    ? 'bg-blue-100 text-blue-700 font-semibold'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            <span className="text-xl">{category.icon}</span>
                                            <span>{category.name}</span>
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>

                        {/* FAQ Content */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-xl shadow-lg p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                    {categories.find(cat => cat.id === activeCategory)?.name} FAQ
                                </h2>
                                
                                <div className="space-y-4">
                                    {faqs[activeCategory]?.map((faq, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg">
                                            <button
                                                onClick={() => setOpenFaq(openFaq === `${activeCategory}-${index}` ? null : `${activeCategory}-${index}`)}
                                                className="w-full text-left px-6 py-4 font-semibold text-gray-900 hover:bg-gray-50 transition-colors flex justify-between items-center"
                                            >
                                                <span>{faq.question}</span>
                                                <span className={`transform transition-transform ${
                                                    openFaq === `${activeCategory}-${index}` ? 'rotate-180' : ''
                                                }`}>
                                                    ▼
                                                </span>
                                            </button>
                                            {openFaq === `${activeCategory}-${index}` && (
                                                <div className="px-6 pb-4 text-gray-600 border-t border-gray-100">
                                                    <p className="pt-4">{faq.answer}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Contact Support */}
                            <div className="mt-8 bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-8 text-center">
                                <h3 className="text-2xl font-bold text-green-900 mb-4">Still need help?</h3>
                                <p className="text-green-800 mb-6">
                                    Can't find what you're looking for? Our support team is here to help you succeed.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link 
                                        href="/contact" 
                                        className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                                    >
                                        Contact Support
                                    </Link>
                                    <a 
                                        href="mailto:support@workwise.com" 
                                        className="border-2 border-green-600 text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-600 hover:text-white transition-colors"
                                    >
                                        Email Us
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <section className="bg-white border-t border-gray-200 py-16">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Help Topics</h2>
                            <p className="text-lg text-gray-600">Quick access to the most requested information</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow">
                                <div className="text-4xl mb-4">📝</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Getting Started Guide</h3>
                                <p className="text-gray-600 mb-4">
                                    Complete walkthrough for new users to set up their accounts and start working.
                                </p>
                                <Link href="/guide" className="text-blue-600 font-semibold hover:text-blue-700">
                                    Read Guide →
                                </Link>
                            </div>
                            
                            <div className="text-center p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow">
                                <div className="text-4xl mb-4">💰</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Payment Information</h3>
                                <p className="text-gray-600 mb-4">
                                    Learn about our secure payment system, fees, and how to get paid quickly.
                                </p>
                                <Link href="/payments-info" className="text-blue-600 font-semibold hover:text-blue-700">
                                    Learn More →
                                </Link>
                            </div>
                            
                            <div className="text-center p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow">
                                <div className="text-4xl mb-4">🛡️</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Safety & Security</h3>
                                <p className="text-gray-600 mb-4">
                                    Tips for staying safe online and protecting your account and personal information.
                                </p>
                                <Link href="/safety" className="text-blue-600 font-semibold hover:text-blue-700">
                                    Stay Safe →
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-12">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div>
                                <h3 className="text-lg font-bold mb-4">WorkWise</h3>
                                <p className="text-gray-400">
                                    AI-driven marketplace connecting talent with opportunity.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Support</h4>
                                <ul className="space-y-2 text-gray-400">
                                    <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                                    <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                                    <li><Link href="/community" className="hover:text-white transition-colors">Community</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Company</h4>
                                <ul className="space-y-2 text-gray-400">
                                    <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                                    <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                                    <li><Link href="/press" className="hover:text-white transition-colors">Press</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Legal</h4>
                                <ul className="space-y-2 text-gray-400">
                                    <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                                    <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                            <p>&copy; 2024 WorkWise. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>

            <style>{`
                body {
                    background: #f9fafb;
                    color: #333;
                    font-family: 'Inter', sans-serif;
                }
            `}</style>
        </>
    );
}