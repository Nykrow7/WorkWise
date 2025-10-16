import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Configure CSRF token for axios requests
const token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
    console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}

// Enhanced route helper with current() functionality
window.route = function(name, params = {}) {
    const routes = {
        'dashboard': '/dashboard',
        'jobs.index': '/jobs',
        'jobs.create': '/jobs/create',
        'jobs.store': '/jobs',
        'jobs.show': (id) => `/jobs/${id}`,
        'jobs.edit': (id) => `/jobs/${id}/edit`,
        'jobs.update': (id) => `/jobs/${id}`,
        'jobs.destroy': (id) => `/jobs/${id}`,
        'profile.edit': '/profile',
        'profile.update': '/profile',
        'bids.index': '/bids',
        'bids.store': '/bids',
        'bids.update': (id) => `/bids/${id}`,
        'bids.destroy': (id) => `/bids/${id}`,
        'projects.index': '/projects',
        'projects.show': (id) => `/projects/${id}`,
        'messages.index': '/messages',
        'messages.conversation': (user) => `/messages/${user}`,
        'ai.recommendations': '/ai/recommendations',
        'ai.job.suggestions': '/ai/job-suggestions',
        'ai.insights': '/ai/insights',
        'payment.history': '/payment/history',
        'reports.index': '/reports',
        'reports.create': '/reports/create',
        'deposits.index': '/deposits',
        'client.wallet': '/client/wallet',
        'freelancer.wallet': '/freelancer/wallet',
        'contracts.index': '/contracts',
        'contracts.show': (id) => `/contracts/${id}`,
        'contracts.sign': (id) => `/contracts/${id}/sign`,
        'contracts.processSignature': (id) => `/contracts/${id}/signature`,
        'contracts.downloadPdf': (id) => `/contracts/${id}/pdf`,
        'browse.freelancers': '/browse-freelancers',
        'login': '/login',
        'logout': '/logout',
        'register': '/register',
        'role.selection': '/join',
        'role.store': '/join'
    };

    if (typeof routes[name] === 'function') {
        return routes[name](params);
    }

    return routes[name] || '#';
};

// Add current() method to route helper
window.route.current = function(pattern) {
    const currentPath = window.location.pathname;

    if (!pattern) {
        return currentPath;
    }

    // Handle wildcard patterns like 'jobs.*'
    if (pattern.includes('*')) {
        const basePattern = pattern.replace('.*', '');
        const routeMap = {
            'dashboard': '/dashboard',
            'jobs': '/jobs',
            'bids': '/bids',
            'projects': '/projects',
            'messages': '/messages',
            'ai': ['/ai/recommendations', '/ai/job-suggestions', '/ai/insights'],
            'payment': '/payment',
            'reports': '/reports',
            'profile': '/profile',
            'deposits': '/deposits',
            'contracts': '/contracts'
        };

        const paths = routeMap[basePattern];
        if (Array.isArray(paths)) {
            return paths.some(path => currentPath.startsWith(path));
        }
        return currentPath.startsWith(paths);
    }

    // Handle exact matches
    const routeMap = {
        'dashboard': '/dashboard',
        'jobs.index': '/jobs',
        'jobs.create': '/jobs/create',
        'profile.edit': '/profile',
        'bids.index': '/bids',
        'projects.index': '/projects',
        'messages.index': '/messages',
        'ai.recommendations': '/ai/recommendations',
        'payment.history': '/payment/history',
        'reports.index': '/reports',
        'deposits.index': '/deposits',
        'contracts.index': '/contracts'
    };

    return currentPath === routeMap[pattern];
};
