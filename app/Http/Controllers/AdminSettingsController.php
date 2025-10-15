<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class AdminSettingsController extends Controller
{
    /**
     * Display admin settings
     */
    public function index(): Response
    {
        $settings = [
            'platform' => [
                'name' => 'WorkWise',
                'description' => 'Freelance Platform',
                'version' => '1.0.0',
                'maintenance_mode' => false,
                'registration_enabled' => true,
                'email_verification_required' => true,
            ],

            'fees' => [
                'platform_fee_percentage' => 5.0,
                'minimum_project_amount' => 50,
                'maximum_project_amount' => 50000,
                'withdrawal_minimum' => 100,
                'withdrawal_fee' => 2.5,
            ],

            'limits' => [
                'max_active_projects_per_employer' => 10,
                'max_active_projects_per_gig_worker' => 5,
                'max_bids_per_gig_worker_per_day' => 20,
                'max_reports_per_user_per_day' => 5,
                'max_messages_per_conversation' => 1000,
            ],

            'notifications' => [
                'email_notifications_enabled' => true,
                'push_notifications_enabled' => true,
                'admin_email' => 'admin@workwise.com',
                'support_email' => 'support@workwise.com',
            ],

            'security' => [
                'require_strong_passwords' => true,
                'session_timeout_minutes' => 120,
                'max_login_attempts' => 5,
                'lockout_duration_minutes' => 15,
                'two_factor_required' => false,
            ],
        ];

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update platform settings
     */
    public function updatePlatform(Request $request)
    {
        $request->validate([
            'platform.name' => 'required|string|max:255',
            'platform.description' => 'required|string|max:500',
            'platform.maintenance_mode' => 'boolean',
            'platform.registration_enabled' => 'boolean',
            'platform.email_verification_required' => 'boolean',
        ]);

        // In a real application, these would be saved to database or config files
        // For now, we'll just cache them
        Cache::put('platform_settings', $request->input('platform'), 3600);

        return back()->with('success', 'Platform settings updated successfully.');
    }

    /**
     * Update fee settings
     */
    public function updateFees(Request $request)
    {
        $request->validate([
            'fees.platform_fee_percentage' => 'required|numeric|min:0|max:50',
            'fees.minimum_project_amount' => 'required|numeric|min:1',
            'fees.maximum_project_amount' => 'required|numeric|min:100',
            'fees.withdrawal_minimum' => 'required|numeric|min:10',
            'fees.withdrawal_fee' => 'required|numeric|min:0|max:10',
        ]);

        Cache::put('fee_settings', $request->input('fees'), 3600);

        return back()->with('success', 'Fee settings updated successfully.');
    }

    /**
     * Update system limits
     */
    public function updateLimits(Request $request)
    {
        $request->validate([
            'limits.max_active_projects_per_employer' => 'required|integer|min:1|max:100',
            'limits.max_active_projects_per_gig_worker' => 'required|integer|min:1|max:50',
            'limits.max_bids_per_gig_worker_per_day' => 'required|integer|min:1|max:100',
            'limits.max_reports_per_user_per_day' => 'required|integer|min:1|max:20',
            'limits.max_messages_per_conversation' => 'required|integer|min:100|max:5000',
        ]);

        Cache::put('system_limits', $request->input('limits'), 3600);

        return back()->with('success', 'System limits updated successfully.');
    }

    /**
     * Update notification settings
     */
    public function updateNotifications(Request $request)
    {
        $request->validate([
            'notifications.email_notifications_enabled' => 'boolean',
            'notifications.push_notifications_enabled' => 'boolean',
            'notifications.admin_email' => 'required|email|max:255',
            'notifications.support_email' => 'required|email|max:255',
        ]);

        Cache::put('notification_settings', $request->input('notifications'), 3600);

        return back()->with('success', 'Notification settings updated successfully.');
    }

    /**
     * Update security settings
     */
    public function updateSecurity(Request $request)
    {
        $request->validate([
            'security.require_strong_passwords' => 'boolean',
            'security.session_timeout_minutes' => 'required|integer|min:30|max:1440',
            'security.max_login_attempts' => 'required|integer|min:3|max:10',
            'security.lockout_duration_minutes' => 'required|integer|min:5|max:60',
            'security.two_factor_required' => 'boolean',
        ]);

        Cache::put('security_settings', $request->input('security'), 3600);

        return back()->with('success', 'Security settings updated successfully.');
    }

    /**
     * Clear system cache
     */
    public function clearCache()
    {
        Cache::flush();

        return back()->with('success', 'System cache cleared successfully.');
    }

    /**
     * Export system settings
     */
    public function exportSettings()
    {
        $settings = [
            'platform' => Cache::get('platform_settings', [
                'name' => 'WorkWise',
                'description' => 'Freelance Platform',
                'version' => '1.0.0',
                'maintenance_mode' => false,
                'registration_enabled' => true,
                'email_verification_required' => true,
            ]),
            'fees' => Cache::get('fee_settings', [
                'platform_fee_percentage' => 5.0,
                'minimum_project_amount' => 50,
                'maximum_project_amount' => 50000,
                'withdrawal_minimum' => 100,
                'withdrawal_fee' => 2.5,
            ]),
            'limits' => Cache::get('system_limits', [
                'max_active_projects_per_employer' => 10,
                'max_active_projects_per_gig_worker' => 5,
                'max_bids_per_gig_worker_per_day' => 20,
                'max_reports_per_user_per_day' => 5,
                'max_messages_per_conversation' => 1000,
            ]),
            'notifications' => Cache::get('notification_settings', [
                'email_notifications_enabled' => true,
                'push_notifications_enabled' => true,
                'admin_email' => 'admin@workwise.com',
                'support_email' => 'support@workwise.com',
            ]),
            'security' => Cache::get('security_settings', [
                'require_strong_passwords' => true,
                'session_timeout_minutes' => 120,
                'max_login_attempts' => 5,
                'lockout_duration_minutes' => 15,
                'two_factor_required' => false,
            ]),
        ];

        return response()->json($settings, 200, [
            'Content-Disposition' => 'attachment; filename="admin_settings_' . now()->format('Y-m-d_H-i-s') . '.json"',
        ]);
    }

    /**
     * Import system settings
     */
    public function importSettings(Request $request)
    {
        $request->validate([
            'settings' => 'required|file|mimes:json',
        ]);

        $settings = json_decode(file_get_contents($request->file('settings')->getPathname()), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return back()->with('error', 'Invalid JSON file provided.');
        }

        // Validate the structure
        $requiredKeys = ['platform', 'fees', 'limits', 'notifications', 'security'];
        foreach ($requiredKeys as $key) {
            if (!isset($settings[$key])) {
                return back()->with('error', "Missing required settings section: {$key}");
            }
        }

        // Store each settings section
        foreach ($settings as $key => $value) {
            Cache::put($key . '_settings', $value, 3600);
        }

        return back()->with('success', 'Settings imported successfully.');
    }

    /**
     * Get system health status
     */
    public function systemHealth()
    {
        $health = [
            'database' => $this->checkDatabaseConnection(),
            'cache' => $this->checkCacheConnection(),
            'storage' => $this->checkStoragePermissions(),
            'php_extensions' => $this->checkPhpExtensions(),
            'server_info' => [
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
                'memory_limit' => ini_get('memory_limit'),
                'max_execution_time' => ini_get('max_execution_time'),
            ],
        ];

        return Inertia::render('Admin/Settings/SystemHealth', [
            'health' => $health,
        ]);
    }

    /**
     * Check database connection
     */
    private function checkDatabaseConnection()
    {
        try {
            \DB::connection()->getPdo();
            return ['status' => 'healthy', 'message' => 'Database connection successful'];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => 'Database connection failed: ' . $e->getMessage()];
        }
    }

    /**
     * Check cache connection
     */
    private function checkCacheConnection()
    {
        try {
            Cache::put('health_check', 'test', 1);
            Cache::get('health_check');
            Cache::forget('health_check');
            return ['status' => 'healthy', 'message' => 'Cache connection successful'];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => 'Cache connection failed: ' . $e->getMessage()];
        }
    }

    /**
     * Check storage permissions
     */
    private function checkStoragePermissions()
    {
        $storagePath = storage_path();
        $testFile = $storagePath . '/test_write.txt';

        try {
            file_put_contents($testFile, 'test');
            unlink($testFile);
            return ['status' => 'healthy', 'message' => 'Storage permissions OK'];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => 'Storage permission error: ' . $e->getMessage()];
        }
    }

    /**
     * Check PHP extensions
     */
    private function checkPhpExtensions()
    {
        $requiredExtensions = ['pdo', 'mbstring', 'openssl', 'tokenizer', 'xml', 'ctype', 'json', 'bcmath'];
        $missingExtensions = [];

        foreach ($requiredExtensions as $extension) {
            if (!extension_loaded($extension)) {
                $missingExtensions[] = $extension;
            }
        }

        if (empty($missingExtensions)) {
            return ['status' => 'healthy', 'message' => 'All required PHP extensions loaded'];
        } else {
            return ['status' => 'warning', 'message' => 'Missing extensions: ' . implode(', ', $missingExtensions)];
        }
    }
}
