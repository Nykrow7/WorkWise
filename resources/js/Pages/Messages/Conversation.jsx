import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

import axios from 'axios';

// Enhanced Loading Components
const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-4">
        <div className="relative">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-6 h-6 border-2 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <span className="ml-2 text-sm text-gray-600">Loading messages...</span>
    </div>
);

const MessageSkeleton = () => (
    <div className="flex space-x-3 animate-pulse mb-4">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
        <div className="flex-1">
            <div className="bg-gray-200 rounded-2xl p-3 max-w-xs">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-16 mt-1"></div>
        </div>
    </div>
);

// Enhanced Avatar Component
const UserAvatar = ({ user, size = 'w-8 h-8', showOnline = false }) => {
    const sizeClasses = {
        'w-6 h-6': 'w-6 h-6 text-xs',
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

export default function Conversation({ user, messages, currentUser }) {
    const [messageList, setMessageList] = useState(messages);
    const [isTyping, setIsTyping] = useState(false);
    const [loading, setLoading] = useState(false);
    const [optimisticMessages, setOptimisticMessages] = useState(new Set());
    const [lastMessageId, setLastMessageId] = useState(
        messages.length > 0 ? Math.max(...messages.map(m => m.id)) : 0
    );
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        receiver_id: user.id,
        message: '',
        attachment: null
    });

    // Enhanced scroll to bottom with smooth animation
    const scrollToBottom = (smooth = true) => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
                behavior: smooth ? "smooth" : "auto",
                block: "end"
            });
        }
    };

    // Real-time message polling
    const fetchNewMessages = useCallback(async () => {
        try {
            const response = await axios.get(`/messages/${user.id}/new`, {
                params: { after: lastMessageId }
            });

            if (response.data.messages && response.data.messages.length > 0) {
                const newMessages = response.data.messages;
                setMessageList(prev => [...prev, ...newMessages]);
                setLastMessageId(Math.max(...newMessages.map(m => m.id)));

                // Smooth scroll to bottom for new messages
                setTimeout(() => {
                    scrollToBottom(true);
                }, 100);
            }
        } catch (error) {
            console.error('Error fetching new messages:', error);
        }
    }, [user.id, lastMessageId]);

    // Poll for new messages every 5 seconds
    useEffect(() => {
        const interval = setInterval(fetchNewMessages, 5000);
        return () => clearInterval(interval);
    }, [fetchNewMessages]);

    useEffect(() => {
        scrollToBottom(false); // Initial scroll without animation
    }, []);

    useEffect(() => {
        scrollToBottom(true); // Smooth scroll for new messages
    }, [messageList]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!data.message.trim() && !data.attachment) {
            return;
        }

        // Create optimistic message
        const optimisticId = `temp-${Date.now()}`;
        const optimisticMessage = {
            id: optimisticId,
            message: data.message,
            sender_id: currentUser.id,
            receiver_id: user.id,
            created_at: new Date().toISOString(),
            type: data.attachment ? 'file' : 'text',
            attachment_name: data.attachment?.name || null,
            sender: currentUser,
            isOptimistic: true
        };

        // Add optimistic message immediately
        setOptimisticMessages(prev => new Set([...prev, optimisticId]));
        setMessageList(prev => [...prev, optimisticMessage]);

        // Clear form immediately for better UX
        const messageToSend = data.message;
        const attachmentToSend = data.attachment;
        reset();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        try {
            const formData = new FormData();
            formData.append('receiver_id', user.id);
            formData.append('message', messageToSend);
            if (attachmentToSend) {
                formData.append('attachment', attachmentToSend);
            }

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (!csrfToken) {
                throw new Error('CSRF token not found');
            }

            const response = await fetch('/messages', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken
                },
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                // Replace optimistic message with real message
                setMessageList(prev => prev.map(msg =>
                    msg.id === optimisticId ? result.message : msg
                ));
                setOptimisticMessages(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(optimisticId);
                    return newSet;
                });
                setLastMessageId(result.message.id);
            } else {
                throw new Error(result.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);

            // Remove optimistic message on error
            setMessageList(prev => prev.filter(msg => msg.id !== optimisticId));
            setOptimisticMessages(prev => {
                const newSet = new Set(prev);
                newSet.delete(optimisticId);
                return newSet;
            });

            // Show error to user (you might want to add a toast notification here)
            alert('Failed to send message. Please try again.');
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('attachment', file);
        }
    };





    const formatMessageTime = (timestamp) => {
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

    const renderMessage = (message) => {
        const isOwnMessage = message.sender_id === currentUser.id;
        const isOptimistic = optimisticMessages.has(message.id);

        return (
            <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-6 group`}>
                <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end space-x-3 max-w-xs lg:max-w-md xl:max-w-lg`}>
                    <div className="flex-shrink-0">
                        <UserAvatar user={message.sender} size="w-8 h-8" />
                    </div>
                    <div className="flex flex-col space-y-1">
                        <div className={`message-bubble px-4 py-3 rounded-2xl shadow-sm ${
                            isOwnMessage
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md'
                                : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                        } ${isOptimistic ? 'optimistic opacity-75' : ''} ${!isOwnMessage ? 'received' : ''}`}>
                            {message.type === 'file' ? (
                                <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                        isOwnMessage ? 'bg-white/20' : 'bg-blue-100'
                                    }`}>
                                        <svg className={`w-5 h-5 ${isOwnMessage ? 'text-white' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm truncate">{message.attachment_name}</div>
                                        <a
                                            href={`/messages/${message.id}/download`}
                                            className={`text-xs ${isOwnMessage ? 'text-blue-200 hover:text-white' : 'text-blue-600 hover:text-blue-800'} hover:underline transition-colors`}
                                        >
                                            Download file
                                        </a>
                                    </div>
                                </div>
                        ) : (
                            <div className="whitespace-pre-wrap leading-relaxed">{message.message}</div>
                        )}
                        </div>

                        {/* Message timestamp and status */}
                        <div className={`flex items-center justify-between text-xs mt-2 ${
                            isOwnMessage ? 'flex-row-reverse' : 'flex-row'
                        }`}>
                            <span className={`${isOwnMessage ? 'text-blue-200' : 'text-gray-500'} group-hover:opacity-100 transition-opacity ${
                                isOptimistic ? 'opacity-60' : 'opacity-70'
                            }`}>
                                {formatMessageTime(message.created_at)}
                            </span>

                            {/* Message status indicators for own messages */}
                            {isOwnMessage && (
                                <div className="flex items-center space-x-1 ml-2">
                                    {isOptimistic ? (
                                        <div className="message-status sending">
                                            <svg className="w-3 h-3 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    ) : message.is_read ? (
                                        <div className="flex items-center space-x-0.5" title="Read">
                                            <svg className="w-3 h-3 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <svg className="w-3 h-3 text-blue-300 -ml-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    ) : (
                                        <svg className="w-3 h-3 text-blue-300" fill="currentColor" viewBox="0 0 20 20" title="Delivered">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/messages"
                            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                        </Link>
                        <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                                <UserAvatar user={user} size="w-12 h-12" showOnline={false} />
                            </div>
                            <div>
                                <h2 className="font-bold text-xl text-gray-900 leading-tight">
                                    {user.first_name} {user.last_name}
                                </h2>
                                <div className="flex items-center space-x-3 mt-1">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                        user.user_type === 'employer'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-emerald-100 text-emerald-800'
                                    }`}>
                                        {user.user_type === 'employer' ? (
                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        {user.user_type === 'employer' ? 'Employer' : 'Gig Worker'}
                                    </span>
                                    {user.professional_title && (
                                        <span className="text-sm text-gray-600">• {user.professional_title}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={fetchNewMessages}
                            disabled={loading}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 disabled:opacity-50"
                            title="Refresh messages"
                        >
                            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                        <a
                            href={`/reports/create?user_id=${user.id}`}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            Report
                        </a>
                    </div>
                </div>
            }
        >
            <Head title={`Chat with ${user.first_name} ${user.last_name}`} />

            <div className="py-8">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-2xl border border-gray-100">
                        {/* Messages Area */}
                        <div className="messages-container h-[32rem] overflow-y-auto p-6 bg-gradient-to-b from-gray-50/30 to-white">
                            {loading && messageList.length === 0 ? (
                                <div className="space-y-4">
                                    <LoadingSpinner />
                                    {[...Array(3)].map((_, i) => (
                                        <MessageSkeleton key={i} />
                                    ))}
                                </div>
                            ) : messageList.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                                            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                                        <p className="text-gray-600 max-w-sm mx-auto">Start the conversation by sending a message below. Be professional and respectful.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {messageList.map(renderMessage)}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Enhanced Message Input */}
                        <div className="p-6 bg-gray-50 border-t border-gray-100">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* File attachment preview */}
                                {data.attachment && (
                                    <div className="file-preview bg-white border border-gray-200 rounded-xl p-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{data.attachment.name}</p>
                                                <p className="text-xs text-gray-500">{(data.attachment.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setData('attachment', null);
                                                    if (fileInputRef.current) {
                                                        fileInputRef.current.value = '';
                                                    }
                                                }}
                                                className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Message input container */}
                                <div className="message-input-container bg-white border border-gray-300 rounded-2xl shadow-sm">
                                    <div className="flex items-end space-x-3 p-4">
                                        <div className="flex-1">
                                            <textarea
                                                value={data.message}
                                                onChange={(e) => setData('message', e.target.value)}
                                                placeholder="Type your message..."
                                                rows={2}
                                                className="w-full border-0 resize-none focus:ring-0 focus:outline-none placeholder-gray-500 text-gray-900"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        if (!processing && (data.message.trim() || data.attachment)) {
                                                            handleSubmit(e);
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                                                title="Attach file"
                                            >
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                </svg>
                                            </button>

                                            <button
                                                type="submit"
                                                disabled={processing || (!data.message.trim() && !data.attachment)}
                                                className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 border border-transparent rounded-xl font-semibold text-sm text-white hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                                            >
                                                {processing ? (
                                                    <div className="flex items-center">
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                        Sending...
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center">
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                        </svg>
                                                        Send
                                                    </div>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>

                            <div className="mt-3 text-xs text-gray-500 text-center">
                                Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Shift+Enter</kbd> for new line • Max file size: 10MB
                            </div>
                        </div>
                    </div>

                    {/* Enhanced User Info Sidebar */}
                    <div className="mt-8 bg-gradient-to-br from-white to-gray-50 overflow-hidden shadow-xl sm:rounded-2xl border border-gray-100">
                        <div className="p-8">
                            <div className="flex items-center space-x-4 mb-6">
                                <UserAvatar user={user} size="w-16 h-16" showOnline={false} />
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">About {user.first_name}</h3>
                                    <p className="text-sm text-gray-600">
                                        {user.user_type === 'employer' ? 'Employer' : 'Gig Worker'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {user.bio && (
                                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                                        <dt className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                            <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Bio
                                        </dt>
                                        <dd className="text-sm text-gray-900 leading-relaxed">{user.bio}</dd>
                                    </div>
                                )}

                                {user.skills && user.skills.length > 0 && (
                                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                                        <dt className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                            <svg className="w-4 h-4 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                            Skills
                                        </dt>
                                        <dd>
                                            <div className="flex flex-wrap gap-2">
                                                {user.skills.map((skill, index) => (
                                                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </dd>
                                    </div>
                                )}

                                {user.hourly_rate && (
                                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                                        <dt className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                            Hourly Rate
                                        </dt>
                                        <dd className="text-lg font-bold text-green-600">₱{user.hourly_rate}/hour</dd>
                                    </div>
                                )}

                                {user.barangay && (
                                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                                        <dt className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                            <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Location
                                        </dt>
                                        <dd className="text-sm text-gray-900">{user.barangay}, Lapu-Lapu City</dd>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <div className="flex space-x-3">
                                    <a
                                        href={`/reports/create?user_id=${user.id}`}
                                        className="flex-1 text-center px-4 py-3 border border-red-300 text-sm font-semibold rounded-xl text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 flex items-center justify-center"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        Report User
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
