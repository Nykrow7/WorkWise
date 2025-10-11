import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';

// Status Badge Component
const StatusBadge = ({ status }) => {
    const statusConfig = {
        new_lead: { label: 'New Lead', color: 'bg-blue-100 text-blue-800' },
        contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
        qualified: { label: 'Qualified', color: 'bg-green-100 text-green-800' },
        proposal_sent: { label: 'Proposal Sent', color: 'bg-purple-100 text-purple-800' },
        negotiating: { label: 'Negotiating', color: 'bg-orange-100 text-orange-800' },
        closed_won: { label: 'Closed Won', color: 'bg-green-600 text-white' },
        closed_lost: { label: 'Closed Lost', color: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status] || statusConfig.new_lead;

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
            {config.label}
        </span>
    );
};

// User Avatar Component
const UserAvatar = ({ user, size = "w-10 h-10" }) => {
    if (user.profile_photo) {
        return (
            <img
                src={user.profile_photo}
                alt={`${user.first_name} ${user.last_name}`}
                className={`${size} rounded-full object-cover`}
            />
        );
    }

    const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
    const colorIndex = (user.id || 0) % colors.length;

    return (
        <div className={`${size} ${colors[colorIndex]} rounded-full flex items-center justify-center text-white font-semibold`}>
            {initials}
        </div>
    );
};

// Loading Spinner Component
const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
);

// Message Skeleton Component
const MessageSkeleton = () => (
    <div className="flex items-start space-x-3 animate-pulse">
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
    </div>
);

// Status Change Modal Component
const StatusChangeModal = ({ isOpen, onClose, currentStatus, onStatusChange, saving }) => {
    const [selectedStatus, setSelectedStatus] = useState(currentStatus);

    const statuses = [
        { value: 'new_lead', label: 'New Lead' },
        { value: 'contacted', label: 'Contacted' },
        { value: 'qualified', label: 'Qualified' },
        { value: 'proposal_sent', label: 'Proposal Sent' },
        { value: 'negotiating', label: 'Negotiating' },
        { value: 'closed_won', label: 'Closed Won' },
        { value: 'closed_lost', label: 'Closed Lost' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        onStatusChange(selectedStatus);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <form onSubmit={handleSubmit}>
                        <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
                            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                                Change Conversation Status
                            </h3>
                            <div className="space-y-2">
                                {statuses.map((status) => (
                                    <label key={status.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            name="status"
                                            value={status.value}
                                            checked={selectedStatus === status.value}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-3 text-sm font-medium text-gray-900">{status.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                            >
                                {saving && (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                )}
                                Save
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default function MessagesIndex({ conversations = [], auth }) {
    const [conversationList, setConversationList] = useState(conversations);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showMobileConversation, setShowMobileConversation] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [savingStatus, setSavingStatus] = useState(false);

    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    // Format time helper
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        }

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };

    // Load conversation messages
    const loadConversation = async (conversation) => {
        setSelectedConversation(conversation);
        setShowMobileConversation(true);
        setMessagesLoading(true);

        try {
            const response = await axios.get(`/messages/conversation/${conversation.user.id}`);
            setMessages(response.data.messages || []);

            // Mark conversation as read
            if (conversation.unread_count > 0) {
                await axios.patch(`/messages/conversation/${conversation.user.id}/read`);
                setConversationList(prev =>
                    prev.map(conv =>
                        conv.user.id === conversation.user.id
                            ? { ...conv, unread_count: 0 }
                            : conv
                    )
                );
            }
        } catch (error) {
            console.error('Error loading conversation:', error);
        } finally {
            setMessagesLoading(false);
        }
    };

    // Scroll to bottom of messages
    const scrollToBottom = (smooth = true) => {
        if (messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            container.scrollTop = container.scrollHeight;
        } else if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
        }
    };

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => scrollToBottom(true), 100);
        }
    }, [messages]);

    // Auto-scroll when conversation is first loaded
    useEffect(() => {
        if (selectedConversation && messages.length > 0) {
            setTimeout(() => scrollToBottom(false), 50);
        }
    }, [selectedConversation]);

    // Send message
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation || sending) return;

        setSending(true);
        const messageText = newMessage;
        setNewMessage('');

        try {
            const response = await axios.post('/messages', {
                receiver_id: selectedConversation.user.id,
                message: messageText
            });

            if (response.data.success) {
                setMessages(prev => [...prev, response.data.message]);

                // Update conversation list with new last message
                setConversationList(prev =>
                    prev.map(conv =>
                        conv.user.id === selectedConversation.user.id
                            ? {
                                ...conv,
                                last_message: response.data.message.message,
                                last_activity: response.data.message.created_at
                            }
                            : conv
                    )
                );

                // Scroll to bottom after sending message
                setTimeout(() => scrollToBottom(true), 100);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setNewMessage(messageText); // Restore message on error
            alert('Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    // Handle status change
    const handleStatusChange = async (newStatus) => {
        if (!selectedConversation) return;

        setSavingStatus(true);
        try {
            await axios.patch(`/messages/conversation/${selectedConversation.user.id}/status`, {
                status: newStatus
            });

            setSelectedConversation(prev => ({ ...prev, status: newStatus }));
            setConversationList(prev =>
                prev.map(conv =>
                    conv.user.id === selectedConversation.user.id
                        ? { ...conv, status: newStatus }
                        : conv
                )
            );
            setShowStatusModal(false);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status. Please try again.');
        } finally {
            setSavingStatus(false);
        }
    };

    // Handle URL parameters for opening specific conversations
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('user');
        if (userId && conversationList.length > 0) {
            const conversation = conversationList.find(conv => conv.user.id == userId);
            if (conversation) {
                loadConversation(conversation);
            }
        }
    }, [conversationList]);

    // Poll for new messages
    useEffect(() => {
        const interval = setInterval(async () => {
            if (selectedConversation) {
                try {
                    const response = await axios.get(`/messages/${selectedConversation.user.id}/new`);
                    if (response.data.messages && response.data.messages.length > 0) {
                        setMessages(prev => [...prev, ...response.data.messages]);
                    }
                } catch (error) {
                    console.error('Error polling for new messages:', error);
                }
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [selectedConversation]);

    // Filter conversations
    const filteredConversations = conversationList.filter(conv => {
        const matchesSearch = searchQuery === '' ||
            `${conv.user.first_name} ${conv.user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Messages</h2>
                </div>
            }
        >
            <Head title="Messages" />

            <div className="h-screen flex flex-col">
                {/* Main Container - Fixed Height */}
                <div className="flex-1 flex overflow-hidden">
                    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col h-full py-6">
                        <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg flex-1 flex flex-col">
                            <div className="flex h-full">
                                {/* Left Column - Inbox List */}
                                <div className={`${showMobileConversation ? 'hidden' : 'flex'} lg:flex w-full lg:w-1/3 border-r border-gray-200 flex-col`}>
                                    {/* Search and Filter Header - Fixed */}
                                    <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50 shadow-xl">
                                        <div className="space-y-3">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Search conversations..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            </div>
                                            <select
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="all">All Statuses</option>
                                                <option value="new_lead">New Lead</option>
                                                <option value="contacted">Contacted</option>
                                                <option value="qualified">Qualified</option>
                                                <option value="proposal_sent">Proposal Sent</option>
                                                <option value="negotiating">Negotiating</option>
                                                <option value="closed_won">Closed Won</option>
                                                <option value="closed_lost">Closed Lost</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Conversations List - Scrollable */}
                                    <div className="flex-1 overflow-y-auto">
                                        {filteredConversations.length === 0 ? (
                                            <div className="p-6 text-center text-gray-500">
                                                <div className="text-4xl mb-2">💬</div>
                                                <p className="text-sm">No conversations found</p>
                                            </div>
                                        ) : (
                                            filteredConversations.map((conversation) => (
                                                <div
                                                    key={conversation.user.id}
                                                    onClick={() => loadConversation(conversation)}
                                                    className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                                                        selectedConversation?.user.id === conversation.user.id ? 'bg-blue-50' : ''
                                                    }`}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className="relative">
                                                            <UserAvatar user={conversation.user} />
                                                            {conversation.unread_count > 0 && (
                                                                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                                    {conversation.unread_count}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <h3 className="text-sm font-semibold text-gray-900 truncate">
                                                                    {conversation.user.first_name} {conversation.user.last_name}
                                                                </h3>
                                                                <span className="text-xs text-gray-500">
                                                                    {formatTime(conversation.last_activity)}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-sm text-gray-600 truncate">
                                                                    {conversation.last_message ?
                                                                        (conversation.last_message.length > 50 ?
                                                                            conversation.last_message.substring(0, 50) + '...' :
                                                                            conversation.last_message
                                                                        ) :
                                                                        'No messages yet'
                                                                    }
                                                                </p>
                                                                <StatusBadge status={conversation.status || 'new_lead'} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Right Column - Conversation View */}
                                <div className={`${showMobileConversation ? 'flex' : 'hidden'} lg:flex flex-1 flex-col`}>
                                    {selectedConversation ? (
                                        <>
                                            {/* Conversation Header - Fixed */}
                                            <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white shadow-xl">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <button
                                                            onClick={() => setShowMobileConversation(false)}
                                                            className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                            </svg>
                                                        </button>
                                                        <UserAvatar user={selectedConversation.user} size="w-10 h-10" />
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900">
                                                                {selectedConversation.user.first_name} {selectedConversation.user.last_name}
                                                            </h3>
                                                            <StatusBadge status={selectedConversation.status || 'new_lead'} />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => setShowStatusModal(true)}
                                                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                                        >
                                                            Change Status
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Messages Area - Scrollable */}
                                            <div
                                                ref={messagesContainerRef}
                                                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
                                            >
                                                {messagesLoading ? (
                                                    <div className="space-y-4">
                                                        <LoadingSpinner />
                                                        {[...Array(3)].map((_, i) => (
                                                            <MessageSkeleton key={i} />
                                                        ))}
                                                    </div>
                                                ) : messages.length === 0 ? (
                                                    <div className="text-center py-8">
                                                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                            </svg>
                                                        </div>
                                                        <p className="text-gray-500">No messages yet. Start the conversation!</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {messages.map((message) => {
                                                            const isOwnMessage = message.sender_id === auth.user.id;
                                                            return (
                                                                <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                                                                    <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                                                        {!isOwnMessage && <UserAvatar user={selectedConversation.user} size="w-8 h-8" />}
                                                                        <div className="flex flex-col">
                                                                            <div className={`px-4 py-2 rounded-lg ${
                                                                                isOwnMessage
                                                                                    ? 'bg-blue-600 text-white rounded-br-none'
                                                                                    : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                                                                            }`}>
                                                                                <p className="text-sm">{message.message}</p>
                                                                            </div>
                                                                            <p className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                                                                                {formatTime(message.created_at)}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                        <div ref={messagesEndRef} className="h-1" />
                                                    </>
                                                )}
                                            </div>

                                            {/* Message Input - Fixed */}
                                            <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white shadow-xl">
                                                <form onSubmit={sendMessage} className="flex space-x-2">
                                                    <textarea
                                                        value={newMessage}
                                                        onChange={(e) => setNewMessage(e.target.value)}
                                                        placeholder="Type your message..."
                                                        rows={1}
                                                        className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 max-h-32 overflow-y-auto"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                e.preventDefault();
                                                                sendMessage(e);
                                                            }
                                                        }}
                                                        onInput={(e) => {
                                                            e.target.style.height = 'auto';
                                                            e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                                                        }}
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={!newMessage.trim() || sending}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-end"
                                                    >
                                                        {sending ? (
                                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        ) : (
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </form>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center bg-gray-50">
                                            <div className="text-center">
                                                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    </svg>
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                                                <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Change Modal */}
            <StatusChangeModal
                isOpen={showStatusModal}
                onClose={() => setShowStatusModal(false)}
                currentStatus={selectedConversation?.status || 'new_lead'}
                onStatusChange={handleStatusChange}
                saving={savingStatus}
            />
        </AuthenticatedLayout>
    );
}
