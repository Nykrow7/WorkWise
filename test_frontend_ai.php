<?php

require_once 'vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Http;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🎨 Testing Frontend AI Integration...\n\n";

// 1. Check if Recommendations.jsx has AI integration
echo "1. Checking Recommendations.jsx AI integration...\n";
$recommendationsPath = 'resources/js/Pages/Recommendations.jsx';

if (file_exists($recommendationsPath)) {
    $content = file_get_contents($recommendationsPath);
    
    // Check for AI-related code
    $aiFeatures = [
        'useAI' => strpos($content, 'useAI') !== false,
        'aiRecommendations' => strpos($content, 'aiRecommendations') !== false,
        'AI-powered' => strpos($content, 'AI-powered') !== false,
        'loading states' => strpos($content, 'loading') !== false,
        'toggle' => strpos($content, 'toggle') !== false || strpos($content, 'Toggle') !== false,
    ];
    
    echo "   📋 AI Features Found:\n";
    foreach ($aiFeatures as $feature => $found) {
        $status = $found ? "✅" : "❌";
        echo "      {$status} {$feature}\n";
    }
    
    // Check for API endpoints
    $hasApiCalls = strpos($content, '/api/') !== false || strpos($content, 'axios') !== false;
    echo "      " . ($hasApiCalls ? "✅" : "❌") . " API calls\n";
    
} else {
    echo "   ❌ Recommendations.jsx not found\n";
}

// 2. Test API routes accessibility
echo "\n2. Testing API route registration...\n";
try {
    // Check if routes are registered
    $output = shell_exec('php artisan route:list --path=ai 2>&1');
    
    if (strpos($output, 'ai/recommendations') !== false) {
        echo "   ✅ AI recommendations route registered\n";
    } else {
        echo "   ❌ AI recommendations route not found\n";
    }
    
    if (strpos($output, 'api/ai/test-connection') !== false) {
        echo "   ✅ AI test connection route registered\n";
    } else {
        echo "   ❌ AI test connection route not found\n";
    }
    
} catch (Exception $e) {
    echo "   ❌ Error checking routes: " . $e->getMessage() . "\n";
}

// 3. Test AI service configuration
echo "\n3. Testing AI service configuration...\n";
$voyageConfig = config('services.voyage');

if (!empty($voyageConfig['api_key'])) {
    echo "   ✅ Voyage API key configured\n";
    echo "   🔑 Key length: " . strlen($voyageConfig['api_key']) . " characters\n";
} else {
    echo "   ❌ Voyage API key not configured\n";
}

if (!empty($voyageConfig['base_url'])) {
    echo "   ✅ Voyage base URL configured: " . $voyageConfig['base_url'] . "\n";
} else {
    echo "   ❌ Voyage base URL not configured\n";
}

if (!empty($voyageConfig['model'])) {
    echo "   ✅ Voyage model configured: " . $voyageConfig['model'] . "\n";
} else {
    echo "   ❌ Voyage model not configured\n";
}

// 4. Test database tables
echo "\n4. Testing database tables...\n";
try {
    $skillEmbeddingsCount = \DB::table('skill_embeddings')->count();
    echo "   📊 Skill embeddings in database: {$skillEmbeddingsCount}\n";
    
    if ($skillEmbeddingsCount > 0) {
        echo "   ✅ Skill embeddings table populated\n";
        
        // Show sample skills
        $sampleSkills = \DB::table('skill_embeddings')->limit(5)->pluck('skill_name');
        echo "   📝 Sample skills: " . implode(', ', $sampleSkills->toArray()) . "\n";
    } else {
        echo "   ⚠️  Skill embeddings table empty\n";
    }
    
} catch (Exception $e) {
    echo "   ❌ Database error: " . $e->getMessage() . "\n";
}

// 5. Test AI service instantiation
echo "\n5. Testing AI service instantiation...\n";
try {
    $embeddingService = new \App\Services\AIEmbeddingService();
    echo "   ✅ AIEmbeddingService instantiated successfully\n";
    
    // Test connection
    if ($embeddingService->testConnection()) {
        echo "   ✅ AI service connection test passed\n";
    } else {
        echo "   ❌ AI service connection test failed\n";
    }
    
} catch (Exception $e) {
    echo "   ❌ AI service error: " . $e->getMessage() . "\n";
}

// 6. Check for required JavaScript dependencies
echo "\n6. Checking JavaScript dependencies...\n";
$packageJsonPath = 'package.json';

if (file_exists($packageJsonPath)) {
    $packageJson = json_decode(file_get_contents($packageJsonPath), true);
    
    $requiredDeps = ['axios', 'react', '@inertiajs/react'];
    $dependencies = array_merge(
        $packageJson['dependencies'] ?? [],
        $packageJson['devDependencies'] ?? []
    );
    
    foreach ($requiredDeps as $dep) {
        if (isset($dependencies[$dep])) {
            echo "   ✅ {$dep}: " . $dependencies[$dep] . "\n";
        } else {
            echo "   ❌ {$dep}: Not found\n";
        }
    }
} else {
    echo "   ❌ package.json not found\n";
}

echo "\n🎯 Frontend AI Integration Test Completed!\n";
echo "📋 Summary:\n";
echo "   - Recommendations.jsx AI features: Checked\n";
echo "   - API routes: Checked\n";
echo "   - AI service configuration: Checked\n";
echo "   - Database tables: Checked\n";
echo "   - AI service instantiation: Checked\n";
echo "   - JavaScript dependencies: Checked\n";

echo "\n💡 Next Steps:\n";
echo "   1. Navigate to /ai/recommendations in browser to test UI\n";
echo "   2. Test AI toggle functionality\n";
echo "   3. Verify loading states work correctly\n";
echo "   4. Check that fallback mechanisms work when AI is disabled\n";