import React, { useState, useEffect, useCallback } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import StartConversationModal from '@/Components/StartConversationModal';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';

// Enhanced Loading Components
const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-8">
        <div className="relative">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-8 h-8 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <span className="ml-3 text-sm text-gray-600 font-medium">Loading conversations...</span>
    </div>
);

const ConversationSkeleton = () => (
    <div className="p-6 animate-pulse">
        <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
        </div>
    </div>
);

// Enhanced Avatar Component
const UserAvatar = ({ user, size = 'w-12 h-12', showOnline = false }) => {
    const sizeClasses = {
        'w-8 h-8': 'w-8 h-8 text-xs',
        'w-10 h-10': 'w-10 h-10 text-sm',
        'w-12 h-12': 'w-12 h-12 text-base',
        'w-16 h-16': 'w-16 h-16 text-lg'
    };

    if (user.profile_photo) {
        return (
            <div className="relative">
                <img
                    src={`/storage/${user.profile_photo}`}
                    alt={`${user.first_name} ${user.last_name}`}
                    className={`${size} rounded-full object-cover ring-2 ring-white shadow-sm`}
                />
                {showOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                )}
            </div>
        );
    }

    const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
    const colors = [
        'bg-gradient-to-br from-red-400 to-red-600',
        'bg-gradient-to-br from-blue-400 to-blue-600',
        'bg-gradient-to-br from-green-400 to-green-600',
        'bg-gradient-to-br from-yellow-400 to-yellow-600',
        'bg-gradient-to-br from-purple-400 to-purple-600',
        'bg-gradient-to-br from-pink-400 to-pink-600',
        'bg-gradient-to-br from-indigo-400 to-indigo-600'
    ];
    const colorIndex = user.id % colors.length;

    return (
        <div className="relative">
            <div className={`${size} rounded-full ${colors[colorIndex]} flex items-center justify-center text-white font-semibold shadow-sm ring-2 ring-white ${sizeClasses[size]}`}>
                {initials}
            </div>
            {showOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
            )}
        </div>
    );
};

export default function MessagesIndex({ conversations: initialConversations = [] }) {
    const { auth } = usePage().props;
    const [conversations, setConversations] = useState(initialConversations);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showStartConversation, setShowStartConversation] = useState(false);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(Date.now());

    // Real-time polling for conversations and unread count
    const fetchConversations = useCallback(async () => {
        try {
            setLoading(true);
            const [conversationsResponse, unreadResponse] = await Promise.all([
                axios.get('/messages/recent/conversations'),
                axios.get('/messages/unread/count')
            ]);

            setConversations(conversationsResponse.data.conversations || []);
            setUnreadCount(unreadResponse.data.count || 0);
            setLastUpdate(Date.now());
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load and real-time polling
    useEffect(() => {
        fetchConversations();

        // Poll for updates every 30 seconds
        const interval = setInterval(fetchConversations, 30000);

        return () => clearInterval(interval);
    }, [fetchConversations]);

    // Check for new messages more frequently
    useEffect(() => {
        const checkForNewMessages = async () => {
            try {
                const response = await axios.get('/messages/unread/count');
                const newUnreadCount = response.data.count || 0;

                if (newUnreadCount !== unreadCount) {
                    setUnreadCount(newUnreadCount);
                    // If there are new messages, refresh conversations
                    if (newUnreadCount > unreadCount) {
                        fetchConversations();
                    }
                }
            } catch (error) {
                console.error('Error checking for new messages:', error);
            }
        };

        // Check every 10 seconds for new messages
        const interval = setInterval(checkForNewMessages, 10000);

        return () => clearInterval(interval);
    }, [unreadCount, fetchConversations]);

    const handleStartConversation = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/messages/users');
            setAvailableUsers(response.data.users || []);
            setShowStartConversation(true);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const getLastMessagePreview = (message) => {
        if (!message) return 'No messages yet';

        if (message.type === 'file') {
            return (
                <span className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                    </svg>
                    {message.attachment_name || 'File attachment'}
                </span>
            );
        }
        return message.message.length > 60
            ? message.message.substring(0, 60) + '...'
            : message.message;
    };

    const formatLastActivity = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInDays < 7) return `${diffInDays}d ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="font-bold text-xl text-gray-900 leading-tight">
                                    Messages
                                </h2>
                                <div className="flex items-center space-x-3 mt-1">
                                    {unreadCount > 0 && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
                                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-1.5"></div>
                                            {unreadCount} unread
                                        </span>
                                    )}
                                    <span className="text-sm text-gray-500">
                                        {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                                    </span>
                                    {lastUpdate && (
                                        <span className="text-xs text-gray-400">
                                            Updated {formatLastActivity(lastUpdate)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={fetchConversations}
                            disabled={loading}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 disabled:opacity-50"
                            title="Refresh conversations"
                        >
                            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                        <button
                            onClick={handleStartConversation}
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 border border-transparent rounded-lg font-semibold text-sm text-white hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            New Message
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Messages" />

            <div className="py-8">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-2xl border border-gray-100">
                        {loading && conversations.length === 0 ? (
                            <div className="space-y-0">
                                <LoadingSpinner />
                                <div className="divide-y divide-gray-100">
                                    {[...Array(3)].map((_, i) => (
                                        <ConversationSkeleton key={i} />
                                    ))}
                                </div>
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="p-16 text-center">
                                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                                    <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                    No conversations yet
                                </h3>
                                <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                                    Start connecting with others by working on projects, browsing jobs, or sending a direct message.
                                </p>
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <button
                                        onClick={handleStartConversation}
                                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 border border-transparent rounded-xl font-semibold text-sm text-white hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Start New Conversation
                                    </button>
                                    <Link
                                        href="/jobs"
                                        className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 rounded-xl font-semibold text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        Browse Jobs
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {conversations.map((conversation, index) => {
                                    const isUnread = conversation.unread_count > 0;
                                    return (
                                        <Link
                                            key={conversation.user.id}
                                            href={`/messages/${conversation.user.id}`}
                                            className={`block transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 group ${
                                                isUnread ? 'bg-blue-50/50' : ''
                                            }`}
                                        >
                                            <div className="p-6 relative">
                                                {isUnread && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500"></div>
                                                )}

                                                <div className="flex items-center space-x-4">
                                                    <div className="flex-shrink-0 relative">
                                                        <UserAvatar
                                                            user={conversation.user}
                                                            size="w-14 h-14"
                                                            showOnline={false}
                                                        />
                                                        {isUnread && (
                                                            <div className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full min-w-[1.25rem] h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                                                                {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center space-x-2 mb-1">
                                                                    <h3 className={`text-base font-semibold truncate group-hover:text-blue-900 transition-colors ${
                                                                        isUnread ? 'text-gray-900' : 'text-gray-800'
                                                                    }`}>
                                                                        {conversation.user.first_name} {conversation.user.last_name}
                                                                    </h3>
                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                        conversation.user.user_type === 'employer'
                                                                            ? 'bg-blue-100 text-blue-800 group-hover:bg-blue-200'
                                                                            : 'bg-emerald-100 text-emerald-800 group-hover:bg-emerald-200'
                                                                    } transition-colors`}>
                                                                        {conversation.user.user_type === 'employer' ? (
                                                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                                            </svg>
                                                                        ) : (
                                                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                                                                            </svg>
                                                                        )}
                                                                        {conversation.user.user_type === 'employer' ? 'Employer' : 'Gig Worker'}
                                                                    </span>
                                                                </div>

                                                                <div className={`text-sm leading-5 ${
                                                                    isUnread ? 'font-medium text-gray-900' : 'text-gray-600'
                                                                } group-hover:text-gray-800 transition-colors`}>
                                                                    {getLastMessagePreview(conversation.latest_message)}
                                                                </div>

                                                                {conversation.user.professional_title && (
                                                                    <div className="mt-1">
                                                                        <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
                                                                            {conversation.user.professional_title}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex flex-col items-end space-y-2 ml-4">
                                                                <div className="text-xs text-gray-500 font-medium group-hover:text-gray-600 transition-colors">
                                                                    {formatLastActivity(conversation.last_activity)}
                                                                </div>
                                                                {isUnread && (
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 group-hover:bg-blue-200 transition-colors">
                                                                        New
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex-shrink-0 ml-2">
                                                        <svg className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </div>

                                                {/* Hover effect overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Enhanced Quick Actions */}
                    {conversations.length > 0 && (
                        <div className="mt-8 bg-gradient-to-br from-white to-gray-50 overflow-hidden shadow-xl sm:rounded-2xl border border-gray-100">
                            <div className="p-8">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Link
                                        href="/projects"
                                        className="group flex items-center p-6 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all duration-200 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50"
                                    >
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-base font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">View Projects</div>
                                            <div className="text-sm text-gray-600 group-hover:text-blue-700 transition-colors">Manage active projects</div>
                                        </div>
                                        <div className="ml-auto">
                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </Link>

                                    <Link
                                        href="/jobs"
                                        className="group flex items-center p-6 border border-gray-200 rounded-xl hover:border-emerald-300 hover:shadow-lg transition-all duration-200 bg-white hover:bg-gradient-to-br hover:from-emerald-50 hover:to-green-50"
                                    >
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-base font-semibold text-gray-900 group-hover:text-emerald-900 transition-colors">Browse Jobs</div>
                                            <div className="text-sm text-gray-600 group-hover:text-emerald-700 transition-colors">Find new opportunities</div>
                                        </div>
                                        <div className="ml-auto">
                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </Link>

                                    <Link
                                        href={route('ai.recommendations')}
                                        className="group flex items-center p-6 border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-lg transition-all duration-200 bg-white hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50"
                                    >
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-base font-semibold text-gray-900 group-hover:text-purple-900 transition-colors">AI Recommendations</div>
                                            <div className="text-sm text-gray-600 group-hover:text-purple-700 transition-colors">Smart job matching</div>
                                        </div>
                                        <div className="ml-auto">
                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tips for Better Communication */}
                    {/* <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Communication Tips</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                            <div>
                                <h4 className="font-medium mb-2">For Employers:</h4>
                                <ul className="space-y-1 text-blue-700">
                                    <li>• Be clear about project requirements</li>
                                    <li>• Provide timely feedback</li>
                                    <li>• Ask questions if anything is unclear</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">For Gig Workers:</h4>
                                <ul className="space-y-1 text-blue-700">
                                    <li>• Update employers on progress regularly</li>
                                    <li>• Ask for clarification when needed</li>
                                    <li>• Share work samples and previews</li>
                                </ul>
                            </div>
                        </div>
                    </div> */}
                </div>
            </div>

            {/* Start Conversation Modal */}
            <StartConversationModal
                isOpen={showStartConversation}
                onClose={() => setShowStartConversation(false)}
                users={availableUsers}
            />
        </AuthenticatedLayout>
    );
}
