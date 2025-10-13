<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class GoogleOAuthSecurityMiddleware
{
    /**
     * Handle an incoming request for Google OAuth endpoints
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Rate limiting for OAuth attempts
        $key = 'google-oauth:' . $request->ip();
        
        if (RateLimiter::tooManyAttempts($key, 10)) {
            Log::warning('Google OAuth rate limit exceeded', [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'url' => $request->fullUrl()
            ]);
            
            return redirect()->route('login')
                ->with('error', 'Too many authentication attempts. Please try again later.');
        }
        
        RateLimiter::hit($key, 300); // 5 minutes
        
        // Log OAuth attempts for security monitoring
        Log::info('Google OAuth attempt', [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'url' => $request->fullUrl(),
            'referer' => $request->header('referer')
        ]);
        
        // Validate referer for additional security
        $referer = $request->header('referer');
        $allowedDomains = [
            config('app.url'),
            'https://accounts.google.com'
        ];
        
        if ($referer && !$this->isValidReferer($referer, $allowedDomains)) {
            Log::warning('Invalid referer for Google OAuth', [
                'referer' => $referer,
                'ip' => $request->ip()
            ]);
        }
        
        return $next($request);
    }
    
    /**
     * Check if referer is from allowed domains
     */
    private function isValidReferer(string $referer, array $allowedDomains): bool
    {
        foreach ($allowedDomains as $domain) {
            if (str_starts_with($referer, $domain)) {
                return true;
            }
        }
        return false;
    }
}