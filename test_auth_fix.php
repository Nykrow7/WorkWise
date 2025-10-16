<?php

require_once 'vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔐 Testing AI Endpoint Authentication...\n\n";

// 1. Test route definitions
echo "1. Checking route definitions...\n";
$output = shell_exec('php artisan route:list --path=ai 2>&1');
echo "   Routes found:\n";
echo "   " . str_replace("\n", "\n   ", trim($output)) . "\n\n";

// 2. Test different endpoint URLs
echo "2. Testing endpoint accessibility...\n";

$endpoints = [
    'Web route' => 'http://localhost:8000/ai/recommendations',
    'API route (auth)' => 'http://localhost:8000/api/gig-worker/ai-recommendations',
    'API route (public)' => 'http://localhost:8000/api/gig-worker/ai-recommendations',
    'Test connection' => 'http://localhost:8000/api/ai/test-connection'
];

foreach ($endpoints as $name => $url) {
    echo "   Testing {$name}: {$url}\n";
    
    try {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Accept: application/json',
            'Content-Type: application/json',
            'X-Requested-With: XMLHttpRequest'
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        echo "      Status: {$httpCode}\n";
        
        if ($httpCode === 200) {
            echo "      ✅ Success\n";
        } elseif ($httpCode === 401) {
            echo "      🔒 Authentication required\n";
        } elseif ($httpCode === 404) {
            echo "      ❌ Not found\n";
        } else {
            echo "      ⚠️  Other status\n";
        }
        
        // Show response preview
        if ($response && strlen($response) < 200) {
            echo "      Response: " . trim($response) . "\n";
        }
        
    } catch (Exception $e) {
        echo "      ❌ Error: " . $e->getMessage() . "\n";
    }
    
    echo "\n";
}

// 3. Test with session authentication
echo "3. Testing with session authentication...\n";

try {
    // Find a gig worker user
    $gigWorker = User::where('user_type', 'gig_worker')->first();
    
    if ($gigWorker) {
        echo "   Found gig worker: {$gigWorker->name} (ID: {$gigWorker->id})\n";
        
        // Simulate login
        Auth::login($gigWorker);
        
        if (Auth::check()) {
            echo "   ✅ User authenticated in session\n";
            echo "   User type: " . Auth::user()->user_type . "\n";
            
            // Test the controller directly
            $controller = new \App\Http\Controllers\AIRecommendationController(
                new \App\Services\AIJobMatchingService(new \App\Services\AIService()),
                new \App\Services\AIEmbeddingService()
            );
            
            // Create a mock request
            $request = new \Illuminate\Http\Request();
            $request->setUserResolver(function () use ($gigWorker) {
                return $gigWorker;
            });
            
            echo "   Testing controller method directly...\n";
            $response = $controller->getJobRecommendations($request);
            echo "   Controller response status: " . $response->getStatusCode() . "\n";
            
            $responseData = json_decode($response->getContent(), true);
            if (isset($responseData['recommendations'])) {
                echo "   ✅ Recommendations returned: " . count($responseData['recommendations']) . " items\n";
            } elseif (isset($responseData['error'])) {
                echo "   ❌ Error: " . $responseData['error'] . "\n";
            }
            
        } else {
            echo "   ❌ Failed to authenticate user\n";
        }
        
    } else {
        echo "   ❌ No gig worker found in database\n";
    }
    
} catch (Exception $e) {
    echo "   ❌ Error testing authentication: " . $e->getMessage() . "\n";
}

// 4. Check middleware configuration
echo "\n4. Checking middleware configuration...\n";

try {
    $middlewareGroups = config('app.middleware_groups', []);
    echo "   Web middleware: " . (isset($middlewareGroups['web']) ? 'Configured' : 'Not found') . "\n";
    echo "   API middleware: " . (isset($middlewareGroups['api']) ? 'Configured' : 'Not found') . "\n";
    
    // Check if sanctum is configured
    $sanctumConfig = config('sanctum');
    echo "   Sanctum configured: " . ($sanctumConfig ? 'Yes' : 'No') . "\n";
    
} catch (Exception $e) {
    echo "   ❌ Error checking middleware: " . $e->getMessage() . "\n";
}

echo "\n🎯 Authentication Test Completed!\n";
echo "📋 Summary:\n";
echo "   - Route definitions: Checked\n";
echo "   - Endpoint accessibility: Tested\n";
echo "   - Session authentication: Tested\n";
echo "   - Middleware configuration: Checked\n";

echo "\n💡 Recommendations:\n";
echo "   1. Use web routes with session auth for frontend\n";
echo "   2. Ensure CSRF tokens are included in requests\n";
echo "   3. Check that users are properly authenticated\n";
echo "   4. Consider adding API token authentication for API routes\n";