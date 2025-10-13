<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Exceptions\GoogleOAuthException;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * Redirect to Google OAuth provider
     */
    public function redirectToGoogle(Request $request)
    {
        try {
            // Validate and store the action in session for security
            $action = $request->query('action', 'login');
            if (!in_array($action, ['login', 'register'])) {
                return redirect()->route('login')->with('error', 'Invalid authentication action.');
            }

            // Store action and intended URL in session
            session([
                'google_auth_action' => $action,
                'google_auth_intended' => $request->query('intended', '/dashboard'),
                'google_auth_state' => Str::random(40)
            ]);

            // Add state parameter for additional security and force account selection
            return Socialite::driver('google')
                ->stateless()
                ->with([
                    'state' => session('google_auth_state'),
                    'prompt' => 'select_account',  // Forces account selection popup
                    'access_type' => 'online'      // We don't need offline access
                ])
                ->redirect();
        } catch (\Exception $e) {
            throw new GoogleOAuthException(
                'Google OAuth redirect failed: ' . $e->getMessage(),
                [
                    'user_ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'action' => $action ?? 'unknown'
                ]
            );
        }
    }

    /**
     * Handle Google OAuth callback
     */
    public function handleGoogleCallback(Request $request)
    {
        try {
            // Verify state parameter for security
            $sessionState = session('google_auth_state');
            $requestState = $request->query('state');
            
            if (!$sessionState || $sessionState !== $requestState) {
                Log::warning('Google OAuth state mismatch', [
                    'session_state' => $sessionState,
                    'request_state' => $requestState,
                    'user_ip' => $request->ip()
                ]);
                return redirect()->route('login')->with('error', 'Authentication failed. Please try again.');
            }

            // Get user from Google
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            if (!$googleUser || !$googleUser->email) {
                Log::error('Invalid Google user data received', [
                    'user_ip' => $request->ip()
                ]);
                return redirect()->route('login')->with('error', 'Unable to retrieve user information from Google.');
            }

            // Get the intended action from session
            $action = session('google_auth_action', 'login');
            $intendedUrl = session('google_auth_intended', '/dashboard');
            
            // Clear session data
            session()->forget(['google_auth_action', 'google_auth_intended', 'google_auth_state']);

            // Handle based on action
            if ($action === 'register') {
                return $this->handleRegistration($googleUser, $intendedUrl);
            } else {
                return $this->handleLogin($googleUser, $intendedUrl);
            }

        } catch (\Exception $e) {
            Log::error('Google OAuth callback failed', [
                'error' => $e->getMessage(),
                'user_ip' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);
            
            // Clear session data on error
            session()->forget(['google_auth_action', 'google_auth_intended', 'google_auth_state']);
            
            return redirect()->route('login')->with('error', 'Authentication failed. Please try again.');
        }
    }

    /**
     * Handle user registration via Google OAuth
     */
    private function handleRegistration($googleUser, $intendedUrl = '/dashboard')
    {
        try {
            // Check if user already exists with this email
            $existingUser = User::where('email', $googleUser->getEmail())->first();
            
            if ($existingUser) {
                // If user exists but doesn't have Google ID, link the account
                if (!$existingUser->google_id) {
                    $existingUser->update([
                        'google_id' => $googleUser->getId(),
                        'name' => $googleUser->getName(),
                        'avatar' => $googleUser->getAvatar()
                    ]);
                    
                    Log::info('Google account linked to existing user', [
                        'user_id' => $existingUser->id,
                        'email' => $existingUser->email
                    ]);
                }
                
                // Log the user in
                Auth::login($existingUser, true);
                
                return redirect()->intended($intendedUrl)->with('success', 'Welcome back! Your Google account has been linked.');
            }
            
            // Create new user
            $user = User::create([
                'name' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
                'email_verified_at' => now(),
                'user_type' => 'gig_worker', // Default type, can be changed later
            ]);
            
            Log::info('New user registered via Google OAuth', [
                'user_id' => $user->id,
                'email' => $user->email,
                'google_id' => $user->google_id
            ]);
            
            // Log the user in
            Auth::login($user, true);
            
            return redirect()->intended($intendedUrl)->with('success', 'Account created successfully! Welcome to WorkWise.');
            
        } catch (\Exception $e) {
            Log::error('Google OAuth registration failed', [
                'error' => $e->getMessage(),
                'google_email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId()
            ]);
            
            return redirect()->route('register')->with('error', 'Registration failed. Please try again.');
        }
    }

    /**
     * Handle user login via Google OAuth
     */
    private function handleLogin($googleUser, $intendedUrl = '/dashboard')
    {
        try {
            // Find user by Google ID first
            $user = User::where('google_id', $googleUser->getId())->first();
            
            // If not found by Google ID, try by email
            if (!$user) {
                $user = User::where('email', $googleUser->getEmail())->first();
                
                if ($user) {
                    // Link Google account to existing user
                    $user->update([
                        'google_id' => $googleUser->getId(),
                        'name' => $googleUser->getName(),
                        'avatar' => $googleUser->getAvatar()
                    ]);
                    
                    Log::info('Google account linked during login', [
                        'user_id' => $user->id,
                        'email' => $user->email
                    ]);
                }
            }
            
            if (!$user) {
                Log::warning('Google OAuth login attempt for non-existent user', [
                    'google_email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId()
                ]);
                
                return redirect()->route('register')
                    ->with('error', 'No account found. Please register first.')
                    ->with('google_email', $googleUser->getEmail());
            }
            
            // Update user's Google profile data
            $user->update([
                'name' => $googleUser->getName(),
                'avatar' => $googleUser->getAvatar(),
                'last_login_at' => now()
            ]);
            
            Log::info('User logged in via Google OAuth', [
                'user_id' => $user->id,
                'email' => $user->email
            ]);
            
            // Log the user in with remember me
            Auth::login($user, true);
            
            return redirect()->intended($intendedUrl)->with('success', 'Welcome back!');
            
        } catch (\Exception $e) {
            Log::error('Google OAuth login failed', [
                'error' => $e->getMessage(),
                'google_email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId()
            ]);
            
            return redirect()->route('login')->with('error', 'Login failed. Please try again.');
        }
    }

    /**
     * Unlink Google account from user
     */
    public function unlinkGoogle(Request $request)
    {
        try {
            $user = Auth::user();
            
            if (!$user || !$user->google_id) {
                return redirect()->back()->with('error', 'No Google account is linked to your profile.');
            }
            
            // Ensure user has a password before unlinking Google
            if (!$user->password) {
                return redirect()->back()->with('error', 'Please set a password before unlinking your Google account.');
            }
            
            $user->update([
                'google_id' => null,
                'avatar' => null
            ]);
            
            Log::info('Google account unlinked', [
                'user_id' => $user->id,
                'email' => $user->email
            ]);
            
            return redirect()->back()->with('success', 'Google account has been unlinked successfully.');
            
        } catch (\Exception $e) {
            Log::error('Google account unlink failed', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);
            
            return redirect()->back()->with('error', 'Failed to unlink Google account. Please try again.');
        }
    }
}