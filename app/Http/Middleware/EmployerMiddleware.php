<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EmployerMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check() || auth()->user()->user_type !== 'employer') {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'Only employers can access this functionality.'], 403);
            }
            return redirect()->route('dashboard')->with('error', 'Only employers can access this functionality.');
        }

        return $next($request);
    }
}