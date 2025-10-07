import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function StartConversationModal({ isOpen, onClose, users = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        receiver_id: '',
        message: '',
    });

    const filteredUsers = users.filter(user =>
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.professional_title && user.professional_title.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setData('receiver_id', user.id);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        post('/messages', {
            onSuccess: () => {
                reset();
                setSelectedUser(null);
                setSearchTerm('');
                onClose();
                // Redirect to the conversation
                window.location.href = `/messages/${selectedUser.id}`;
            },
        });
    };

    const handleClose = () => {
        reset();
        setSelectedUser(null);
        setSearchTerm('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-100">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-white">
                                    Start New Conversation
                                </h3>
                            </div>
                            <button
                                onClick={handleClose}
                                className="text-white/80 hover:text-white transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="bg-white px-6 py-6">
                        <div className="w-full">

                                {!selectedUser ? (
                                    <div>
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Search for someone to message
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                    </svg>
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Search by name or title..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                />
                                            </div>
                                        </div>

                                        <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                            {filteredUsers.length === 0 ? (
                                                <div className="text-center py-12">
                                                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-gray-500 font-medium">
                                                        {searchTerm ? 'No users found' : 'No users available'}
                                                    </p>
                                                    <p className="text-sm text-gray-400 mt-1">
                                                        {searchTerm ? 'Try adjusting your search terms' : 'Check back later for available users'}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {filteredUsers.map((user) => (
                                                        <button
                                                            key={user.id}
                                                            onClick={() => handleUserSelect(user)}
                                                            className="w-full text-left p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group"
                                                        >
                                                            <div className="flex items-center space-x-4">
                                                                <div className="flex-shrink-0">
                                                                    {user.profile_photo ? (
                                                                        <img
                                                                            src={`/storage/${user.profile_photo}`}
                                                                            alt={`${user.first_name} ${user.last_name}`}
                                                                            className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                                                                        />
                                                                    ) : (
                                                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                                                                            {user.first_name[0]}{user.last_name[0]}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-base font-semibold text-gray-900 truncate group-hover:text-blue-900 transition-colors">
                                                                        {user.first_name} {user.last_name}
                                                                    </p>
                                                                    <p className="text-sm text-gray-600 truncate group-hover:text-blue-700 transition-colors">
                                                                        {user.professional_title || user.user_type}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                                        user.user_type === 'employer'
                                                                            ? 'bg-blue-100 text-blue-800 group-hover:bg-blue-200'
                                                                            : 'bg-emerald-100 text-emerald-800 group-hover:bg-emerald-200'
                                                                    } transition-colors`}>
                                                                        {user.user_type === 'employer' ? 'Employer' : 'Gig Worker'}
                                                                    </span>
                                                                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    {selectedUser.profile_photo ? (
                                                        <img
                                                            src={`/storage/${selectedUser.profile_photo}`}
                                                            alt={`${selectedUser.first_name} ${selectedUser.last_name}`}
                                                            className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                                                        />
                                                    ) : (
                                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                                                            {selectedUser.first_name[0]}{selectedUser.last_name[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-base font-semibold text-gray-900">
                                                        {selectedUser.first_name} {selectedUser.last_name}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {selectedUser.professional_title || selectedUser.user_type}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedUser(null)}
                                                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-white/50"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                Your Message
                                            </label>
                                            <textarea
                                                value={data.message}
                                                onChange={(e) => setData('message', e.target.value)}
                                                rows={5}
                                                className="w-full border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                                                placeholder="Type your message here..."
                                                required
                                            />
                                            {errors.message && (
                                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {errors.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                onClick={handleClose}
                                                className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 border border-transparent rounded-xl text-sm font-semibold text-white hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 disabled:transform-none shadow-lg"
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
                                                        Send Message
                                                    </div>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
