<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Support\Facades\Log;

class GoogleOAuthException extends Exception
{
    protected $context;
    
    public function __construct(string $message = "", array $context = [], int $code = 0, Exception $previous = null)
    {
        parent::__construct($message, $code, $previous);
        $this->context = $context;
    }
    
    /**
     * Report the exception
     */
    public function report(): void
    {
        Log::error('Google OAuth Exception: ' . $this->getMessage(), array_merge([
            'exception' => get_class($this),
            'file' => $this->getFile(),
            'line' => $this->getLine(),
            'trace' => $this->getTraceAsString()
        ], $this->context));
    }
    
    /**
     * Render the exception as an HTTP response
     */
    public function render($request)
    {
        if ($request->expectsJson()) {
            return response()->json([
                'error' => 'Authentication failed',
                'message' => 'Google OAuth authentication encountered an error'
            ], 422);
        }
        
        return redirect()->route('login')
            ->with('error', 'Authentication failed. Please try again.');
    }
    
    /**
     * Get the exception context
     */
    public function getContext(): array
    {
        return $this->context;
    }
}