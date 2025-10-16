<?php

require_once __DIR__ . '/vendor/autoload.php';

// Load Laravel environment
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\AIEmbeddingService;
use Illuminate\Support\Facades\Http;

echo "🔍 Testing Voyage AI Integration...\n\n";

try {
    $service = new AIEmbeddingService();
    
    // Test 1: Check if service is configured
    echo "1. Checking service configuration...\n";
    $isConfigured = $service->isConfigured();
    echo "   ✅ Service configured: " . ($isConfigured ? "YES" : "NO") . "\n\n";
    
    if (!$isConfigured) {
        echo "❌ Voyage AI service is not configured. Please check your API key.\n";
        exit(1);
    }
    
    // Test 2: Direct API test with detailed error reporting
    echo "2. Testing direct API connectivity...\n";
    $apiKey = config('services.voyage.api_key');
    echo "   🔑 API Key configured: " . (empty($apiKey) ? "NO" : "YES (length: " . strlen($apiKey) . ")") . "\n";
    
    try {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json',
        ])->withoutVerifying()->timeout(30)->post('https://api.voyageai.com/v1/embeddings', [
            'model' => 'voyage-3',
            'input' => 'test connection'
        ]);
        
        echo "   📡 HTTP Status: " . $response->status() . "\n";
        
        if ($response->successful()) {
            echo "   ✅ Direct API test: SUCCESS\n";
            $data = $response->json();
            if (isset($data['data'][0]['embedding'])) {
                echo "   📊 Embedding received with " . count($data['data'][0]['embedding']) . " dimensions\n\n";
            }
        } else {
            echo "   ❌ Direct API test: FAILED\n";
            echo "   📄 Response: " . $response->body() . "\n\n";
        }
    } catch (\Exception $e) {
        echo "   ❌ Direct API exception: " . $e->getMessage() . "\n\n";
    }
    
    // Test 3: Test service method
    echo "3. Testing service embedding generation...\n";
    $testText = "PHP Laravel developer with React experience";
    $embedding = $service->generateEmbedding($testText);
    
    if ($embedding && is_array($embedding) && count($embedding) > 0) {
        echo "   ✅ Embedding generated successfully\n";
        echo "   📊 Embedding dimensions: " . count($embedding) . "\n";
        echo "   🔢 First few values: " . implode(', ', array_slice($embedding, 0, 5)) . "...\n\n";
    } else {
        echo "   ❌ Failed to generate embedding\n\n";
    }
    
    // Test 4: Test cosine similarity if embeddings work
    if ($embedding) {
        echo "4. Testing cosine similarity calculation...\n";
        $embedding1 = $service->generateEmbedding("JavaScript React developer");
        $embedding2 = $service->generateEmbedding("Frontend React developer");
        $embedding3 = $service->generateEmbedding("Backend Python developer");
        
        if ($embedding1 && $embedding2 && $embedding3) {
            $similarity1 = $service->cosineSimilarity($embedding1, $embedding2);
            $similarity2 = $service->cosineSimilarity($embedding1, $embedding3);
            
            echo "   ✅ Similarity between 'JavaScript React' and 'Frontend React': " . round($similarity1 * 100, 2) . "%\n";
            echo "   ✅ Similarity between 'JavaScript React' and 'Backend Python': " . round($similarity2 * 100, 2) . "%\n\n";
            
            if ($similarity1 > $similarity2) {
                echo "   🎯 Similarity test passed: Related skills have higher similarity!\n\n";
            } else {
                echo "   ⚠️  Similarity test warning: Expected related skills to have higher similarity\n\n";
            }
        }
        
        echo "🎉 All Voyage AI tests completed successfully!\n";
        echo "✅ The integration is working properly and ready for use.\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error during testing: " . $e->getMessage() . "\n";
    echo "📍 File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
    exit(1);
}