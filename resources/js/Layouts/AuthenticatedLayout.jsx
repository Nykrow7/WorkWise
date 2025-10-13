"use client";
import Dropdown from '@/Components/Dropdown';
import MiniChatModal from '@/Components/MiniChatModal';
import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Modern loading spinner component
const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-8">
        <div className="relative">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-8 h-8 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <span className="ml-3 text-sm text-gray-600 font-medium">Loading notifications...</span>
    </div>
);

// Skeleton loader for notifications
const NotificationSkeleton = () => (
    <div className="p-4 border-b border-gray-100 animate-pulse">
        <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
        </div>
    </div>
);

// Enhanced notification icons with better styling
const NotificationIcon = ({ type, icon }) => {
    const iconMap = {
        'contract_signing': 'file-signature',
        'bid_status': 'check-circle',
        'ai_recommendation': 'brain',
        'contract_fully_signed': 'check-double',
        'bid_accepted_messaging': 'comment-dots',
        'message_received': 'envelope',
        'new_message': 'envelope-open',
        'default': 'bell'
    };

    const iconClass = iconMap[type] || iconMap['default'];
    const colorMap = {
        'contract_signing': 'text-emerald-600',
        'bid_status': 'text-blue-600',
        'ai_recommendation': 'text-purple-600',
        'contract_fully_signed': 'text-green-600',
        'bid_accepted_messaging': 'text-indigo-600',
        'message_received': 'text-blue-500',
        'new_message': 'text-blue-500',
        'default': 'text-gray-600'
    };

    return (
        <i className={`fas fa-${iconClass} ${colorMap[type] || colorMap['default']} text-sm`}></i>
    );
};

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const isGigWorker = user.user_type === 'gig_worker';
    const isEmployer = user.user_type === 'employer';
    // Role-aware dashboard URL and active state
    const dashboardHref = isGigWorker
        ? '/gig-worker/dashboard'
        : (isEmployer
            ? '/employer/dashboard'
            : (user.user_type === 'admin' ? '/admin' : '/dashboard'));
    const isDashboardActive = ['/dashboard','/gig-worker/dashboard','/employer/dashboard','/admin']
        .some(prefix => window.location.pathname.startsWith(prefix));

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);
    const [showingNotificationsDropdown, setShowingNotificationsDropdown] =
        useState(false);
    const [showingMessagesDropdown, setShowingMessagesDropdown] =
        useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [optimisticUpdates, setOptimisticUpdates] = useState(new Set()); // Track optimistic updates


    // Real-time updates
    const [lastNotificationCheck, setLastNotificationCheck] = useState(Date.now());
    const [lastMessageCheck, setLastMessageCheck] = useState(Date.now());

    // Messages modal removed; use MiniChatModal for all messaging
    const [messagesUnreadCount, setMessagesUnreadCount] = useState(0);
    const [conversations, setConversations] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState(false);

    // Mini chat ref for controlling it from notifications
    const miniChatRef = useRef(null);

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/notifications/api');
            setNotifications(response.data.notifications || []);
            setUnreadCount(response.data.unread_count || 0);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    // Mark notification as read with optimistic updates
    const markAsRead = async (notificationId) => {
        // Optimistic update - update UI immediately
        const wasUnread = notifications.find(n => n.id === notificationId && !n.is_read);
        if (wasUnread) {
            setOptimisticUpdates(prev => new Set([...prev, notificationId]));
            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === notificationId
                        ? { ...notification, is_read: true, read_at: new Date().toISOString() }
                        : notification
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        }

        try {
            await axios.patch(`/notifications/${notificationId}/read`);
            // Remove from optimistic updates on success
            setOptimisticUpdates(prev => {
                const newSet = new Set(prev);
                newSet.delete(notificationId);
                return newSet;
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            // Revert optimistic update on error
            if (wasUnread) {
                setOptimisticUpdates(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(notificationId);
                    return newSet;
                });
                setNotifications(prev =>
                    prev.map(notification =>
                        notification.id === notificationId
                            ? { ...notification, is_read: false, read_at: null }
                            : notification
                    )
                );
                setUnreadCount(prev => prev + 1);
            }
        }
    };

    // Mark all notifications as read with optimistic updates
    const markAllAsRead = async () => {
        // Store unread notifications for potential rollback
        const unreadNotifications = notifications.filter(n => !n.is_read);
        const previousUnreadCount = unreadCount;

        // Optimistic update - update UI immediately
        setNotifications(prev =>
            prev.map(notification => ({
                ...notification,
                is_read: true,
                read_at: new Date().toISOString()
            }))
        );
        setUnreadCount(0);

        try {
            await axios.patch('/notifications/mark-all-read');
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            // Revert optimistic update on error
            setNotifications(prev =>
                prev.map(notification => {
                    const wasUnread = unreadNotifications.find(n => n.id === notification.id);
                    return wasUnread
                        ? { ...notification, is_read: false, read_at: null }
                        : notification;
                })
            );
            setUnreadCount(previousUnreadCount);
        }
    };

    // Handle notification click
    const handleNotificationClick = (notification) => {
        console.log('Notification clicked:', notification);
        if (!notification.is_read) {
            markAsRead(notification.id);
        }
        
        // Handle message-related notifications by navigating to messages page
        if (notification.type === 'bid_accepted_messaging') {
            const targetUserId = notification.data?.message_target_user_id;
            console.log('Bid accepted messaging notification - targetUserId:', targetUserId);

            if (targetUserId) {
                // Navigate to messages index with user parameter to open specific conversation
                console.log('Navigating to messages with user:', targetUserId);
                router.visit(`/messages?user=${targetUserId}`);
            } else {
                // Navigate to messages index if no specific user
                console.log('No targetUserId found, navigating to messages index');
                router.visit('/messages');
            }
        } else if (notification.type === 'new_message' || notification.type === 'message_received') {
            // Handle regular message notifications - navigate to conversation
            const senderId = notification.data?.sender_id;
            console.log('Message notification - senderId:', senderId, 'notification data:', notification.data);

            if (senderId) {
                // Navigate to messages index with user parameter to open specific conversation
                console.log('Navigating to messages with user:', senderId);
                router.visit(`/messages?user=${senderId}`);
            } else {
                // Navigate to messages index if no specific sender
                console.log('No senderId found, navigating to messages index');
                router.visit('/messages');
            }
        } else if (notification.action_url) {
            // For other notification types, use the action URL
            console.log('Using action URL:', notification.action_url);
            router.visit(notification.action_url);
        }
        
        setShowingNotificationsDropdown(false);
    };

    // Handle message button click for notifications
    const handleMessageButtonClick = (e, notification) => {
        e.stopPropagation(); // Prevent notification click
        console.log('Message button clicked for notification:', notification);

        if (!notification.is_read) {
            markAsRead(notification.id);
        }

        // Get the target user info from notification data based on notification type
        let targetUserId;

        if (notification.type === 'bid_accepted_messaging') {
            targetUserId = notification.data?.message_target_user_id;
        } else if (notification.type === 'new_message' || notification.type === 'message_received') {
            targetUserId = notification.data?.sender_id;
        } else {
            // Fallback to message_target_user_id for other types
            targetUserId = notification.data?.message_target_user_id;
        }

        console.log('Message button clicked - notification type:', notification.type, 'targetUserId:', targetUserId);

        if (targetUserId) {
            // Navigate to messages index with user parameter to open specific conversation
            console.log('Navigating to messages with user:', targetUserId);
            router.visit(`/messages?user=${targetUserId}`);
        } else {
            // Navigate to messages index if no specific user
            console.log('No targetUserId found, navigating to messages index');
            router.visit('/messages');
        }

        setShowingNotificationsDropdown(false);
    };

    // Removed Quick Chat helpers; MiniChat widget is always visible

    // Handle notification button click
    const handleNotificationButtonClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Notification button clicked, current state:', showingNotificationsDropdown);
        setShowingNotificationsDropdown(!showingNotificationsDropdown);
        if (!showingNotificationsDropdown) {
            fetchNotifications();
        }
    };

    // Load notifications on component mount
    useEffect(() => {
        fetchNotifications();
        fetchMessagesUnreadCount();
    }, []);


    // Fetch unread message count
    const fetchMessagesUnreadCount = async () => {
        try {
            const response = await axios.get('/messages/unread/count');
            setMessagesUnreadCount(response.data.count || 0);
        } catch (error) {
            console.error('Error fetching messages unread count:', error);
        }
    };

    // Fetch conversations for messages dropdown
    const fetchConversations = async () => {
        try {
            setMessagesLoading(true);
            const response = await axios.get('/messages/recent/conversations');
            setConversations(response.data.conversations || []);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setMessagesLoading(false);
        }
    };

    // Handle messages button click - show dropdown and mark as read
    const handleMessagesButtonClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowingMessagesDropdown(!showingMessagesDropdown);

        if (!showingMessagesDropdown) {
            fetchConversations();
            // Mark all messages as read when opening the dropdown
            if (messagesUnreadCount > 0) {
                markAllMessagesAsRead();
            }
        }
    };

    // Mark all messages as read
    const markAllMessagesAsRead = async () => {
        try {
            // Mark all conversations as read by calling the backend for each conversation
            const markPromises = conversations.map(async (conversation) => {
                if (conversation.unread_count > 0) {
                    try {
                        await axios.patch(`/messages/conversation/${conversation.user.id}/read`);
                    } catch (error) {
                        console.error(`Error marking conversation ${conversation.user.id} as read:`, error);
                    }
                }
            });

            await Promise.all(markPromises);

            // Update the unread count to 0
            setMessagesUnreadCount(0);

            // Update conversations to reflect read status
            setConversations(prev =>
                prev.map(conv => ({
                    ...conv,
                    unread_count: 0
                }))
            );
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    // Handle conversation click
    const handleConversationClick = async (conversation) => {
        console.log('Conversation clicked:', conversation);

        // Mark this conversation as read if it has unread messages
        if (conversation.unread_count > 0) {
            try {
                await axios.patch(`/messages/conversation/${conversation.user.id}/read`);

                // Update the unread count
                const newUnreadCount = Math.max(0, messagesUnreadCount - conversation.unread_count);
                setMessagesUnreadCount(newUnreadCount);

                // Update this conversation's unread count
                setConversations(prev =>
                    prev.map(conv =>
                        conv.user.id === conversation.user.id
                            ? { ...conv, unread_count: 0 }
                            : conv
                    )
                );
            } catch (error) {
                console.error('Error marking conversation as read:', error);
            }
        }

        // Navigate to messages index with user parameter to open specific conversation
        router.visit(`/messages?user=${conversation.user.id}`);
        setShowingMessagesDropdown(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showingNotificationsDropdown && !event.target.closest('.notifications-dropdown')) {
                setShowingNotificationsDropdown(false);
            }
            if (showingMessagesDropdown && !event.target.closest('.messages-dropdown')) {
                setShowingMessagesDropdown(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showingNotificationsDropdown, showingMessagesDropdown]);


    // Real-time polling for notifications
    const checkForNewNotifications = async () => {
        try {
            const response = await axios.get('/notifications/api');
            const newUnreadCount = response.data.unread_count || 0;

            if (newUnreadCount > unreadCount) {
                // New notifications arrived, refresh the list
                setNotifications(response.data.notifications || []);
                setUnreadCount(newUnreadCount);
                setLastNotificationCheck(Date.now());

                // Show browser notification if supported
                if ('Notification' in window && Notification.permission === 'granted') {
                    const latestNotification = response.data.notifications?.[0];
                    if (latestNotification && !latestNotification.is_read) {
                        new Notification(latestNotification.title, {
                            body: latestNotification.message,
                            icon: '/favicon.ico'
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error checking for new notifications:', error);
        }
    };

    // Real-time polling for messages
    const checkForNewMessages = async () => {
        try {
            const response = await axios.get('/messages/unread/count');
            const newMessageCount = response.data.count || 0;

            if (newMessageCount !== messagesUnreadCount) {
                // Update message count
                setMessagesUnreadCount(newMessageCount);
                setLastMessageCheck(Date.now());

                // Show browser notification if supported and count increased
                if (newMessageCount > messagesUnreadCount && 'Notification' in window && Notification.permission === 'granted') {
                    new Notification('New Message', {
                        body: `You have ${newMessageCount} unread messages`,
                        icon: '/favicon.ico'
                    });
                }
            }
        } catch (error) {
            console.error('Error checking for new messages:', error);
        }
    };

    // Set up polling intervals
    useEffect(() => {
        const notificationInterval = setInterval(checkForNewNotifications, 10000); // Check every 10 seconds
        const messageInterval = setInterval(checkForNewMessages, 5000); // Check every 5 seconds

        return () => {
            clearInterval(notificationInterval);
            clearInterval(messageInterval);
        };
    }, [unreadCount, messagesUnreadCount]);

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <nav className="border-b border-gray-200 bg-white">
                <div className="mx-auto" style={{ paddingLeft: '0.45in', paddingRight: '0.45in' }}>
                    <div className="flex h-16 justify-between items-center">
                        {/* Logo - Left */}
                        <div className="flex-shrink-0">
                            <Link href="/" className="flex items-center">
                                <span className="text-2xl font-bold text-blue-600">WorkWise</span>
                            </Link>
                        </div>

                        {/* Enhanced Navigation - Center */}
                        <div className="flex-1 flex justify-center">
                            <div className="hidden md:flex space-x-8">
                                {/* Dashboard */}
                                <Link
                                    href={dashboardHref}
                                    className={`text-sm font-medium transition-colors ${
                                        isDashboardActive
                                            ? 'text-blue-600'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Dashboard
                                </Link>

                                {/* Jobs/Work - Role-specific labels */}
                                <Link
                                    href="/jobs"
                                    className={`text-sm font-medium transition-colors ${
                                        window.route.current('jobs.*')
                                            ? 'text-blue-600'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    {isGigWorker ? 'Browse Jobs' : 'My Jobs'}
                                </Link>

                                {/* Gig Worker-only navigation */}
                                {isGigWorker && (
                                    <>
                                        <Link
                                            href="/bids"
                                            className={`text-sm font-medium transition-colors ${
                                                window.route.current('bids.*')
                                                    ? 'text-blue-600'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            My Proposals
                                        </Link>
                                        <Link
                                            href="/ai/recommendations"
                                            className={`text-sm font-medium transition-colors ${
                                                window.route.current('ai.*')
                                                    ? 'text-blue-600'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            AI Recommendations
                                        </Link>
                                    </>
                                )}

                                {/* Employer-only navigation */}
                                {isEmployer && (
                                    <>
                                        <Link
                                            href="/jobs/create"
                                            className={`text-sm font-medium rounded-md transition-colors ${
                                                window.route.current('jobs.create')
                                                    ? 'text-blue-600'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            Post a Job
                                        </Link>
                                        <Link
                                            href="/freelancers"
                                            className={`text-sm font-medium transition-colors ${
                                                window.route.current('freelancers.*')
                                                    ? 'text-blue-600'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            Browse Freelancers
                                        </Link>
                                        <Link
                                            href="/ai/recommendations"
                                            className={`text-sm font-medium transition-colors ${
                                                window.route.current('ai.*')
                                                    ? 'text-blue-600'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            AI Talent Recommendations
                                        </Link>
                                    </>
                                )}

                                {/* Common navigation */}
                                <Link
                                    href="/projects"
                                    className={`text-sm font-medium transition-colors ${
                                        window.route.current('projects.*')
                                            ? 'text-blue-600'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Projects
                                </Link>

                                <Link
                                    href="/messages"
                                    className={`text-sm font-medium transition-colors ${
                                        window.route.current('messages.*')
                                            ? 'text-blue-600'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    Messages
                                </Link>
                            </div>
                        </div>

                        {/* User Menu - Right */}
                        <div className="flex items-center space-x-4">
                            {/* Enhanced Notifications Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={handleNotificationButtonClick}
                                    className="relative p-2 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.5a6 6 0 0 1 6 6v2l1.5 3h-15l1.5-3v-2a6 6 0 0 1 6-6z" />
                                    </svg>
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[1.25rem] h-5 animate-pulse">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Enhanced Notifications Dropdown */}
                                {showingNotificationsDropdown && (
                                    <div className="notifications-dropdown absolute right-0 mt-3 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden backdrop-blur-sm">
                                        {/* Header */}
                                        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-base font-semibold text-gray-900">Notifications</h3>
                                                        {unreadCount > 0 && (
                                                            <p className="text-xs text-gray-600">{unreadCount} unread</p>
                                                        )}
                                                    </div>
                                                </div>
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            markAllAsRead();
                                                        }}
                                                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-all duration-200 hover:scale-105"
                                                    >
                                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        Mark all read
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Notifications List */}
                                        <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                            {loading ? (
                                                <div className="space-y-0">
                                                    <LoadingSpinner />
                                                    {/* Show skeleton loaders while loading */}
                                                    <div className="space-y-0">
                                                        {[...Array(3)].map((_, i) => (
                                                            <NotificationSkeleton key={i} />
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : notifications.length === 0 ? (
                                                <div className="p-8 text-center">
                                                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-5 5v-5zM10.5 3.5a6 6 0 0 1 6 6v2l1.5 3h-15l1.5-3v-2a6 6 0 0 1 6-6z" />
                                                        </svg>
                                                    </div>
                                                    <h4 className="text-sm font-medium text-gray-900 mb-1">No notifications</h4>
                                                    <p className="text-xs text-gray-500">You're all caught up!</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-gray-100">
                                                    {notifications.map((notification) => {
                                                        const isOptimistic = optimisticUpdates.has(notification.id);
                                                        const isUnread = !notification.is_read;

                                                        return (
                                                            <div
                                                                key={notification.id}
                                                                onClick={() => handleNotificationClick(notification)}
                                                                className={`notification-item group relative p-4 cursor-pointer transition-all duration-300 hover:bg-gray-50 ${
                                                                    isUnread ? 'bg-blue-50/50 border-l-4 border-blue-500' : 'hover:bg-gray-25'
                                                                } ${isOptimistic ? 'opacity-75' : ''}`}
                                                            >
                                                                <div className="flex items-start space-x-4">
                                                                    {/* Enhanced Icon */}
                                                                    <div className="flex-shrink-0 relative">
                                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-all duration-200 group-hover:scale-105 ${
                                                                            notification.type === 'contract_signing' ? 'bg-emerald-100 group-hover:bg-emerald-200' :
                                                                            notification.type === 'bid_status' ? 'bg-blue-100 group-hover:bg-blue-200' :
                                                                            notification.type === 'ai_recommendation' ? 'bg-purple-100 group-hover:bg-purple-200' :
                                                                            notification.type === 'bid_accepted_messaging' ? 'bg-indigo-100 group-hover:bg-indigo-200' :
                                                                            notification.type === 'message_received' ? 'bg-blue-100 group-hover:bg-blue-200' :
                                                                            notification.type === 'new_message' ? 'bg-blue-100 group-hover:bg-blue-200' :
                                                                            'bg-gray-100 group-hover:bg-gray-200'
                                                                        }`}>
                                                                            <NotificationIcon type={notification.type} icon={notification.icon} />
                                                                        </div>
                                                                        {isUnread && (
                                                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white animate-pulse"></div>
                                                                        )}
                                                                    </div>

                                                                    {/* Content */}
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-start justify-between">
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className={`text-sm font-semibold leading-5 ${
                                                                                    isUnread ? 'text-gray-900' : 'text-gray-700'
                                                                                } group-hover:text-gray-900 transition-colors`}>
                                                                                    {notification.title}
                                                                                </p>
                                                                                <p className={`text-sm mt-1 leading-5 ${
                                                                                    isUnread ? 'text-gray-700' : 'text-gray-600'
                                                                                } group-hover:text-gray-700 transition-colors line-clamp-2`}>
                                                                                    {notification.message}
                                                                                </p>
                                                                                <div className="flex items-center mt-2 space-x-2">
                                                                                    <p className="text-xs text-gray-500 font-medium">
                                                                                        {new Date(notification.created_at).toLocaleDateString('en-US', {
                                                                                            month: 'short',
                                                                                            day: 'numeric',
                                                                                            hour: '2-digit',
                                                                                            minute: '2-digit'
                                                                                        })}
                                                                                    </p>
                                                                                    {isUnread && (
                                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                                            New
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            {/* Action Button */}
                                                                            {notification.data?.show_message_button && (
                                                                                <div className="flex-shrink-0 ml-3">
                                                                                    <button
                                                                                        onClick={(e) => handleMessageButtonClick(e, notification)}
                                                                                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
                                                                                        title="Start messaging"
                                                                                    >
                                                                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                                                                        </svg>
                                                                                        Message
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Hover indicator */}
                                                                <div className="absolute inset-y-0 right-0 w-1 bg-blue-500 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-center"></div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                                            <Link
                                                href="/notifications"
                                                className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                                onClick={() => setShowingNotificationsDropdown(false)}
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                View all notifications
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Enhanced Messages Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={handleMessagesButtonClick}
                                    className="relative p-2 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    {messagesUnreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[1.25rem] h-5 animate-pulse">
                                            {messagesUnreadCount > 99 ? '99+' : messagesUnreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Enhanced Messages Dropdown */}
                                {showingMessagesDropdown && (
                                    <div className="messages-dropdown absolute right-0 mt-3 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden backdrop-blur-sm z-50">
                                        {/* Header */}
                                        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-base font-semibold text-gray-900">Messages</h3>
                                                        {conversations.length > 0 && (
                                                            <p className="text-xs text-gray-600">{conversations.length} conversations</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <Link
                                                    href="/messages"
                                                    onClick={(e) => {
                                                        setShowingMessagesDropdown(false);
                                                    }}
                                                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-all duration-200 hover:scale-105"
                                                >
                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                                    </svg>
                                                    Open Messages
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Conversations List */}
                                        <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                            {messagesLoading ? (
                                                <div className="space-y-0">
                                                    <LoadingSpinner />
                                                    {/* Show skeleton loaders while loading */}
                                                    <div className="space-y-0">
                                                        {[...Array(3)].map((_, i) => (
                                                            <NotificationSkeleton key={i} />
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : conversations.length === 0 ? (
                                                <div className="p-8 text-center">
                                                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                        </svg>
                                                    </div>
                                                    <h4 className="text-sm font-medium text-gray-900 mb-1">No conversations</h4>
                                                    <p className="text-xs text-gray-500">Start a conversation to see it here!</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-gray-100">
                                                    {conversations.map((conversation) => (
                                                        <div
                                                            key={conversation.user.id}
                                                            onClick={() => handleConversationClick(conversation)}
                                                            className={`notification-item group relative p-4 cursor-pointer transition-all duration-300 hover:bg-gray-50 ${
                                                                conversation.unread_count > 0 ? 'bg-blue-50/50 border-l-4 border-blue-500' : 'hover:bg-gray-25'
                                                            }`}
                                                        >
                                                            <div className="flex items-start space-x-4">
                                                                {/* User Avatar */}
                                                                <div className="flex-shrink-0 relative">
                                                                    <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm transition-all duration-200 group-hover:scale-105">
                                                                        {conversation.user.profile_photo ? (
                                                                            <img
                                                                                src={`/storage/${conversation.user.profile_photo}`}
                                                                                alt={`${conversation.user.first_name} ${conversation.user.last_name}`}
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                                                                                {conversation.user.first_name ? conversation.user.first_name.charAt(0).toUpperCase() : conversation.user.name.charAt(0).toUpperCase()}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    {conversation.unread_count > 0 && (
                                                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                                                                    )}
                                                                </div>

                                                                {/* Content */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-start justify-between">
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-sm font-semibold leading-5 text-gray-900 group-hover:text-gray-900 transition-colors">
                                                                                {conversation.user.first_name && conversation.user.last_name
                                                                                    ? `${conversation.user.first_name} ${conversation.user.last_name}`
                                                                                    : conversation.user.name}
                                                                            </p>
                                                                            <p className="text-sm mt-1 leading-5 text-gray-600 group-hover:text-gray-700 transition-colors line-clamp-2">
                                                                                {conversation.latest_message.type === 'file'
                                                                                    ? `📎 ${conversation.latest_message.attachment_name || 'File attachment'}`
                                                                                    : conversation.latest_message.message}
                                                                            </p>
                                                                            <div className="flex items-center mt-2 space-x-2">
                                                                                <p className="text-xs text-gray-500 font-medium">
                                                                                    {new Date(conversation.last_activity).toLocaleDateString('en-US', {
                                                                                        month: 'short',
                                                                                        day: 'numeric',
                                                                                        hour: '2-digit',
                                                                                        minute: '2-digit'
                                                                                    })}
                                                                                </p>
                                                                                {conversation.unread_count > 0 && (
                                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                                        {conversation.unread_count} new
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Hover indicator */}
                                                            <div className="absolute inset-y-0 right-0 w-1 bg-blue-500 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-center"></div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                                            <Link
                                                href="/messages"
                                                className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                                onClick={() => setShowingMessagesDropdown(false)}
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                View all messages
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* User Dropdown */}
                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                                {user.first_name ? user.first_name.charAt(0).toUpperCase() : user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="hidden md:block">{user.first_name || user.name}</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <div className="text-sm font-medium text-gray-900">{user.first_name ? `${user.first_name} ${user.last_name}` : user.name}</div>
                                            <div className="text-xs text-gray-500 capitalize">{user.user_type}</div>
                                        </div>
                                        <Dropdown.Link href="/profile">
                                            Profile Settings
                                        </Dropdown.Link>
                                        <Dropdown.Link href="/messages">
                                            Messages
                                        </Dropdown.Link>
                                        <Dropdown.Link href={isEmployer ? '/employer/wallet' : '/gig-worker/wallet'}>
                                              {isEmployer ? 'Wallet' : 'Earnings'}
                                        </Dropdown.Link>
                                        <Dropdown.Link href="/analytics">
                                             Analytics
                                        </Dropdown.Link>
                                        <Dropdown.Link href="/reports">
                                             My Reports
                                        </Dropdown.Link>
                                        <Dropdown.Link href="#">
                                            Help & Support
                                        </Dropdown.Link>
                                        <div className="border-t border-gray-100">
                                            <Dropdown.Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                            >
                                                Log Out
                                            </Dropdown.Link>
                                        </div>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="md:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className={`${showingNavigationDropdown ? 'block' : 'hidden'} md:hidden border-t border-gray-200`}>
                    <div className="px-4 py-2 space-y-1">
                        {/* Dashboard (role-aware) */}
                        <Link
                            href={dashboardHref}
                            className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                isDashboardActive
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            Dashboard
                        </Link>
                        {/* Jobs/Work - Role-specific */}
                        <Link
                            href="/jobs"
                            className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                window.route.current('jobs.*')
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            {isGigWorker ? 'Find Work' : 'My Jobs'}
                        </Link
                        >

                        {/* Gig Worker-only mobile navigation */}
                        {isGigWorker && (
                            <Link
                                href="/bids"
                                className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                    window.route.current('bids.*')
                                        ? 'text-blue-600 bg-blue-50'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                My Proposals
                            </Link>
                        )}

                        {/* Employer-only mobile navigation */}
                        {isEmployer && (
                            <Link
                                href="/jobs/create"
                                className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                    window.route.current('jobs.create')
                                        ? 'text-blue-600 bg-blue-50'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                Post a Job
                            </Link>
                        )}

                        {/* Common mobile navigation */}
                        <Link
                            href="/projects"
                            className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                window.route.current('projects.*')
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            Projects
                        </Link>
                    </div>

                    <div className="border-t border-gray-200 px-4 py-3">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                                {user.first_name ? user.first_name.charAt(0).toUpperCase() : user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-900">{user.first_name ? `${user.first_name} ${user.last_name}` : user.name}</div>
                                <div className="text-xs text-gray-500 capitalize">{user.user_type}</div>
                            </div>
                        </div>
                        <div className="mt-3 space-y-1">
                            <Link
                                href={route('profile.edit')}
                                className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                            >
                                Profile Settings
                            </Link>
                            <Link
                                href="/messages"
                                className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                            >
                                Messages
                            </Link>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                            >
                                Log Out
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-1">{children}</main>

            {/* Messages Page Modal removed; MiniChatModal widget removed from UI */}
            {/* MiniChatModal component preserved for potential use elsewhere but not rendered in main layout */}
        </div>
    );
}
